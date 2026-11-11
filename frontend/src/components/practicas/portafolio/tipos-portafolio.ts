import { DocumentoDto, FaseActualPractica, TipoDocumento } from '@/lib/tipos/pp/general-pp';
import {
  obtenerUrlPrevisualizacionCartaAsignacionPp,
  obtenerUrlPrevisualizacionDocumentoPortafolio,
} from '@/lib/utilidades/proxy-url';

export type EstadoDocumentoPortafolio = 'pendiente' | 'subido' | 'aprobado' | 'rechazado';

export interface DocumentoPortafolioItem {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoDocumento;
  estado: EstadoDocumentoPortafolio;
  fechaSubida?: string;
  fechaRevision?: string;
  comentario?: string;
  requerido: boolean;
  etapaMinima: FaseActualPractica;
  url?: string;
  dbId?: number | string;
  archivoNombre?: string;
}

import { extraerFechaIso } from '@/lib/utilidades/fechas';

export const formatearFechaIsoCorta = extraerFechaIso;

export function obtenerEstadoDocBase(
  tipo: TipoDocumento,
  documentosUsuario: DocumentoDto[],
  esVistaEstudiante: boolean,
  avalEmitido: boolean,
  validadoCpp: boolean = false
): EstadoDocumentoPortafolio {
  if (esVistaEstudiante && ['SEGUIMIENTO_TA', 'INFORME_FINAL', 'CERTIFICADO_CUMPLIMIENTO'].includes(tipo)) {
    if (!validadoCpp) {
      return 'pendiente';
    }
  }

  const doc = documentosUsuario.find((d) => d.tipo === tipo);
  if (!doc) return 'pendiente';
  if (doc.estado === 'RECHAZADO') return 'rechazado';
  if (!doc.url || doc.url === '') return 'pendiente';
  if (doc.estado === 'APROBADO') return 'aprobado';
  if (tipo === 'CARTA_ASIGNACION' || tipo === 'AVAL') return 'aprobado';
  return 'subido';
}

export function generarConfiguracionPortafolio(
  documentosUsuario: DocumentoDto[],
  asignacionEstado: string | undefined,
  esVistaEstudiante: boolean,
  avalEmitido: boolean,
  validadoCpp: boolean = false,
  rol?: string
): DocumentoPortafolioItem[] {
  const obtenerEstadoLocal = (tipo: TipoDocumento) =>
    obtenerEstadoDocBase(tipo, documentosUsuario, esVistaEstudiante, avalEmitido, validadoCpp);

  const docCv = documentosUsuario.find((d) => d.tipo === 'CV');
  const docCedula = documentosUsuario.find((d) => d.tipo === 'DOCUMENTO_IDENTIDAD');
  const docCarta = documentosUsuario.find((d) => d.tipo === 'CARTA_ASIGNACION');
  const docSeguimiento = documentosUsuario.find((d) => d.tipo === 'SEGUIMIENTO_TA');
  const docInforme = documentosUsuario.find((d) => d.tipo === 'INFORME_FINAL');
  const docCertificado = documentosUsuario.find((d) => d.tipo === 'CERTIFICADO_CUMPLIMIENTO');
  const docAval = documentosUsuario.find((d) => d.tipo === 'AVAL');

  const puedeVerObservacionesTutoria =
    !esVistaEstudiante && (rol === 'TUTOR_ACADEMICO' || rol === 'COORDINADOR_PRACTICAS');

  const resolverUrl = (d?: DocumentoDto) => {
    if (!d || !d.url) return undefined;
    return d.id ? obtenerUrlPrevisualizacionDocumentoPortafolio(d.id) : d.url;
  };

  return [
    {
      id: 'doc_cv',
      nombre: '1. Hoja de Vida (CV)',
      descripcion: 'Formato estándar FICA con datos académicos y personales en formato PDF',
      tipo: 'CV',
      estado: obtenerEstadoLocal('CV'),
      fechaSubida: formatearFechaIsoCorta(docCv?.fechaSubida),
      comentario: docCv?.observacion,
      requerido: true,
      etapaMinima: 'CONVOCATORIA',
      url: resolverUrl(docCv),
      dbId: docCv?.id,
      archivoNombre: docCv?.nombre,
    },
    {
      id: 'doc_cedula',
      nombre: '2. Copia de Identificación',
      descripcion: 'Cédula o Pasaporte escaneado en formato legible',
      tipo: 'DOCUMENTO_IDENTIDAD',
      estado: obtenerEstadoLocal('DOCUMENTO_IDENTIDAD'),
      fechaSubida: formatearFechaIsoCorta(docCedula?.fechaSubida),
      comentario: docCedula?.observacion,
      requerido: true,
      etapaMinima: 'CONVOCATORIA',
      url: resolverUrl(docCedula),
      dbId: docCedula?.id,
      archivoNombre: docCedula?.nombre,
    },
    {
      id: 'doc_asignacion',
      nombre: '3. Carta de Asignación',
      descripcion: 'Documento oficial generado por el Director de Carrera',
      tipo: 'CARTA_ASIGNACION',
      estado: obtenerEstadoLocal('CARTA_ASIGNACION'),
      fechaSubida: formatearFechaIsoCorta(docCarta?.fechaSubida),
      requerido: true,
      etapaMinima: 'ASIGNACION',
      url:
        resolverUrl(docCarta) ||
        (docCarta?.asignacionId
          ? obtenerUrlPrevisualizacionCartaAsignacionPp(docCarta.asignacionId)
          : undefined),
      dbId: docCarta?.id,
      archivoNombre: docCarta?.nombre,
    },
    {
      id: 'doc_seguimiento_ta',
      nombre: '4. Monitoreo de seguimiento',
      descripcion: 'Formulario de seguimiento realizado por el Tutor Académico',
      tipo: 'SEGUIMIENTO_TA',
      estado: obtenerEstadoLocal('SEGUIMIENTO_TA'),
      fechaSubida: formatearFechaIsoCorta(docSeguimiento?.fechaSubida),
      comentario: puedeVerObservacionesTutoria ? docSeguimiento?.observacion : undefined,
      requerido: true,
      etapaMinima: 'DESARROLLO',
      url: resolverUrl(docSeguimiento),
      dbId: docSeguimiento?.id,
      archivoNombre: docSeguimiento?.nombre,
    },
    {
      id: 'doc_informe_final',
      nombre: '5. Informe final de prácticas',
      descripcion: 'Control de actividades firmado por el Tutor Académico',
      tipo: 'INFORME_FINAL',
      estado: obtenerEstadoLocal('INFORME_FINAL'),
      fechaSubida: formatearFechaIsoCorta(docInforme?.fechaSubida),
      comentario: puedeVerObservacionesTutoria ? docInforme?.observacion : undefined,
      requerido: true,
      etapaMinima: 'DESARROLLO',
      url: resolverUrl(docInforme),
      dbId: docInforme?.id,
      archivoNombre: docInforme?.nombre,
    },
    {
      id: 'doc_cert_cumplimiento',
      nombre: '6. Certificado de cumplimiento de prácticas',
      descripcion: 'Certificado de culminación de actividades firmado por el Tutor Académico',
      tipo: 'CERTIFICADO_CUMPLIMIENTO',
      estado: obtenerEstadoLocal('CERTIFICADO_CUMPLIMIENTO'),
      fechaSubida: formatearFechaIsoCorta(docCertificado?.fechaSubida),
      comentario: puedeVerObservacionesTutoria ? docCertificado?.observacion : undefined,
      requerido: true,
      etapaMinima: 'DESARROLLO',
      url: resolverUrl(docCertificado),
      dbId: docCertificado?.id,
      archivoNombre: docCertificado?.nombre,
    },
    {
      id: 'doc_aval',
      nombre: '7. Aval de Cumplimiento',
      descripcion: 'Certificado final emitido por Subdecanato tras concluir las prácticas',
      tipo: 'AVAL',
      estado:
        Boolean(docAval?.url) &&
        (asignacionEstado === 'APROBADO' ||
          asignacionEstado === 'COMPLETADO' ||
          docAval?.estado === 'APROBADO' ||
          avalEmitido)
          ? 'aprobado'
          : 'pendiente',
      fechaSubida: formatearFechaIsoCorta(docAval?.fechaSubida),
      requerido: true,
      etapaMinima: 'FINALIZACION',
      url: resolverUrl(docAval),
      dbId: docAval?.id,
      archivoNombre: docAval?.nombre,
    },
  ];
}
