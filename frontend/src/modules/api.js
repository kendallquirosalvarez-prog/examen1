import { BASE_URL, TIEMPO_MAXIMO_MS } from "./config.js";
import { ErrorApi } from "./errores.js";
import { obtenerToken, olvidarSesion } from "./auth.js";

export const request = async (ruta, opciones = {}) => {
  const headers = { Accept: "application/json", ...opciones.headers };

  const token = obtenerToken();
  // el token va en el encabezado, no en la url
  if (token) headers.Authorization = `Bearer ${token}`;

  // si el body es un objeto se manda como json
  let body = opciones.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  // se cancela a los 8 segundos
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const response = await fetch(`${BASE_URL}${ruta}`, {
      ...opciones,
      headers,
      body,
      signal: controlador.signal,
    });

    // el 204 no trae cuerpo
    if (response.status === 204) return null;

    const datos = await response.json().catch(() => ({}));

    if (!response.ok) {
      // sesion vencida: se borra el token y vuelve al login
      if (response.status === 401) {
        olvidarSesion();
        window.location.reload();
      }
      throw new ErrorApi(response.status, datos);
    }

    return datos;
  } finally {
    clearTimeout(temporizador);
  }
};
