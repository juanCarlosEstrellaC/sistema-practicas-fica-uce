import { manejarErrorFetch } from '../utilidades/cliente-http';
import { API_URL } from './configuracion';

/**
 * Obtiene las notificaciones destinadas a un usuario específico.
 * @param usuarioId Identificador del usuario.
 * @returns Promesa con la lista de notificaciones.
 */
export async function obtenerNotificaciones(usuarioId: string): Promise<any[]> {
  if (!usuarioId) return [];
  try {
    const respuesta = await fetch(`${API_URL}/notificaciones/usuario/${usuarioId}?page=0&size=50&sort=id,desc&t=${new Date().getTime()}`, {
      cache: 'no-store'
    });
    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        console.warn(`[notificaciones] Recurso no encontrado (404) para usuario ${usuarioId}`);
        return [];
      }
      await manejarErrorFetch(respuesta, 'Error al obtener notificaciones');
    }
    const data = await respuesta.json();
    return data.data?.content || [];
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

/**
 * Marca una notificacion especifica como leida.
 * @param id Identificador de la notificacion.
 */
export async function marcarNotificacionLeida(id: string): Promise<any> {
  if (!id) return null;
  try {
    const respuesta = await fetch(`${API_URL}/notificaciones/${id}/leer`, { method: 'PATCH' });
    if (!respuesta.ok) {
      await manejarErrorFetch(respuesta, 'Error al marcar notificacion como leida');
    }
    return respuesta.json();
  } catch (error) {
    console.error('Error al marcar notificacion como leida:', error);
    return null;
  }
}

/**
 * Marca todas las notificaciones no leidas de un usuario como leidas.
 * @param usuarioId Identificador del usuario.
 */
export async function marcarTodasNotificacionesLeidas(usuarioId: string): Promise<any> {
  if (!usuarioId) return null;
  try {
    const respuesta = await fetch(`${API_URL}/notificaciones/usuario/${usuarioId}/leer-todas`, { method: 'PATCH' });
    if (!respuesta.ok) {
      await manejarErrorFetch(respuesta, 'Error al marcar todas las notificaciones como leídas');
    }
    return respuesta.json();
  } catch (error) {
    console.error('Error al marcar todas como leidas:', error);
    return null;
  }
}

/**
 * Resuelve y normaliza URLs de notificaciones garantizando el aislamiento estricto por rol,
 * extrayendo entidades (proyectos, estudiantes) y preservando los parametros de apertura de modales/filtros.
 */
export function resolverRutaNotificacion(
  notificacion?: { accionUrl?: string; titulo?: string; mensaje?: string } | string | null,
  rol?: string
): string | null {
  if (!notificacion) return null;

  const accionUrl = typeof notificacion === 'string' ? notificacion : (notificacion.accionUrl || '');
  const titulo = typeof notificacion === 'object' ? (notificacion.titulo || '') : '';
  const mensaje = typeof notificacion === 'object' ? (notificacion.mensaje || '') : '';

  const [rutaBase, query] = (accionUrl.trim() || '').split('?');
  const params = new URLSearchParams(query || '');
  const esEstudiante = rol === 'ESTUDIANTE';

  const textoCompleto = `${titulo} ${mensaje}`.toLowerCase();

  // Reglas estrictas para ESTUDIANTE
  if (esEstudiante) {
    if (rutaBase.includes('vinculacion') || rutaBase.startsWith('/dashboard/vcs') || textoCompleto.includes('vcs') || textoCompleto.includes('vinculacion')) {
      if (
        rutaBase.includes('progreso-general') ||
        rutaBase.includes('horas') ||
        rutaBase.includes('certificado') ||
        textoCompleto.includes('certificado') ||
        textoCompleto.includes('horas')
      ) {
        return `/dashboard/vinculacion/progreso-general${params.toString() ? `?${params.toString()}` : ''}`;
      }
      return `/dashboard/vinculacion/mi-proyecto${params.toString() ? `?${params.toString()}` : ''}`;
    }

    if (rutaBase.startsWith('/dashboard') || textoCompleto.includes('practica') || textoCompleto.includes('portafolio')) {
      if (
        accionUrl.includes('portafolio') ||
        accionUrl.includes('doc_') ||
        textoCompleto.includes('documento') ||
        textoCompleto.includes('portafolio')
      ) {
        return `/dashboard/practicas/mi-practica${query ? `?${query}` : ''}`;
      }
      return `/dashboard/practicas/mi-practica${params.toString() ? `?${params.toString()}` : ''}`;
    }

    return `/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // Reglas para Roles Docentes y Administrativos (TUTOR, SUBDECANO, DIRECTOR, COORDINADOR)

  // 1. Aislamiento prioritario para Prácticas Preprofesionales (PP)
  // Si la rutaBase ya apunta explícitamente a PP o contiene openEstudiante, se preserva en PP
  // y se previene que palabras como 'certificado' o 'informe' la desvíen erróneamente a VCS.
  const esRutaPP =
    rutaBase.startsWith('/dashboard/practicas') ||
    rutaBase.includes('/practicas/') ||
    params.has('openEstudiante') ||
    params.get('tab') === 'estudiantes';

  if (esRutaPP) {
    if (
      rutaBase.includes('/estudiantes') ||
      params.has('openEstudiante') ||
      params.get('tab') === 'estudiantes'
    ) {
      params.delete('tab');
      return `/dashboard/practicas/estudiantes${params.toString() ? `?${params.toString()}` : ''}`;
    }

    if (rutaBase.includes('/matriz-caces') || params.get('tab') === 'matriz-caces') {
      params.delete('tab');
      return `/dashboard/practicas/matriz-caces${params.toString() ? `?${params.toString()}` : ''}`;
    }

    if (rutaBase.includes('/convenios') || params.get('tab') === 'convenios') {
      if (
        textoCompleto.includes('observacion') ||
        textoCompleto.includes('observación') ||
        rutaBase.includes('observaciones') ||
        query.includes('observaciones')
      ) {
        params.set('subtab', 'observaciones');
        if (params.has('observacionId')) {
          params.set('abrirObservacion', 'true');
        }
      }
      params.delete('tab');
      return `/dashboard/practicas/convenios${params.toString() ? `?${params.toString()}` : ''}`;
    }

    params.delete('tab');
    return `${rutaBase}${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // 2. Detección de Validación de Horas, Certificado, Evidencias, Asignaciones de Estudiante en VCS (TIENE PRIORIDAD EN VCS)
  const esValidacionHorasOEvidenciasVcs =
    rutaBase.includes('/vinculacion/asignaciones') ||
    rutaBase.includes('/vinculacion/evidencias') ||
    rutaBase.includes('/vinculacion/estudiante') ||
    ((textoCompleto.includes('certificado') && !textoCompleto.includes('cumplimiento') && !textoCompleto.includes('práctica') && !textoCompleto.includes('practica')) && !textoCompleto.includes('carta')) ||
    textoCompleto.includes('validación de horas') ||
    textoCompleto.includes('validacion de horas') ||
    textoCompleto.includes('bitácora') ||
    textoCompleto.includes('bitacora') ||
    textoCompleto.includes('evidencia') ||
    (textoCompleto.includes('estudiantes asignados') && (textoCompleto.includes('vcs') || textoCompleto.includes('comunitario'))) ||
    (textoCompleto.includes('estudiante') && (textoCompleto.includes('aprobación') || textoCompleto.includes('aprobacion') || textoCompleto.includes('horas')) && (textoCompleto.includes('vcs') || textoCompleto.includes('vinculacion') || rutaBase.includes('vinculacion')));

  // 2. Detección de Reporte de Proyecto VCS (Informes institucionales del coordinador al subdecano)
  const esReporteOProyecto =
    !esValidacionHorasOEvidenciasVcs && (
      rutaBase.includes('/reportes') ||
      rutaBase.includes('/proyectos') ||
      textoCompleto.includes('reporte de proyecto') ||
      textoCompleto.includes('informe vcs') ||
      textoCompleto.includes('revisión de informe') ||
      textoCompleto.includes('revision de informe') ||
      textoCompleto.includes('nuevo reporte') ||
      (textoCompleto.includes('informe (') && !textoCompleto.includes('estudiante'))
    );

  if (esValidacionHorasOEvidenciasVcs) {
    if (params.has('asignacionId')) {
      if (rol === 'SUBDECANO' || textoCompleto.includes('certificado') || textoCompleto.includes('validación de horas') || textoCompleto.includes('validacion de horas')) {
        params.set('abrirAprobarHoras', 'true');
      } else {
        params.set('abrirEvidencias', 'true');
      }
    }
    return `/dashboard/vinculacion/asignaciones-existentes${params.toString() ? `?${params.toString()}` : ''}`;
  }

  if (esReporteOProyecto && (rutaBase.includes('vinculacion') || rutaBase.startsWith('/dashboard/vcs') || textoCompleto.includes('vcs') || textoCompleto.includes('proyecto') || textoCompleto.includes('informe') || textoCompleto.includes('reporte'))) {
    if (params.has('proyectoId')) {
      params.set('abrirReportes', 'true');
    }
    return `/dashboard/vinculacion/proyectos-comunitarios${params.toString() ? `?${params.toString()}` : ''}`;
  }

  if (rutaBase.startsWith('/dashboard/vcs')) {
    if (rutaBase.includes('/tutores')) {
      return `/dashboard/vinculacion/tutores${params.toString() ? `?${params.toString()}` : ''}`;
    }
    return `/dashboard/vinculacion/proyectos-comunitarios${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // 3. Detección de Notificaciones de Prácticas Preprofesionales (PP)
  // Casos: tab=estudiantes, openEstudiante, o mención a carta de asignación / estudiante asignado / matriz-caces
  const esNotificacionEstudiantesPP =
    params.get('tab') === 'estudiantes' ||
    params.has('openEstudiante') ||
    textoCompleto.includes('carta de asignación') ||
    textoCompleto.includes('carta de asignacion') ||
    textoCompleto.includes('emisión de carta') ||
    textoCompleto.includes('emision de carta') ||
    (textoCompleto.includes('estudiante') && textoCompleto.includes('asignado a su cargo')) ||
    rutaBase.includes('/practicas/estudiantes');

  if (esNotificacionEstudiantesPP && !esEstudiante) {
    params.delete('tab');
    return `/dashboard/practicas/estudiantes${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // Matriz CACES
  if ((params.get('tab') === 'matriz-caces' || textoCompleto.includes('matriz caces') || textoCompleto.includes('matriz-caces')) && !esEstudiante) {
    params.delete('tab');
    return `/dashboard/practicas/matriz-caces${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // 4. Detección de Observación / Convenio en PP
  const esObservacionConvenio =
    rutaBase.includes('convenio') ||
    rutaBase.includes('observacion') ||
    textoCompleto.includes('observacion') ||
    textoCompleto.includes('observación') ||
    textoCompleto.includes('convenio');

  if (esObservacionConvenio && !esEstudiante) {
    if (textoCompleto.includes('observacion') || textoCompleto.includes('observación') || rutaBase.includes('observaciones') || query.includes('observaciones')) {
      params.set('subtab', 'observaciones');
      if (params.has('observacionId')) {
        params.set('abrirObservacion', 'true');
      }
    }
    return `/dashboard/practicas/convenios${params.toString() ? `?${params.toString()}` : ''}`;
  }

  // Si un docente/administrador tiene un enlace a mi-proyecto
  if (rutaBase === '/dashboard/vinculacion/mi-proyecto' || rutaBase === '/dashboard/vinculacion/estudiante') {
    return `/dashboard/vinculacion/asignaciones-existentes${params.toString() ? `?${params.toString()}` : ''}`;
  }

  return rutaBase ? `${rutaBase}${params.toString() ? `?${params.toString()}` : ''}` : '/dashboard';
}

/**
 * Crea una notificación desde el frontend (consumiendo el endpoint POST /notificaciones)
 */
export async function crearNotificacionApi(dto: {
  usuarioId: string | number
  titulo: string
  mensaje: string
  tipo: string
  accionUrl?: string
}): Promise<any> {
  const respuesta = await fetch(`${API_URL}/notificaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al crear la notificación')
  }
  return respuesta.json()
}
