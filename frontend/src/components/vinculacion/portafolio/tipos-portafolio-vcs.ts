import { EvidenciaVcs, TipoDocumentoVcs } from '@/lib/tipos/vcs/evidencia-vcs';
import {
  AsignacionProyectoComunitarioDto,
  FaseActualAsignacion,
} from '@/lib/tipos/vcs/asignacion-proyecto';
import { extraerFechaIso } from '@/lib/utilidades/fechas';

export type EstadoDocumentoPortafolioVcs = 'pendiente' | 'subido' | 'aprobado' | 'rechazado';

export type TipoItemPortafolioVcs = TipoDocumentoVcs | 'CERTIFICADO_VCS';

export interface DocumentoPortafolioVcsItem {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoItemPortafolioVcs;
  estado: EstadoDocumentoPortafolioVcs;
  fechaSubida?: string;
  fechaRevision?: string;
  comentario?: string;
  requerido: boolean;
  etapaMinima: FaseActualAsignacion;
  url?: string;
  dbId?: number | string;
  archivoNombre?: string;
}

export const formatearFechaIsoCorta = extraerFechaIso;

export function encontrarEvidenciaPorTipo(
  tipo: TipoDocumentoVcs,
  evidencias: EvidenciaVcs[]
): EvidenciaVcs | undefined {
  const porTipoExacto = evidencias.find((e) => e.tipoDocumento === tipo);
  if (porTipoExacto) {
    return porTipoExacto;
  }

  // Respaldo solo para registros heredados sin tipoDocumento explicito
  return evidencias.find(
    (e) =>
      !e.tipoDocumento &&
      Boolean(e.nombreArchivo) &&
      e.nombreArchivo.toLowerCase().includes(tipo.toLowerCase())
  );
}

export function obtenerEstadoEvidenciaBase(
  tipo: TipoDocumentoVcs,
  evidencias: EvidenciaVcs[]
): EstadoDocumentoPortafolioVcs {
  const evi = encontrarEvidenciaPorTipo(tipo, evidencias);
  if (!evi || !evi.urlArchivo || evi.urlArchivo.trim() === '') {
    return 'pendiente';
  }
  if (evi.estadoTutor === 'OBSERVADO') {
    return 'rechazado';
  }
  if (evi.estadoTutor === 'APROBADO') {
    return 'aprobado';
  }
  return 'subido';
}

export function generarConfiguracionPortafolioVcs(
  evidencias: EvidenciaVcs[],
  asignacion?: Partial<AsignacionProyectoComunitarioDto> | null
): DocumentoPortafolioVcsItem[] {
  const docBitacora = encontrarEvidenciaPorTipo('BITACORA', evidencias);
  const docInforme = encontrarEvidenciaPorTipo('INFORME_FINAL', evidencias);

  const estadoAsignacion = asignacion?.estado;
  const certificadoEmitido =
    estadoAsignacion === 'APROBADO' ||
    Boolean(asignacion?.urlCertificado && asignacion.urlCertificado.trim() !== '');

  const nombreEstudiante = asignacion?.nombreCompletoEstudiante || 'Estudiante';
  const nombreCarrera = asignacion?.nombreCarrera || 'Carrera';
  const nombreArchivoCertificado = `${nombreEstudiante} - Certificado VCS.pdf`;

  const urlCertificado = certificadoEmitido
    ? (asignacion?.id
        ? `/asignaciones-proyectos-comunitarios/${asignacion.id}/certificado-horas/preview`
        : asignacion?.urlCertificado)
    : undefined;

  return [
    {
      id: 'doc_bitacora',
      nombre: '1. Bitácora de Actividades',
      descripcion:
        'Registro detallado de actividades comunitarias y control de asistencia en formato PDF',
      tipo: 'BITACORA',
      estado: obtenerEstadoEvidenciaBase('BITACORA', evidencias),
      fechaSubida: formatearFechaIsoCorta(docBitacora?.fechaSubida),
      fechaRevision: formatearFechaIsoCorta(docBitacora?.fechaRevisionTutor || undefined),
      comentario: docBitacora?.observacionesTutor || undefined,
      requerido: true,
      etapaMinima: 'DESARROLLO',
      url: docBitacora?.id
        ? `/evidencias-vcs/${docBitacora.id}/preview`
        : docBitacora?.urlArchivo,
      dbId: docBitacora?.id,
      archivoNombre: docBitacora?.nombreArchivo || 'Bitacora_Actividades.pdf',
    },
    {
      id: 'doc_informe_final',
      nombre: '2. Informe Final de Vinculación',
      descripcion:
        'Informe técnico consolidado de resultados, beneficiarios y conclusiones firmado y evaluado',
      tipo: 'INFORME_FINAL',
      estado: obtenerEstadoEvidenciaBase('INFORME_FINAL', evidencias),
      fechaSubida: formatearFechaIsoCorta(docInforme?.fechaSubida),
      fechaRevision: formatearFechaIsoCorta(docInforme?.fechaRevisionTutor || undefined),
      comentario: docInforme?.observacionesTutor || undefined,
      requerido: true,
      etapaMinima: 'DESARROLLO',
      url: docInforme?.id
        ? `/evidencias-vcs/${docInforme.id}/preview`
        : docInforme?.urlArchivo,
      dbId: docInforme?.id,
      archivoNombre: docInforme?.nombreArchivo || 'Informe_Final_Vinculacion.pdf',
    },
    {
      id: 'doc_certificado_vcs',
      nombre: '3. Certificado de Acreditación de Horas',
      descripcion:
        'Certificado oficial emitido por Subdecanato tras validar el cumplimiento de horas de vinculación',
      tipo: 'CERTIFICADO_VCS',
      estado: certificadoEmitido ? 'aprobado' : 'pendiente',
      fechaSubida: formatearFechaIsoCorta(asignacion?.fechaFin),
      requerido: true,
      etapaMinima: 'FINALIZACION',
      url: urlCertificado,
      dbId: asignacion?.id,
      archivoNombre: nombreArchivoCertificado,
    },
  ];
}
