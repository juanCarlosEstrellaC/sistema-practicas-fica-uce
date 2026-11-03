import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaDashboardGeneral } from '../vista-dashboard-general';
import { type MetricasDashboardGeneralDto } from '@/lib/acciones/metricas.acciones';
import { type Usuario } from '@/lib/tipos/general';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (_key: string) => null,
    has: (_key: string) => false,
    toString: () => '',
  }),
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('VistaDashboardGeneral (Componente de Panel Principal según Wireframes)', () => {
  const metricasMock: MetricasDashboardGeneralDto = {
    pp: {
      totalEstudiantes: 50,
      estudiantesAsignados: 50,
      estudiantesEnCurso: 32,
      estudiantesCompletados: 18,
      totalConvenios: 16,
      conveniosPorExpirar: 1,
      conveniosExpirados: 0,
      totalTutores: 12,
      reportesPendientes: 0,
    },
    vcs: {
      totalAsignaciones: 50,
      asignacionesEnCurso: 32,
      asignacionesCompletadas: 18,
      totalProyectos: 8,
      proyectosEnDesarrollo: 6,
      proyectosFinalizados: 2,
      proyectosActivos: 4,
      estudiantesPendientesAsignacion: 0,
    },
    subdecano: {
      totalCarreras: 5,
      totalPeriodos: 2,
      desgloseCarreras: [
        {
          carreraId: 1,
          carreraNombre: 'Computación',
          ppTotalEstudiantes: 50,
          ppSinAsignacion: 0,
          ppEnDesarrollo: 32,
          ppFinalizados: 18,
          ppConveniosActivos: 16,
          vcsProyectosActuales: 2,
          vcsProyectosEnDesarrollo: 6,
          vcsProyectosFinalizados: 2,
          vcsEstudiantesParticipando: 50,
          vcsProyectosActivos: 8,
        },
        {
          carreraId: 2,
          carreraNombre: 'Diseño',
          ppTotalEstudiantes: 33,
          ppSinAsignacion: 0,
          ppEnDesarrollo: 20,
          ppFinalizados: 13,
          ppConveniosActivos: 10,
          vcsProyectosActuales: 3,
          vcsProyectosEnDesarrollo: 2,
          vcsProyectosFinalizados: 1,
          vcsEstudiantesParticipando: 33,
          vcsProyectosActivos: 3,
        },
      ],
    },
  };

  it('debe renderizar el wireframe completo de Subdecano con 4 tarjetas superiores y tablas por carrera', () => {
    const usuarioSubdecano: Usuario = {
      id: '1',
      nombre: 'Carlos',
      apellidos: 'Subdecano',
      correo: 'subdecano@uce.edu.ec',
      rol: 'SUBDECANO',
    };

    render(
      <VistaDashboardGeneral
        metricas={{
          ...metricasMock,
          pp: {
            ...metricasMock.pp,
            totalEstudiantes: 249,
            totalTutores: 62,
            estudiantesAsignados: 200,
            estudiantesEnCurso: 27,
            estudiantesCompletados: 18,
            totalConvenios: 58,
          },
        }}
        usuario={usuarioSubdecano}
        periodoActual={{ id: 1, nombre: '2026-2026', estado: 'ACTIVO' }}
      />
    );

    expect(screen.getByText(/Bienvenido\/a, Carlos Subdecano/i)).toBeInTheDocument();
    expect(screen.getByText('SUBDECANO')).toBeInTheDocument();

    // 4 tarjetas superiores
    expect(screen.getByText('249')).toBeInTheDocument();
    expect(screen.getByText('Total Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('Tutores Académicos')).toBeInTheDocument();
    expect(screen.getByText('Carreras')).toBeInTheDocument();
    expect(screen.getByText('Periodos académicos')).toBeInTheDocument();

    // Panel Prácticas Preprofesionales
    expect(screen.getByRole('heading', { name: /Prácticas Preprofesionales/i })).toBeInTheDocument();
    expect(screen.getByText('Estudiantes con Asignación')).toBeInTheDocument();
    expect(screen.getAllByText('Convenios Activos:').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('58')).toBeInTheDocument();

    // Columnas de carreras
    expect(screen.getAllByText('Computación').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Diseño').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Estudiantes Totales:')).toBeInTheDocument();

    // Panel Vinculación con la Sociedad
    expect(screen.getByRole('heading', { name: /Vinculación con la Sociedad/i })).toBeInTheDocument();
    expect(screen.getAllByText('Proyectos Activos:').length).toBeGreaterThanOrEqual(1);
  });

  it('debe renderizar el wireframe de Director de Carrera con 2 tarjetas superiores', () => {
    const usuarioDirector: Usuario = {
      id: '2',
      nombre: 'Santiago',
      apellidos: 'Director',
      correo: 'director@uce.edu.ec',
      rol: 'DIRECTOR_CARRERA',
      carreraId: '1',
    };

    render(
      <VistaDashboardGeneral
        metricas={metricasMock}
        usuario={usuarioDirector}
        periodoActual={{ id: 1, nombre: '2026-2026' }}
      />
    );

    expect(screen.getByText(/Bienvenido\/a, Santiago Director/i)).toBeInTheDocument();
    expect(screen.getByText('DIRECTOR CARRERA')).toBeInTheDocument();

    // 2 tarjetas superiores
    expect(screen.getByText('Total Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Tutores Académicos')).toBeInTheDocument();
    expect(screen.queryByText('Periodos académicos')).not.toBeInTheDocument();

    // Prácticas Preprofesionales y Vinculación con la Sociedad
    expect(screen.getByRole('heading', { name: /Prácticas Preprofesionales/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Vinculación con la Sociedad/i })).toBeInTheDocument();
    expect(screen.getByText('Estudiantes participando')).toBeInTheDocument();

    // Barras de progreso
    expect(screen.getByText('36%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('debe renderizar el wireframe de Coordinador de Prácticas', () => {
    const usuarioCoordinador: Usuario = {
      id: '3',
      nombre: 'Lucía',
      apellidos: 'Coordinadora',
      correo: 'coordinador@uce.edu.ec',
      rol: 'COORDINADOR_PRACTICAS',
      carreraId: '1',
    };

    render(
      <VistaDashboardGeneral
        metricas={metricasMock}
        usuario={usuarioCoordinador}
        periodoActual={{ id: 1, nombre: '2026-2026' }}
      />
    );

    expect(screen.getByText(/Bienvenido\/a, Lucía Coordinadora/i)).toBeInTheDocument();
    expect(screen.getByText('COORDINADOR PRACTICAS')).toBeInTheDocument();
    expect(screen.getByText('Total Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Tutores Académicos')).toBeInTheDocument();
  });

  it('debe renderizar el wireframe de Tutor Académico sin tarjetas globales superiores', () => {
    const usuarioTutor: Usuario = {
      id: '4',
      nombre: 'Marco',
      apellidos: 'Tutor',
      correo: 'tutor@uce.edu.ec',
      rol: 'TUTOR_ACADEMICO',
    };

    const metricasTutor: MetricasDashboardGeneralDto = {
      pp: {
        totalEstudiantes: 7,
        estudiantesAsignados: 7,
        estudiantesEnCurso: 5,
        estudiantesCompletados: 2,
        totalConvenios: 16,
        conveniosPorExpirar: 0,
        conveniosExpirados: 0,
        totalTutores: 1,
        reportesPendientes: 0,
      },
      vcs: {
        totalAsignaciones: 50,
        asignacionesEnCurso: 1,
        asignacionesCompletadas: 1,
        totalProyectos: 2,
        proyectosEnDesarrollo: 1,
        proyectosFinalizados: 1,
        proyectosActivos: 4,
        estudiantesPendientesAsignacion: 0,
      },
    };

    render(
      <VistaDashboardGeneral
        metricas={metricasTutor}
        usuario={usuarioTutor}
        periodoActual={{ id: 1, nombre: '2026-2026' }}
      />
    );

    expect(screen.getByText(/Bienvenido\/a, Marco Tutor/i)).toBeInTheDocument();
    expect(screen.getByText('TUTOR ACADEMICO')).toBeInTheDocument();

    // NO debe haber tarjeta superior de "Total Estudiantes"
    expect(screen.queryByText('Total Estudiantes')).not.toBeInTheDocument();

    // 3 tarjetas de Prácticas
    expect(screen.getByText('Estudiantes Asignados')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    // 4 tarjetas de Vinculación
    expect(screen.getByText('Proyectos Asignados')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2);

    // Barras de progreso de TA (PP: 2 de 7 = 29%, VCS: 1 de 2 = 50%)
    expect(screen.getByText('29%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('debe mantener intacto el diseño del perfil Estudiante', () => {
    const usuarioEstudiante: Usuario = {
      id: '5',
      nombre: 'Juan',
      apellidos: 'Pérez',
      correo: 'jperez@uce.edu.ec',
      rol: 'ESTUDIANTE',
    };

    const metricasEstudiante: MetricasDashboardGeneralDto = {
      ...metricasMock,
      estudiante: {
        tienePractica: true,
        horasPracticaCompletadas: 120,
        horasPracticaAsignadas: 240,
        estadoPractica: 'EN_CURSO',
        fasePractica: 'Desarrollo',
        institucionPractica: 'Ministerio de Telecomunicaciones',
        tieneVinculacion: true,
        horasVinculacionCompletadas: 80,
        horasVinculacionAsignadas: 80,
        estadoVinculacion: 'COMPLETADO',
        faseVinculacion: 'Finalización',
        proyectoVinculacion: 'Alfabetización Digital',
      },
    };

    render(
      <VistaDashboardGeneral
        metricas={metricasEstudiante}
        usuario={usuarioEstudiante}
        periodoActual={{ id: 1, nombre: '2026-2026' }}
      />
    );

    expect(screen.getByText(/Bienvenido\/a, Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText('Ministerio de Telecomunicaciones')).toBeInTheDocument();
    expect(screen.getByText('Alfabetización Digital')).toBeInTheDocument();
    expect(screen.getByText('120 / 240 Horas Validadas')).toBeInTheDocument();
    expect(screen.getByText('80 / 80 Horas Validadas')).toBeInTheDocument();
    expect(screen.getByText('Ver Mi Práctica')).toBeInTheDocument();
    expect(screen.getByText('Ver Mi Proyecto')).toBeInTheDocument();
  });
});
