import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  obtenerMetricasDashboardGeneralAccion,
  obtenerMetricasVcsAccion,
  obtenerMetricasPpAccion,
} from '../metricas.acciones';

vi.mock('../cliente-servidor', () => ({
  URL_BACKEND: 'http://localhost:8080/api/v1',
  obtenerCabecerasAutenticacion: vi.fn(async () => ({ Authorization: 'Bearer mock-token' })),
  obtenerCabecerasSubidaArchivo: vi.fn(async () => ({ Authorization: 'Bearer mock-token' })),
  obtenerUsuarioServidor: vi.fn(async () => ({ id: 1, correo: 'admin@uce.edu.ec' })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions de Métricas (Dashboard General)', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  describe('obtenerMetricasDashboardGeneralAccion para rol ESTUDIANTE', () => {
    it('debe retornar métricas consolidadas cuando el estudiante tiene asignaciones en PP y VCS', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/asignaciones-practicas')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              exito: true,
              data: {
                content: [
                  {
                    id: 10,
                    estudianteId: 50,
                    estado: 'EN_CURSO',
                    fase: 'DESARROLLO',
                    horasCompletadas: 120,
                    horasAsignadas: 240,
                    convenioId: 2,
                    institucion: 'Empresa XYZ',
                    tutorAcademico: 'Docente PP',
                  },
                ],
                totalElements: 1,
              },
            }),
          });
        }

        if (url.includes('/asignaciones-proyectos-comunitarios')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              exito: true,
              data: {
                content: [
                  {
                    id: 20,
                    estudianteId: 50,
                    proyectoId: 5,
                    nombreProyecto: 'Proyecto Comunitario FICA',
                    estado: 'APROBADO',
                    faseActual: 'FINALIZACION',
                    horasCompletadas: 80,
                    horasAsignadas: 80,
                  },
                ],
                totalElements: 1,
              },
            }),
          });
        }

        return Promise.reject(new Error(`URL no mockeada: ${url}`));
      });

      const resultado = await obtenerMetricasDashboardGeneralAccion({
        rol: 'ESTUDIANTE',
        estudianteId: 50,
        periodoId: 100,
      });

      expect(resultado).toBeDefined();
      expect(resultado.pp.estudiantesAsignados).toBe(1);
      expect(resultado.pp.estudiantesEnCurso).toBe(1);
      expect(resultado.vcs.totalAsignaciones).toBe(1);
      expect(resultado.vcs.asignacionesCompletadas).toBe(1);
      expect(resultado.vcs.totalProyectos).toBe(1);

      expect(resultado.estudiante?.tienePractica).toBe(true);
      expect(resultado.estudiante?.horasPracticaCompletadas).toBe(120);
      expect(resultado.estudiante?.tieneVinculacion).toBe(true);
      expect(resultado.estudiante?.horasVinculacionCompletadas).toBe(80);
      expect(resultado.estudiante?.proyectoVinculacion).toBe('Proyecto Comunitario FICA');
      expect(resultado.estudiante?.estadoVinculacion).toBe('APROBADO');
    });

    it('debe manejar estudiante sin asignaciones VCS sin generar excepciones (contadores en cero)', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/asignaciones-practicas')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              exito: true,
              data: { content: [], totalElements: 0 },
            }),
          });
        }

        if (url.includes('/asignaciones-proyectos-comunitarios')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              exito: true,
              data: { content: [], totalElements: 0 },
            }),
          });
        }

        return Promise.reject(new Error(`URL no mockeada: ${url}`));
      });

      const resultado = await obtenerMetricasDashboardGeneralAccion({
        rol: 'ESTUDIANTE',
        estudianteId: 99,
      });

      expect(resultado).toBeDefined();
      expect(resultado.pp.estudiantesAsignados).toBe(0);
      expect(resultado.vcs.totalAsignaciones).toBe(0);
      expect(resultado.vcs.asignacionesEnCurso).toBe(0);
      expect(resultado.vcs.asignacionesCompletadas).toBe(0);
      expect(resultado.vcs.totalProyectos).toBe(0);

      expect(resultado.estudiante?.tienePractica).toBe(false);
      expect(resultado.estudiante?.tieneVinculacion).toBe(false);
      expect(resultado.estudiante?.horasVinculacionCompletadas).toBe(0);
    });

    it('debe consultar asignaciones en el backend incluso sin estudianteId explícito en filtros', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            exito: true,
            data: { content: [], totalElements: 0 },
          }),
        });
      });

      const resultado = await obtenerMetricasDashboardGeneralAccion({
        rol: 'ESTUDIANTE',
      });

      expect(resultado).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asignaciones-practicas'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asignaciones-proyectos-comunitarios'),
        expect.any(Object)
      );
    });
  });

  describe('obtenerMetricasVcsAccion para autoridades y tutores', () => {
    it('debe consultar asignaciones completadas con estado APROBADO', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            exito: true,
            data: { totalElements: 5, content: [] },
          }),
        });
      });

      const resultado = await obtenerMetricasVcsAccion({
        carreraId: 1,
        periodoId: 100,
      });

      expect(resultado).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('estado=APROBADO'),
        expect.any(Object)
      );
    });

    it('no debe consultar estudiantes-disponibles si el rol es TUTOR_ACADEMICO', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            exito: true,
            data: { totalElements: 3, content: [] },
          }),
        });
      });

      const resultado = await obtenerMetricasVcsAccion({
        carreraId: 1,
        periodoId: 100,
        tutorId: 5,
        rol: 'TUTOR_ACADEMICO',
      });

      expect(resultado).toBeDefined();
      expect(resultado.estudiantesPendientesAsignacion).toBe(0);
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('estudiantes-disponibles'),
        expect.any(Object)
      );
    });

    it('debe consultar estudiantes-disponibles si el rol es DIRECTOR_CARRERA', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('estudiantes-disponibles')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              exito: true,
              data: [{ id: 10 }, { id: 20 }],
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            exito: true,
            data: { totalElements: 4, content: [] },
          }),
        });
      });

      const resultado = await obtenerMetricasVcsAccion({
        carreraId: 1,
        periodoId: 100,
        rol: 'DIRECTOR_CARRERA',
      });

      expect(resultado).toBeDefined();
      expect(resultado.estudiantesPendientesAsignacion).toBe(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('estudiantes-disponibles'),
        expect.any(Object)
      );
    });
  });
});

