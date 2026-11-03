/**
 * Utilidades para el formateo de texto, nombres y titulos academicos.
 */

export function formatearNombreCorto(nombreCompleto: string): string {
  if (!nombreCompleto) return '';

  // 1. Limpieza de titulos y grados academicos comunes
  const nombreLimpio = nombreCompleto
    .replace(/\b(Ing|Dr|Dra|Dis|Lic|Lcdo|Lcda|Abg|Arq|Mgtr|Msc|Phd)\b\.?\s*/gi, '')
    .replace(/,\s*(MSc|PhD|M\.Sc)\.?/gi, '')
    .replace(/\s+(MSc|PhD|M\.Sc)\.?/gi, '')
    .replace(/,\s*$/, '')
    .trim();

  const partes = nombreLimpio
    .split(/\s+/)
    .map(p => p.replace(/[,\.]$/, ''))
    .filter(p => p.length > 1);

  if (partes.length === 0) return nombreCompleto;
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} ${partes[1]}`;

  // Si tiene 3 o mas partes (ej: Juan Pablo Perez Lopez), primer nombre y primer apellido
  return `${partes[0]} ${partes[2]}`;
}

/**
 * Obtiene las 2 iniciales estandarizadas a partir de nombre y apellido,
 * o de un nombre completo compuesto, limpiando previamente titulos academicos.
 */
export function obtenerIniciales(nombre?: string | null, apellido?: string | null): string {
  const patronTitulos = /\b(ing|dr|dra|dis|lic|lcdo|lcda|abg|arq|mgtr|msc|phd)\b\.?\s*/gi;
  const nombreLimpio = (nombre || '').replace(patronTitulos, '').trim();
  const apellidoLimpio = (apellido || '').replace(patronTitulos, '').trim();

  // Si se pasan nombre y apellido por separado
  if (nombreLimpio && apellidoLimpio) {
    const parteNombre = nombreLimpio.split(/\s+/)[0] || '';
    const parteApellido = apellidoLimpio.split(/\s+/)[0] || '';
    return `${parteNombre[0] || ''}${parteApellido[0] || ''}`.toUpperCase();
  }

  // Si solo viene un nombre completo compuesto
  const cadenaCompleta = nombreLimpio || apellidoLimpio || '';
  if (!cadenaCompleta) return 'U';

  const nombreCorto = formatearNombreCorto(cadenaCompleta);
  const partes = nombreCorto.split(/\s+/).filter(Boolean);

  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  return partes[0]?.slice(0, 2).toUpperCase() || 'U';
}
