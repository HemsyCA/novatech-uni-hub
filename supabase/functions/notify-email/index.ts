// Envía los correos de la convocatoria desde la cuenta Gmail del equipo.
// Lo llaman los triggers de 20261021000000_notificaciones_correo.sql con
// { tipo, id }. Nunca confía en el contenido de la petición: vuelve a leer el
// registro y registra el envío en notificaciones_correo antes de mandarlo,
// así cada correo sale una sola vez aunque alguien llame a la función.
//
// Secrets (Supabase → Edge Functions → notify-email → Secrets):
//   GMAIL_USER          correo del equipo, ej. novatech.equipo@gmail.com
//   GMAIL_APP_PASSWORD  contraseña de aplicación de Google (16 caracteres)
//   SITE_URL            opcional, por defecto https://novatech-uni-hub.vercel.app
import { createClient } from "jsr:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

type Tipo = "inscripcion" | "convocado" | "miembro";

interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://novatech-uni-hub.vercel.app").replace(/\/$/, "");

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Supabase bloquea el puerto 587 en Edge Functions; Gmail acepta SMTPS en 465.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: Deno.env.get("GMAIL_USER"), pass: Deno.env.get("GMAIL_APP_PASSWORD") },
});

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
};

const limaToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());

// Los nombres los escribe quien se inscribe: se escapan antes de meterlos al HTML.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const layout = (title: string, paragraphs: string[], cta?: { label: string; url: string }) => `
<div style="background:#000;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#0d0d0d;border:1px solid #262626;border-radius:16px;padding:32px;color:#e5e5e5">
    <p style="margin:0 0 24px;font-size:14px;letter-spacing:3px;color:#fff;font-weight:bold">NOVA<span style="color:#a78bfa">TECH</span></p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#fff">${title}</h1>
    ${paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${p}</p>`).join("")}
    ${
      cta
        ? `<p style="margin:24px 0 0"><a href="${cta.url}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">${cta.label}</a></p>`
        : ""
    }
    <p style="margin:28px 0 0;font-size:12px;color:#737373">Nova Tech · Equipo de robótica de la UNI. Si tienes dudas, responde a este correo.</p>
  </div>
</div>`;

const toText = (title: string, paragraphs: string[], cta?: { label: string; url: string }) =>
  [title, "", ...paragraphs.map((p) => p.replace(/<[^>]+>/g, "")), ...(cta ? ["", `${cta.label}: ${cta.url}`] : [])].join("\n");

const build = (to: string, subject: string, title: string, paragraphs: string[], cta?: { label: string; url: string }): Email => ({
  to,
  subject,
  html: layout(title, paragraphs, cta),
  text: toText(title, paragraphs, cta),
});

const firstName = (name: string | null | undefined) => (name ?? "").trim().split(/\s+/)[0] || "";

// Para convocados y miembros se usa el nombre de su perfil o, si aún no
// tienen cuenta, el de su inscripción más reciente.
async function findName(email: string): Promise<string> {
  const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("email", email).maybeSingle();
  if (profile?.full_name) return profile.full_name;
  const { data: application } = await supabaseAdmin
    .from("academia_inscripciones")
    .select("nombre")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return application?.nombre ?? "";
}

async function buildEmail(tipo: Tipo, id: string): Promise<Email | null> {
  if (tipo === "inscripcion") {
    const { data } = await supabaseAdmin.from("academia_inscripciones").select("email, nombre").eq("id", id).maybeSingle();
    if (!data) return null;
    const hola = escapeHtml(firstName(data.nombre));
    return build(data.email, "Recibimos tu inscripción a Nova Tech", `¡Hola${hola ? `, ${hola}` : ""}!`, [
      "Recibimos tu inscripción a la convocatoria de <b>Academia Nova</b>.",
      "La directiva revisará tu solicitud y, cuando te asigne a un grupo, te llegará otro correo con las fechas de tu curso.",
      `Usa este mismo correo (<b>${escapeHtml(data.email)}</b>) para iniciar sesión en la web: tu acceso quedará ligado a él.`,
    ]);
  }

  if (tipo === "convocado") {
    const { data } = await supabaseAdmin
      .from("academia_miembros")
      .select("email, ends_at_override, academia_grupos(nombre, starts_at, ends_at)")
      .eq("id", id)
      .maybeSingle();
    // Relación muchos-a-uno: PostgREST devuelve un objeto, no una lista.
    const grupo = data?.academia_grupos as unknown as { nombre: string; starts_at: string; ends_at: string } | null;
    if (!data || !grupo) return null;

    const endsAt = data.ends_at_override ?? grupo.ends_at;
    if (endsAt < limaToday()) return null;

    const hola = escapeHtml(firstName(await findName(data.email)));
    const empieza = grupo.starts_at > limaToday()
      ? `Tu curso empieza el <b>${formatDate(grupo.starts_at)}</b> y tienes acceso hasta el <b>${formatDate(endsAt)}</b>.`
      : `Tu curso ya está disponible y tienes acceso hasta el <b>${formatDate(endsAt)}</b>.`;
    return build(data.email, "¡Fuiste aceptado en Academia Nova!", `¡Felicidades${hola ? `, ${hola}` : ""}!`, [
      `Fuiste aceptado en la convocatoria de Nova Tech, en el grupo <b>${escapeHtml(grupo.nombre)}</b>.`,
      empieza,
      `Para entrar, inicia sesión con este mismo correo (<b>${escapeHtml(data.email)}</b>), con Google o creando tu cuenta con correo y contraseña. Luego abre Academia Nova desde tu cuenta.`,
    ], { label: "Entrar a Academia Nova", url: `${SITE_URL}/academia` });
  }

  const { data } = await supabaseAdmin.from("nova_miembros").select("email").eq("id", id).maybeSingle();
  if (!data) return null;
  const hola = escapeHtml(firstName(await findName(data.email)));
  return build(data.email, "¡Bienvenido a Nova Tech!", `¡Bienvenido al equipo${hola ? `, ${hola}` : ""}!`, [
    "Ahora eres <b>miembro de Nova Tech</b>.",
    "Tienes acceso a la Zona de miembros, con material interno de nuestros robots, componentes y PCBs.",
    `Inicia sesión con este mismo correo (<b>${escapeHtml(data.email)}</b>) para verla.`,
  ], { label: "Ir a la Zona de miembros", url: `${SITE_URL}/miembros` });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const { tipo, id } = (await req.json().catch(() => ({}))) as { tipo?: Tipo; id?: string };
  if (!tipo || !["inscripcion", "convocado", "miembro"].includes(tipo) || !id || !UUID_RE.test(id)) {
    return json({ error: "bad request" }, 400);
  }

  const email = await buildEmail(tipo, id);
  if (!email) return json({ skipped: true });

  // Reserva el envío: si ya existe la fila, este correo ya salió (o está saliendo).
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("notificaciones_correo")
    .upsert({ tipo, ref_id: id, email: email.to }, { onConflict: "tipo,ref_id", ignoreDuplicates: true })
    .select("id");
  if (claimError) {
    console.error("No se pudo registrar el envío", claimError);
    return json({ error: "log failed" }, 500);
  }
  if (!claimed || claimed.length === 0) return json({ skipped: true, reason: "already sent" });

  try {
    await transporter.sendMail({
      from: { name: "NovaTech", address: Deno.env.get("GMAIL_USER")! },
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    await supabaseAdmin.from("notificaciones_correo").update({ enviado_at: new Date().toISOString() }).eq("id", claimed[0].id);
    return json({ sent: true });
  } catch (error) {
    console.error(`Error enviando ${tipo} a ${email.to}`, error);
    await supabaseAdmin.from("notificaciones_correo").update({ error: String(error) }).eq("id", claimed[0].id);
    return json({ error: "send failed" }, 502);
  }
});
