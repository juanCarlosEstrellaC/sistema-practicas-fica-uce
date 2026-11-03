/**
 * Funcion auxiliar para capturar y lanzar errores de peticiones fetch
 * extrayendo el mensaje de error original devuelto por el backend.
 */
export async function manejarErrorFetch(respuesta: Response, mensajeBase: string): Promise<never> {
  let mensajeError = mensajeBase;
  try {
    const tipoContenido = respuesta.headers.get('content-type') || '';
    const textoRespuesta = await respuesta.text();

    if (textoRespuesta) {
      const textoLimpio = textoRespuesta.trim();
      const esHtml = textoLimpio.startsWith('<') || tipoContenido.includes('text/html');

      if (!esHtml) {
        try {
          const datosJson = JSON.parse(textoLimpio);
          if (datosJson.mensaje && typeof datosJson.mensaje === 'string') {
            mensajeError = datosJson.mensaje;
          } else if (datosJson.message && typeof datosJson.message === 'string') {
            mensajeError = datosJson.message;
          } else if (datosJson.error && typeof datosJson.error === 'string') {
            mensajeError = datosJson.error;
          } else {
            mensajeError = `${mensajeBase}: ${textoLimpio}`;
          }
        } catch (errorParseo) {
          mensajeError = `${mensajeBase}: ${textoLimpio}`;
        }
      } else {
        if (respuesta.status === 404) {
          mensajeError = `${mensajeBase}: Recurso no encontrado o servicio no disponible (404)`;
        } else if (respuesta.status >= 500) {
          mensajeError = `${mensajeBase}: Error interno del servidor (${respuesta.status})`;
        } else {
          mensajeError = `${mensajeBase} (${respuesta.status}: ${respuesta.statusText || 'Error en el servidor'})`;
        }
      }
    }
  } catch (errorLectura) {
    // Si falla la lectura, se mantiene el mensajeBase
  }
  throw new Error(mensajeError);
}
