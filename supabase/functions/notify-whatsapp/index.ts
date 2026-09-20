// Recibe el payload de un Database Webhook de Supabase (INSERT en `orders` o
// `print_reservations`), arma los parámetros de una plantilla de WhatsApp
// aprobada por Meta y la manda a cada número configurado en
// BOARD_WHATSAPP_NUMBERS. Usa plantillas (type: "template") en vez de texto
// libre porque el texto libre solo se puede mandar dentro de la ventana de
// 24h en que el destinatario le escribió al número de negocio.
import { createClient } from "jsr:@supabase/supabase-js@2";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: "orders" | "print_reservations";
  record: Record<string, unknown>;
}

const TEMPLATE_LANGUAGE = "es_PE";

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

async function buildOrderParams(record: Record<string, unknown>): Promise<Record<string, string>> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("quantity, products(name)")
    .eq("order_id", record.id);

  const itemsList = (items ?? [])
    .map((item) => `${item.quantity}x ${(item as { products: { name: string } | null }).products?.name ?? "producto"}`)
    .join(", ");

  const { name, email } = await getCustomerName(record.user_id as string | null);

  return {
    customer_name: `${name}${email ? ` (${email})` : ""}`,
    products: itemsList || "sin detalle",
    total: String(record.total),
    order_code: String(record.transaction_code),
  };
}

async function buildReservationParams(record: Record<string, unknown>): Promise<Record<string, string>> {
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

  return {
    project_name: String(record.project_name),
    customer_name: name ?? "Cliente",
    printer_name: `${printer?.name ?? "sin asignar"}${material?.name ? ` (${material.name})` : ""}`,
    date: `${record.scheduled_date} ${record.scheduled_time}`,
    cost: String(record.estimated_cost),
  };
}

async function sendWhatsappTemplate(templateName: string, parameters: Record<string, string>) {
  const token = Deno.env.get("META_ACCESS_TOKEN")!;
  const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID")!;
  const numbers = (Deno.env.get("BOARD_WHATSAPP_NUMBERS") ?? "")
    .split(/[,;\s]+/)
    .map((n) => n.trim().replace(/^\+/, ""))
    .filter(Boolean);

  const components = [
    {
      type: "body",
      parameters: Object.entries(parameters).map(([parameter_name, text]) => ({
        type: "text",
        parameter_name,
        text,
      })),
    },
  ];

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
          type: "template",
          template: {
            name: templateName,
            language: { code: TEMPLATE_LANGUAGE },
            components,
          },
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

  let templateName: string;
  let params: Record<string, string>;

  if (payload.table === "orders") {
    templateName = "nuevo_pedido_novatech";
    params = await buildOrderParams(payload.record);
  } else if (payload.table === "print_reservations") {
    templateName = "nueva_reserva_3d_novatech";
    params = await buildReservationParams(payload.record);
  } else {
    return new Response(JSON.stringify({ skipped: true, reason: "unknown table" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const results = await sendWhatsappTemplate(templateName, params);

  return new Response(JSON.stringify({ sent: results.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
