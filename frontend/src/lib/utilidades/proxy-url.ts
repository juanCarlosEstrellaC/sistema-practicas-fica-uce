/**
 * Adapta rutas relativas o URLs de archivos y previsualizaciones para consumirse
 * mediante el proxy interno de Next.js (/api/proxy/[...path]).
 *
 * Esto es necesario porque:
 * 1. Los visores de PDF en iframe, imágenes y enlaces de descarga no pueden adjuntar
 *    manualmente el encabezado 'Authorization: Bearer' requerido por Spring Boot.
 * 2. El proxy interno inyecta el token de sesión seguro desde las cookies y elimina
 *    la cabecera 'x-frame-options: DENY' para permitir previsualizaciones en modal.
 */
export function adaptarUrlProxy(urlStr?: string | null): string {
  if (!urlStr) return '';
  if (urlStr.startsWith('/api/proxy')) {
    return urlStr;
  }
  if (urlStr.startsWith('/archivos_subidos')) {
    return `/api/proxy${urlStr}`;
  }
  if (urlStr.startsWith('archivos_subidos/')) {
    return `/api/proxy/${urlStr}`;
  }
  if (urlStr.startsWith('/api/')) {
    return `/api/proxy${urlStr.replace('/api/', '/')}`;
  }
  const indiceArchivos = urlStr.indexOf('/archivos_subidos/');
  if (indiceArchivos !== -1) {
    return `/api/proxy${urlStr.substring(indiceArchivos)}`;
  }
  // Redireccion de compatibilidad si viene la ruta legada /usuarios/avatars/...
  if (urlStr.startsWith('/usuarios/avatars/')) {
    return `/api/proxy/archivos_subidos/avatars/${urlStr.substring('/usuarios/avatars/'.length)}`;
  }
  // Rutas de descarga y previsualizacion de documentos dinamicos
  const indiceAsignacionPractica = urlStr.indexOf('/asignaciones-practicas/');
  if (indiceAsignacionPractica !== -1) {
    return `/api/proxy${urlStr.substring(indiceAsignacionPractica)}`;
  }
  if (
    urlStr.startsWith('/asignaciones-practicas') ||
    urlStr.startsWith('/asignaciones-proyectos-comunitarios') ||
    urlStr.startsWith('/documentos') ||
    urlStr.startsWith('/convenios') ||
    urlStr.startsWith('/proyectos-comunitarios') ||
    urlStr.startsWith('/evidencias-vcs')
  ) {
    return `/api/proxy${urlStr}`;
  }
  return urlStr;
}

/**
 * Retorna la URL relativa para previsualizar el Aval Oficial de culminacion de practicas.
 */
export function obtenerUrlPrevisualizacionAvalPp(asignacionId: number | string): string {
  return `/asignaciones-practicas/${asignacionId}/aval/preview`;
}

/**
 * Retorna la URL relativa para previsualizar la Carta de Asignacion de practicas.
 */
export function obtenerUrlPrevisualizacionCartaAsignacionPp(asignacionId: number | string): string {
  return `/asignaciones-practicas/${asignacionId}/carta-asignacion/preview`;
}
