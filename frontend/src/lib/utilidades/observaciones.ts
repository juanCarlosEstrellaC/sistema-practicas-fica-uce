export interface DesgloseObservacion {
  descripcion: string;
  motivoRechazo: string | null;
}

/**
 * Desglosa el texto de una observacion o tramite para separar la justificacion original
 * del motivo de rechazo agregado posteriormente por la autoridad.
 */
export function desglosarDescripcionObservacion(texto?: string | null): DesgloseObservacion {
  if (!texto) {
    return { descripcion: '', motivoRechazo: null };
  }

  const limpio = texto.trim();
  const patron = /^(?:([\s\S]*?)(?:\r?\n|\s)+)?Motivo de rechazo:\s*([\s\S]*)$/i;
  const match = limpio.match(patron);

  if (match) {
    const descripcion = match[1]?.trim() || '';
    const motivoRechazo = match[2]?.trim() || null;
    return {
      descripcion,
      motivoRechazo: motivoRechazo || null,
    };
  }

  return {
    descripcion: limpio,
    motivoRechazo: null,
  };
}
