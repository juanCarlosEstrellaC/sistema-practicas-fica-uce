/**
 * Utilidades para el manejo, validacion y formateo de fechas.
 */

export function formatearFecha(fechaIso: string | undefined | null, incluirHora: boolean = true): string {
  if (!fechaIso) return '';
  try {
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) return String(fechaIso);

    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    if (incluirHora) {
      opciones.hour = '2-digit';
      opciones.minute = '2-digit';
    }
    return new Intl.DateTimeFormat('es-EC', opciones).format(fecha);
  } catch (e) {
    return String(fechaIso);
  }
}

/**
 * Formatea una fecha YYYY-MM-DD o ISO string a DD/MM/YYYY sin desfasaje por zona horaria.
 */
export function formatearFechaCorta(fechaStr?: string | null): string {
  if (!fechaStr) return 'No definida';
  // Si contiene T o espacio, extraemos solo la parte YYYY-MM-DD
  const soloFecha = fechaStr.split('T')[0].split(' ')[0];
  const partes = soloFecha.split('-');
  if (partes.length === 3) {
    const [year, month, day] = partes;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return fechaStr;
}

/**
 * Valida que la fecha de fin sea estrictamente posterior a la de inicio.
 */
export function validarFechas(fechaInicio: string, fechaFin: string): string | null {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return null;
  if (fin <= inicio) {
    return 'La fecha de finalización debe ser estrictamente posterior a la fecha de inicio.';
  }
  return null;
}

/**
 * Extrae la parte de fecha YYYY-MM-DD de un string ISO de forma segura.
 */
export function extraerFechaIso(fechaStr?: string | null): string | undefined {
  if (!fechaStr) return undefined;
  try {
    return fechaStr.split('T')[0].split(' ')[0];
  } catch {
    return fechaStr;
  }
}
