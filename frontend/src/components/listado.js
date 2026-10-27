import { listarEquipos, eliminarEquipo } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const POR_PAGINA = 6;

const $lista = document.querySelector("#lista-equipos");
const $plantilla = document.querySelector("#tpl-equipo");
const $resumen = document.querySelector("#resumen");
const $paginaActual = document.querySelector("#pagina-actual");
const $btnAnterior = document.querySelector("#btn-anterior");
const $btnSiguiente = document.querySelector("#btn-siguiente");

let paginaActual = 1;
let ultimaPagina = 1;

// YA IMPLEMENTADO — "2026-09-15" -> "15 set 2026"
export const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });

// Crea una tarjeta a partir de la plantilla; solo textContent con datos de la API
const crearTarjeta = (equipo) => {
  const $fragmento = $plantilla.content.cloneNode(true);
  const $li = $fragmento.querySelector("li");
  const $estado = $fragmento.querySelector(".estado");

  $li.dataset.id = equipo.id;
  $fragmento.querySelector(".codigo").textContent = equipo.codigo;
  $fragmento.querySelector(".nombre").textContent = equipo.nombre;
  $fragmento.querySelector(".categoria").textContent = equipo.categoria?.nombre ?? "Sin categoría";
  $fragmento.querySelector(".fecha").textContent = formatearFecha(equipo.fecha_adquisicion);
  $estado.textContent = equipo.estado;
  $estado.dataset.estado = equipo.estado;

  return $fragmento;
};

/**
 * [F2] Listado y paginación.
 */
export const cargarPagina = async (pagina = 1) => {
  $lista.setAttribute("aria-busy", "true");

  try {
    const { data, meta } = await listarEquipos(pagina, POR_PAGINA);

    paginaActual = meta.current_page;
    ultimaPagina = meta.last_page;

    $lista.replaceChildren();

    if (data.length === 0) {
      const $vacio = document.createElement("li");
      $vacio.className = "vacio";
      $vacio.textContent = "No hay equipos registrados.";
      $lista.append($vacio);
    } else {
      data.forEach((equipo) => $lista.append(crearTarjeta(equipo)));
    }

    $resumen.textContent = meta.total > 0
      ? `Mostrando ${meta.from}–${meta.to} de ${meta.total}`
      : "Mostrando 0 de 0";
    $paginaActual.textContent = `Página ${meta.current_page} de ${Math.max(meta.last_page, 1)}`;
    $btnAnterior.disabled = paginaActual <= 1;
    $btnSiguiente.disabled = paginaActual >= ultimaPagina;
  } catch (error) {
    mostrarMensaje("error", `No se pudo cargar el inventario: ${error.message}`);
  } finally {
    $lista.setAttribute("aria-busy", "false");
  }
};

/**
 * [F4] Eliminación con delegación de eventos: un solo listener en $lista.
 */
const alHacerClicEnLista = async (evento) => {
  const $boton = evento.target.closest(".btn-eliminar");
  if (!$boton) return;

  const $tarjeta = $boton.closest("li");
  const codigo = $tarjeta.querySelector(".codigo").textContent;
  if (!confirm(`¿Eliminar el equipo ${codigo}?`)) return;

  try {
    await eliminarEquipo($tarjeta.dataset.id);
    mostrarMensaje("exito", "Equipo eliminado.");

    // Si era el último de la página (y no es la primera), retrocede una página
    const quedoVacia = $lista.querySelectorAll(".tarjeta").length === 1;
    await cargarPagina(quedoVacia && paginaActual > 1 ? paginaActual - 1 : paginaActual);
  } catch (error) {
    if (error.status === 409) {
      mostrarMensaje("error", error.datos.mensaje);
    } else {
      mostrarMensaje("error", "No se pudo eliminar el equipo. Intente de nuevo.");
    }
  }
};

export const iniciarListado = () => {
  $lista.addEventListener("click", alHacerClicEnLista);

  // [F2] Botones de paginación
  $btnAnterior.addEventListener("click", () => cargarPagina(paginaActual - 1));
  $btnSiguiente.addEventListener("click", () => cargarPagina(paginaActual + 1));

  cargarPagina(1);
};
