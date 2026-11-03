'use server';

import { URL_BACKEND, obtenerCabecerasAutenticacion } from './cliente-servidor';

/**
 * Obtiene las notificaciones de un usuario directamente desde el backend.
 * Al ejecutarse como Server Action, no depende del proxy del cliente y adjunta el token JWT de sesion.
 */
export async function obtenerNotificacionesAccion(usuarioId: string | number): Promise<any[]> {
  if (!usuarioId) return [];

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/notificaciones/usuario/${usuarioId}?page=0&size=50&sort=id,desc&t=${Date.now()}`,
      {
        headers: cabeceras,
        cache: 'no-store',
      }
    );

    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        console.warn(`[notificaciones] Endpoint o usuario no encontrado (404) para id: ${usuarioId}`);
        return [];
      }
      console.error(`[notificaciones] Error al obtener notificaciones: ${respuesta.status} ${respuesta.statusText}`);
      return [];
    }

    const data = await respuesta.json();
    return data.data?.content || [];
  } catch (error) {
    console.error('[notificaciones] Error de conexion al obtener notificaciones:', error);
    return [];
  }
}

/**
 * Marca una notificacion individual como leida.
 */
export async function marcarNotificacionLeidaAccion(id: string | number): Promise<boolean> {
  if (!id) return false;

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/notificaciones/${id}/leer`, {
      method: 'PATCH',
      headers: cabeceras,
    });
    return respuesta.ok;
  } catch (error) {
    console.error('[notificaciones] Error al marcar notificacion como leida:', error);
    return false;
  }
}

/**
 * Marca todas las notificaciones pendientes de un usuario como leidas.
 */
export async function marcarTodasNotificacionesLeidasAccion(usuarioId: string | number): Promise<boolean> {
  if (!usuarioId) return false;

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/notificaciones/usuario/${usuarioId}/leer-todas`, {
      method: 'PATCH',
      headers: cabeceras,
    });
    return respuesta.ok;
  } catch (error) {
    console.error('[notificaciones] Error al marcar todas las notificaciones como leidas:', error);
    return false;
  }
}

/**
 * Crea una notificacion desde el backend (para roles administrativos).
 */
export async function crearNotificacionAccion(dto: {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  accionUrl?: string;
}): Promise<boolean> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/notificaciones`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(dto),
    });
    return respuesta.ok;
  } catch (error) {
    console.error('[notificaciones] Error al crear notificacion:', error);
    return false;
  }
}
