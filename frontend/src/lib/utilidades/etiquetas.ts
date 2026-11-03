import type { FaseActualPractica, TipoDocumento } from '../tipos/pp/general-pp';
import type { RolUsuario } from '../tipos/general';

/**
 * Diccionarios y funciones auxiliares para resolucion de etiquetas legibles en la interfaz de usuario.
 */

export function obtenerEtiquetaFaseDePractica(fase: FaseActualPractica): string {
  const etiquetasFases: Record<FaseActualPractica, string> = {
    CONVOCATORIA: 'Postulacion',
    ASIGNACION: 'Asignacion',
    DESARROLLO: 'Desarrollo de Practicas',
    FINALIZACION: 'Finalizacion'
  };
  return etiquetasFases[fase] || fase;
}

export function obtenerNumeroFaseDePractica(fase: FaseActualPractica): number {
  const numerosFases: Record<FaseActualPractica, number> = {
    CONVOCATORIA: 1,
    ASIGNACION: 2,
    DESARROLLO: 3,
    FINALIZACION: 4
  };
  return numerosFases[fase] || 1;
}

export function obtenerEtiquetaRol(rol: RolUsuario): string {
  const etiquetasRoles: Record<RolUsuario, string> = {
    ESTUDIANTE: 'Estudiante',
    TUTOR_ACADEMICO: 'Tutor Academico',
    DIRECTOR_CARRERA: 'Director de Carrera',
    COORDINADOR_PRACTICAS: 'Coordinador de Practicas',
    SUBDECANO: 'Subdecano'
  };
  return etiquetasRoles[rol] || rol;
}

export function obtenerEtiquetaTipoDocumento(tipo: TipoDocumento): string {
  const etiquetasDocumentos: Record<TipoDocumento, string> = {
    CV: 'Hoja de Vida (CV)',
    DOCUMENTO_IDENTIDAD: 'Documento de Identidad',
    CARTA_ASIGNACION: 'Carta de Asignacion',
    SEGUIMIENTO_TA: 'Monitoreo de Seguimiento',
    INFORME_FINAL: 'Informe Final',
    CERTIFICADO_CUMPLIMIENTO: 'Certificado de Cumplimiento',
    AVAL: 'Aval de Cumplimiento',
    MATRIZ_CACES: 'Matriz CACES',
    EVIDENCIA: 'Evidencia'
  };
  return etiquetasDocumentos[tipo] || tipo;
}
