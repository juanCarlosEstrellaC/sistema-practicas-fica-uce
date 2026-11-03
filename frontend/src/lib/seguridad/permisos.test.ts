import { describe, it, expect } from 'vitest';
import { PERMISOS, tienePermiso, normalizarRol } from './permisos';

describe('Matriz de Permisos (lib/permisos.ts)', () => {
  it('debe permitir acceso al SUBDECANO para crear, editar y eliminar proyectos comunitarios', () => {
    expect(tienePermiso('SUBDECANO', PERMISOS.PROYECTOS_CREAR)).toBe(true);
    expect(tienePermiso('SUBDECANO', PERMISOS.PROYECTOS_EDITAR)).toBe(true);
    expect(tienePermiso('SUBDECANO', PERMISOS.PROYECTOS_ELIMINAR)).toBe(true);
    expect(tienePermiso('SUBDECANO', PERMISOS.PROYECTOS_VER)).toBe(true);
  });

  it('debe permitir a DIRECTOR_CARRERA y TUTOR_ACADEMICO ver proyectos pero no crearlos ni eliminarlos', () => {
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.PROYECTOS_VER)).toBe(true);
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.PROYECTOS_CREAR)).toBe(false);
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.PROYECTOS_ELIMINAR)).toBe(false);

    expect(tienePermiso('TUTOR_ACADEMICO', PERMISOS.PROYECTOS_VER)).toBe(true);
    expect(tienePermiso('TUTOR_ACADEMICO', PERMISOS.PROYECTOS_CREAR)).toBe(false);
    expect(tienePermiso('TUTOR_ACADEMICO', PERMISOS.PROYECTOS_ELIMINAR)).toBe(false);
  });

  it('no debe permitir al ESTUDIANTE ver ni modificar proyectos comunitarios', () => {
    expect(tienePermiso('ESTUDIANTE', PERMISOS.PROYECTOS_VER)).toBe(false);
    expect(tienePermiso('ESTUDIANTE', PERMISOS.PROYECTOS_CREAR)).toBe(false);
    expect(tienePermiso('ESTUDIANTE', PERMISOS.PROYECTOS_EDITAR)).toBe(false);
    expect(tienePermiso('ESTUDIANTE', PERMISOS.PROYECTOS_ELIMINAR)).toBe(false);
  });

  it('debe permitir solo a COORDINADOR_PRACTICAS subir reportes, pero no a DIRECTOR_CARRERA ni a SUBDECANO', () => {
    expect(tienePermiso('COORDINADOR_PRACTICAS', PERMISOS.REPORTES_SUBIR)).toBe(true);
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.REPORTES_SUBIR)).toBe(false);
    expect(tienePermiso('SUBDECANO', PERMISOS.REPORTES_SUBIR)).toBe(false);
  });

  it('debe permitir solo a COORDINADOR_PRACTICAS asociar proyectos a tutores, no a DIRECTOR_CARRERA ni a SUBDECANO', () => {
    expect(tienePermiso('COORDINADOR_PRACTICAS', PERMISOS.TUTORES_ASOCIAR_PROYECTOS)).toBe(true);
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.TUTORES_ASOCIAR_PROYECTOS)).toBe(false);
    expect(tienePermiso('SUBDECANO', PERMISOS.TUTORES_ASOCIAR_PROYECTOS)).toBe(false);
  });

  it('no debe permitir a SUBDECANO revisar ni ver evidencias de asignaciones', () => {
    expect(tienePermiso('SUBDECANO', PERMISOS.EVIDENCIAS_REVISAR)).toBe(false);
    expect(tienePermiso('SUBDECANO', PERMISOS.EVIDENCIAS_VER)).toBe(false);
    expect(tienePermiso('TUTOR_ACADEMICO', PERMISOS.EVIDENCIAS_REVISAR)).toBe(true);
    expect(tienePermiso('TUTOR_ACADEMICO', PERMISOS.EVIDENCIAS_VER)).toBe(true);
  });

  it('no debe permitir a SUBDECANO ni DIRECTOR_CARRERA crear asignaciones, solo a COORDINADOR_PRACTICAS', () => {
    expect(tienePermiso('SUBDECANO', PERMISOS.ASIGNACIONES_CREAR)).toBe(false);
    expect(tienePermiso('DIRECTOR_CARRERA', PERMISOS.ASIGNACIONES_CREAR)).toBe(false);
    expect(tienePermiso('COORDINADOR_PRACTICAS', PERMISOS.ASIGNACIONES_CREAR)).toBe(true);
  });

  it('debe manejar roles nulos o indefinidos retornando false', () => {
    expect(tienePermiso(undefined, PERMISOS.PROYECTOS_VER)).toBe(false);
    expect(tienePermiso(null, PERMISOS.PROYECTOS_VER)).toBe(false);
  });

  describe('normalizarRol', () => {
    it('debe normalizar acronimos y variantes a su rol estandar', () => {
      expect(normalizarRol('CPP')).toBe('COORDINADOR_PRACTICAS');
      expect(normalizarRol('coordinador')).toBe('COORDINADOR_PRACTICAS');
      expect(normalizarRol('DC')).toBe('DIRECTOR_CARRERA');
      expect(normalizarRol('director')).toBe('DIRECTOR_CARRERA');
      expect(normalizarRol('SUB')).toBe('SUBDECANO');
      expect(normalizarRol('subdecanato')).toBe('SUBDECANO');
      expect(normalizarRol('TA')).toBe('TUTOR_ACADEMICO');
      expect(normalizarRol('tutor')).toBe('TUTOR_ACADEMICO');
      expect(normalizarRol('EST')).toBe('ESTUDIANTE');
      expect(normalizarRol('estud')).toBe('ESTUDIANTE');
      expect(normalizarRol('SUBDECANO')).toBe('SUBDECANO');
      expect(normalizarRol('')).toBe('');
      expect(normalizarRol(undefined)).toBe('');
      expect(normalizarRol(null)).toBe('');
    });
  });
});
