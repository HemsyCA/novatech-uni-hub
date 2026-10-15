// A dónde volver después de iniciar sesión (por ejemplo, a la tienda con el carrito lleno).
// Se guarda en el navegador para que sobreviva al viaje por Google o por el correo de confirmación.
const KEY = "nova-volver-a";
const DEFAULT = "/dashboard";

// Solo rutas internas: nunca otro sitio.
const isSafe = (path: string | null): path is string => !!path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/auth");

// Sin una ruta válida se borra la anterior, para no volver a una página de otra visita.
export const rememberReturnPath = (path: string | null) => {
  try {
    if (isSafe(path)) localStorage.setItem(KEY, path);
    else localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento, después de iniciar sesión se va al panel.
  }
};

// El inicio de sesión avisa por dos caminos casi a la vez; las dos llamadas deben ir al mismo lugar.
let lastTaken: { path: string; at: number } | null = null;

export const takeReturnPath = (): string => {
  if (lastTaken && Date.now() - lastTaken.at < 5000) return lastTaken.path;
  let path = DEFAULT;
  try {
    const saved = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (isSafe(saved)) path = saved;
  } catch {
    // Sin almacenamiento, al panel.
  }
  lastTaken = { path, at: Date.now() };
  return path;
};
