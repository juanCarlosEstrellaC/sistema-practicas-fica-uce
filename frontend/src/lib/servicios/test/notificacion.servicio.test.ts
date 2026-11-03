import { describe, it, expect } from 'vitest';
import { resolverRutaNotificacion } from '../notificacion.servicio';

describe('resolverRutaNotificacion (Deep-Linking Limpio y Resiliente)', () => {
  it('debe retornar null si la notificación es nula o indefinida', () => {
    expect(resolverRutaNotificacion(null)).toBeNull();
    expect(resolverRutaNotificacion(undefined)).toBeNull();
  });

  describe('Rol ESTUDIANTE', () => {
    it('debe dirigir a progreso general si la notificación incluye horas o certificados', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/progreso-general',
          titulo: 'Horas Aprobadas',
          mensaje: 'Se han aprobado 80 horas de vinculación',
        },
        'ESTUDIANTE'
      );
      expect(ruta).toBe('/dashboard/vinculacion/progreso-general');
    });

    it('debe dirigir a mi-proyecto para notificaciones de VCS', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/mi-proyecto',
          titulo: 'Inicio de Proyecto',
          mensaje: 'Tu proyecto ha iniciado',
        },
        'ESTUDIANTE'
      );
      expect(ruta).toBe('/dashboard/vinculacion/mi-proyecto');
    });

    it('debe dirigir a mi-practica para notificaciones de portafolio o prácticas', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/practicas/mi-practica?doc_id=12',
          titulo: 'Documento Observado',
          mensaje: 'Revisa tu documento de portafolio',
        },
        'ESTUDIANTE'
      );
      expect(ruta).toBe('/dashboard/practicas/mi-practica?doc_id=12');
    });
  });

  describe('Roles Docentes y Administrativos (VCS y PP)', () => {
    it('debe resolver aprobación de horas para SUBDECANO preservando asignacionId sin inyectar busqueda', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/asignaciones-existentes?asignacionId=50',
          titulo: 'Validación de Horas y Certificado VCS Pendiente',
          mensaje: 'El estudiante Juan Pérez ha completado sus horas',
        },
        'SUBDECANO'
      );

      expect(ruta).toBe(
        '/dashboard/vinculacion/asignaciones-existentes?asignacionId=50&abrirAprobarHoras=true'
      );
      expect(ruta).not.toContain('busqueda');
    });

    it('debe resolver evidencias para TUTOR_ACADEMICO preservando asignacionId sin inyectar busqueda', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/asignaciones-existentes?asignacionId=77',
          titulo: 'Nueva Evidencia de VCS Recibida',
          mensaje: 'El estudiante Maria Lopez ha subido evidencias',
        },
        'TUTOR_ACADEMICO'
      );

      expect(ruta).toBe(
        '/dashboard/vinculacion/asignaciones-existentes?asignacionId=77&abrirEvidencias=true'
      );
      expect(ruta).not.toContain('busqueda');
    });

    it('no debe inyectar parametros de apertura si la notificacion no incluye asignacionId', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/asignaciones-existentes',
          titulo: 'Asignaciones del Periodo',
          mensaje: 'Consulte el estado de las asignaciones',
        },
        'SUBDECANO'
      );

      expect(ruta).toBe('/dashboard/vinculacion/asignaciones-existentes');
      expect(ruta).not.toContain('abrirAprobarHoras');
      expect(ruta).not.toContain('busqueda');
    });

    it('debe resolver reporte de proyecto preservando proyectoId sin inyectar busqueda', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/vinculacion/proyectos-comunitarios?proyectoId=10',
          titulo: 'Nuevo Reporte de Proyecto VCS',
          mensaje: 'Se ha subido un informe para el proyecto Comunitario 1',
        },
        'SUBDECANO'
      );

      expect(ruta).toBe(
        '/dashboard/vinculacion/proyectos-comunitarios?proyectoId=10&abrirReportes=true'
      );
      expect(ruta).not.toContain('busqueda');
    });

    it('debe resolver observaciones de convenios con observacionId sin inyectar busqueda', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/practicas/convenios?observacionId=5',
          titulo: 'Nueva Observación de Convenio',
          mensaje: 'Se remitió una propuesta de convenio',
        },
        'SUBDECANO'
      );

      expect(ruta).toBe(
        '/dashboard/practicas/convenios?observacionId=5&subtab=observaciones&abrirObservacion=true'
      );
      expect(ruta).not.toContain('busqueda');
    });

    it('debe resolver notificaciones de emision de carta para COORDINADOR_PRACTICAS hacia la ruta de estudiantes', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard?tab=estudiantes&openEstudiante=5&periodoId=1',
          titulo: 'Emisión de Carta de Asignación',
          mensaje: 'Emitir carta de asignación al estudiante Carlos Pérez',
        },
        'COORDINADOR_PRACTICAS'
      );

      expect(ruta).toBe('/dashboard/practicas/estudiantes?openEstudiante=5&periodoId=1');
    });

    it('debe resolver rechazo de Certificado de Cumplimiento hacia prácticas estudiantes y no hacia vinculación', () => {
      const ruta = resolverRutaNotificacion(
        {
          accionUrl: '/dashboard/practicas/estudiantes?openEstudiante=12',
          titulo: 'Documento Rechazado',
          mensaje: 'El documento Juan Carlos Estrella Caicedo - Certificado_Cumplimiento.pdf ha sido rechazado. Observación: faltan firmas',
        },
        'TUTOR_ACADEMICO'
      );

      expect(ruta).toBe('/dashboard/practicas/estudiantes?openEstudiante=12');
      expect(ruta).not.toContain('vinculacion');
    });
  });
});
