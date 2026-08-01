// Verifica que el dominio del correo tenga registros MX (servidores de correo) reales,
// usando el resolver DNS-over-HTTPS público de Google (gratis, sin API key).
// Devuelve:
//   true  -> el dominio existe y puede recibir correos
//   false -> el dominio no existe o no tiene servidores de correo
//   null  -> no se pudo verificar (problema de red); no debe bloquear el registro
export async function domainHasMailServers(email: string): Promise<boolean | null> {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;

  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.Status !== 0) return false;

    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return null;
  }
}
