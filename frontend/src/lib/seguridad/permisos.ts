import { RolUsuario } from '@/lib/tipos/general';

/**
 * Matriz centralizada de permisos y roles del sistema.
 * Sirve de base tanto para el modulo de Vinculacion con la Sociedad (VCS)
 * como para Practicas Preprofesionales (PP).
 */
export const PERMISOS = {
  // VCS - Proyectos Comunitarios (VS1)
  PROYECTOS_CREAR: ['SUBDECANO'] as const,
  PROYECTOS_EDITAR: ['SUBDECANO'] as const,
  PROYECTOS_ELIMINAR: ['SUBDECANO'] as const,
  PROYECTOS_VER: ['SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO'] as const,

  // VCS - Asignacion de Estudiantes a Proyectos (VS2)
  ASIGNACIONES_CREAR: ['COORDINADOR_PRACTICAS'] as const,
  ASIGNACIONES_EDITAR: ['COORDINADOR_PRACTICAS'] as const,
  ASIGNACIONES_ELIMINAR: ['COORDINADOR_PRACTICAS'] as const,
  ASIGNACIONES_GESTIONAR: ['SUBDECANO', 'COORDINADOR_PRACTICAS'] as const,
  ASIGNACIONES_VER: ['SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO'] as const,
  ASIGNACIONES_REPROBAR: ['TUTOR_ACADEMICO'] as const,
  ASIGNACIONES_CANCELAR: ['COORDINADOR_PRACTICAS'] as const,
  TUTORES_ASOCIAR_PROYECTOS: ['COORDINADOR_PRACTICAS'] as const,

  // PP - Practicas Preprofesionales (General)
  PP_GESTIONAR: ['SUBDECANO', 'COORDINADOR_PRACTICAS', 'DIRECTOR_CARRERA'] as const,
  PP_VER: ['SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE'] as const,

  // VCS - Reportes, Evidencias y Aprobación de Horas (VS3)
  REPORTES_SUBIR: ['COORDINADOR_PRACTICAS'] as const,
  REPORTES_REVISAR: ['SUBDECANO'] as const,
  EVIDENCIAS_SUBIR: ['ESTUDIANTE'] as const,
  EVIDENCIAS_REVISAR: ['TUTOR_ACADEMICO'] as const,
  EVIDENCIAS_VER: ['TUTOR_ACADEMICO', 'DIRECTOR_CARRERA', 'ESTUDIANTE'] as const,
  HORAS_VCS_APROBAR: ['SUBDECANO'] as const,
} as const;

/**
 * Valida si un rol especifico se encuentra dentro de los roles permitidos para una accion.
 *
 * @param rolActual Rol del usuario en sesion
 * @param rolesPermitidos Lista de roles autorizados
 * @returns true si el usuario tiene permiso, false en caso contrario
 */
export function tienePermiso(
  rolActual: RolUsuario | undefined | null,
  rolesPermitidos: readonly RolUsuario[] | undefined | null
): boolean {
  if (!rolActual || !rolesPermitidos || !Array.isArray(rolesPermitidos)) return false;
  return rolesPermitidos.includes(rolActual);
}

/**
 * Normaliza un identificador o acronimo de rol a su representacion estandar RolUsuario o string.
 * Admite acronimos y alias comunes como 'CPP', 'COORDINADOR', 'DC', 'DIRECTOR', 'SUB', 'SUBDECANATO', etc.
 *
 * @param rol Identificador de rol a normalizar
 * @returns Rol estandar en mayusculas o cadena vacia
 */
export function normalizarRol(rol?: string | null): string {
  if (!rol) return '';
  const limpio = rol.trim().toUpperCase();
  if (limpio === 'CPP' || limpio === 'COORDINADOR') return 'COORDINADOR_PRACTICAS';
  if (limpio === 'TA' || limpio === 'TUTOR') return 'TUTOR_ACADEMICO';
  if (limpio === 'DC' || limpio === 'DIRECTOR') return 'DIRECTOR_CARRERA';
  if (limpio === 'SUB' || limpio === 'SUBDECANATO') return 'SUBDECANO';
  if (limpio === 'EST' || limpio === 'ESTUD') return 'ESTUDIANTE';
  return limpio;
}


