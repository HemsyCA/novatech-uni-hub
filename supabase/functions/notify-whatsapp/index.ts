// Recibe el payload de un Database Webhook de Supabase (INSERT en `orders` o
// `print_reservations`), arma un mensaje legible y lo manda por WhatsApp
// (API de Meta / WhatsApp Cloud API) a cada número configurado en
// BOARD_WHATSAPP_NUMBERS. Manda texto libre (sin plantilla) porque esos
// números están agregados como "destinatarios de prueba" en la app de Meta.
import { createClient } from "jsr:@supabase/supabase-js@2";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: "orders" | "print_reservations";
  record: Record<string, unknown>;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getCustomerName(userId: string | null): Promise<{ name: string; email: string | null }> {
  if (!userId) return { name: "Cliente", email: null };

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", userId)
    .maybeSingle();

  return { name: data?.full_name ?? "Cliente", email: data?.email ?? null };
}

async function buildOrderMessage(record: Record<string, unknown>): Promise<string> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("quantity, products(name)")
    .eq("order_id", record.id);

  const itemsList = (items ?? [])
    .map((item) => `${item.quantity}x ${(item as { products: { name: string } | null }).products?.name ?? "producto"}`)
    .join(", ");

  const { name, email } = await getCustomerName(record.user_id as string | null);

  return [
    "🛒 *Nuevo pedido en NovaTech*",
    `Cliente: ${name}${email ? ` (${email})` : ""}`,
    `Productos: ${itemsList || "sin detalle"}`,
    `Total: S/ ${record.total}`,
    `Código: ${record.transaction_code}`,
  ].join("\n");
}

async function buildReservationMessage(record: Record<string, unknown>): Promise<string> {
  const [{ data: printer }, { data: material }] = await Promise.all([
    record.printer_id
      ? supabaseAdmin.from("printers").select("name").eq("id", record.printer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    record.material_id
      ? supabaseAdmin.from("print_materials").select("name").eq("id", record.material_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  let name = record.contact_name as string | null;
  if (!name && record.user_id) {
    name = (await getCustomerName(record.user_id as string)).name;
  }

  return [
    "🖨️ *Nueva reserva de impresión 3D*",
    `Proyecto: ${record.project_name}`,
    `Cliente: ${name ?? "Cliente"}`,
    `Impresora: ${printer?.name ?? "sin asignar"}${material?.name ? ` (${material.name})` : ""}`,
    `Fecha: ${record.scheduled_date} ${record.scheduled_time}`,
    `Costo estimado: S/ ${record.estimated_cost}`,
  ].join("\n");
}

async function sendWhatsapp(message: string) {
  const token = Deno.env.get("META_ACCESS_TOKEN")!;
  const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID")!;
  const numbers = (Deno.env.get("BOARD_WHATSAPP_NUMBERS") ?? "")
    .split(/[,;\s]+/)
    .map((n) => n.trim().replace(/^\+/, ""))
    .filter(Boolean);

  const results = await Promise.allSettled(
    numbers.map(async (to) => {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      });

      const body = await res.text();
      await supabaseAdmin.from("_whatsapp_debug").insert({
        to_number: to,
        http_status: res.status,
        body,
      });
      if (!res.ok) {
        console.error(`Meta API error for ${to}: ${res.status} ${body}`);
        throw new Error(`Meta API ${res.status}: ${body}`);
      }
      console.log(`Meta API ok for ${to}: ${body}`);
      return body;
    }),
  );

  return results;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as WebhookPayload;

  if (payload.type !== "INSERT") {
    return new Response(JSON.stringify({ skipped: true }), { headers: { "Content-Type": "application/json" } });
  }

  const message = payload.table === "orders"
    ? await buildOrderMessage(payload.record)
    : payload.table === "print_reservations"
      ? await buildReservationMessage(payload.record)
      : null;

  if (!message) {
    return new Response(JSON.stringify({ skipped: true, reason: "unknown table" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const results = await sendWhatsapp(message);

  return new Response(JSON.stringify({ sent: results.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
