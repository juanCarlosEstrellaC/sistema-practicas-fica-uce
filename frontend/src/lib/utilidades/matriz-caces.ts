import { EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';

/**
 * Genera el nombre estandarizado para la descarga de la Matriz CACES institucional.
 * Formato requerido: "Matriz CACES - {Nombre Carrera} - {Periodo} - {Firmada por DC | Firmada por CPP | Oficializada}.{ext}"
 */
export function formatearNombreDescargaMatrizCaces(
  carreraNombre?: string,
  periodoNombre?: string,
  estado?: EstadoMatrizCaces,
  archivoFirmadoUrl?: string | null
): string {
  const carrera = carreraNombre?.trim() || 'Carrera';
  const periodo = periodoNombre?.trim() || 'Periodo';
  const extension =
    archivoFirmadoUrl && archivoFirmadoUrl.toLowerCase().endsWith('.pdf')
      ? '.pdf'
      : archivoFirmadoUrl && archivoFirmadoUrl.toLowerCase().endsWith('.ods')
      ? '.ods'
      : '.xlsx';

  let sufijoFirma = '';
  if (estado === 'FIRMADA_POR_DC') {
    sufijoFirma = ' - Firmada por DC';
  } else if (estado === 'ENVIADA_A_SUBDECANO') {
    sufijoFirma = ' - Firmada por CPP';
  } else if (estado === 'FIRMADA_POR_SUBDECANO') {
    sufijoFirma = ' - Oficializada';
  }

  return `Matriz CACES - ${carrera} - ${periodo}${sufijoFirma}${extension}`;
}

