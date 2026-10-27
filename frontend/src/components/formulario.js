import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

const cargarCategorias = async () => {
  try {
    const { data } = await listarCategorias();
    data.forEach(({ id, nombre }) => {
      const $opcion = document.createElement("option");
      $opcion.value = id;
      $opcion.textContent = nombre;
      $selectCategoria.append($opcion);
    });
  } catch {
    mostrarMensaje("error", "No se pudieron cargar las categorías.");
  }
};

const limpiarErrores = () => {
  $form.querySelectorAll("[data-error]").forEach(($p) => ($p.textContent = ""));
  $form.querySelectorAll("[aria-invalid]").forEach(($campo) => $campo.removeAttribute("aria-invalid"));
};

const mostrarErrores = (errores) => {
  for (const [campo, [mensaje]] of Object.entries(errores)) {
    const $error = $form.querySelector(`[data-error="${campo}"]`);
    if ($error) $error.textContent = mensaje;
    $form.elements[campo]?.setAttribute("aria-invalid", "true");
  }
};

export const iniciarFormulario = ({ alGuardar }) => {
  cargarCategorias();

  $form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarErrores();

    const datos = Object.fromEntries(new FormData($form));
    datos.categoria_id = Number(datos.categoria_id);
    datos.costo_interno = Number(datos.costo_interno);

    const textoOriginal = $btnGuardar.textContent;
    $btnGuardar.disabled = true;
    $btnGuardar.textContent = "Guardando…";

    try {
      const { data } = await crearEquipo(datos);
      $form.reset();
      mostrarMensaje("exito", `Equipo ${data.codigo} registrado.`);
      alGuardar();
    } catch (error) {
      if (error.status === 422) {
        mostrarErrores(error.datos.errors ?? {});
      } else {
        mostrarMensaje("error", "No se pudo registrar el equipo. Intente de nuevo.");
      }
    } finally {
      $btnGuardar.disabled = false;
      $btnGuardar.textContent = textoOriginal;
    }
  });
};
