import { manejarErrorFetch } from '../utilidades/cliente-http';
import { API_URL } from './configuracion';

/**
 * Restablece la base de datos y borra archivos fisicos en el backend para reiniciar la simulacion.
 * @returns Promesa con el resultado de la operacion.
 */
export async function reiniciarSistemaApi(): Promise<any> {
  const respuesta = await fetch(`${API_URL}/sistema/reiniciar`, {
    method: 'POST'
  });
  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al reiniciar la base de datos y archivos en el servidor');
  }
  return respuesta.json();
}
