import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TablaAsignacionesVcs } from './tabla-asignaciones-vcs';
import { AsignacionProyectoComunitarioDto } from '@/lib/tipos/vcs/asignacion-proyecto';

let mockFaseFiltro: string | null = null;

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'faseActual' || key === 'fase') return mockFaseFiltro;
      if (key === 'sort') return 'fechaCreacion,desc';
      return null;
    },
    has: () => false,
    toString: () => '',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/vinculacion/asignaciones-existentes',
}));

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: { id: 1, nombres: 'Coordinador', apellidos: 'Practicas', rol: 'COORDINADOR_PRACTICAS' },
  }),
}));

vi.mock('@/lib/acciones/vcs/asignacion-proyecto.acciones', () => ({
  obtenerAsignacionProyectoPorIdAccion: vi.fn(),
  cancelarAsignacionProyectoAccion: vi.fn(),
  reprobarAsignacionProyectoAccion: vi.fn(),
  eliminarAsignacionProyectoAccion: vi.fn(),
}));

describe('TablaAsignacionesVcs (Acciones cuando se Reprueba o Cancela)', () => {
  const asignacionBase: AsignacionProyectoComunitarioDto = {
    id: 1,
    proyectoId: 10,
    nombreProyecto: 'Alfabetización Digital',
    tutorId: 2,
    nombreCompletoTutor: 'Tutor Academico',
    carreraId: 1,
    nombreCarrera: 'Computación',
    estudianteId: 3,
    identificacionEstudiante: '1723522403',
    nombreCompletoEstudiante: 'Juan Carlos Estrella',
    correoEstudiante: 'jcest@uce.edu.ec',
    urlAvatar: undefined,
    periodoAcademicoId: 1,
    nombrePeriodoAcademico: '2026-2026',
    horasAsignadas: 80,
    horasCompletadas: 0,
    fechaInicio: '2026-01-01',
    fechaFin: undefined,
    faseActual: 'ASIGNACION',
    estado: 'REPROBADO',
    documentosValidados: false,
    urlCertificado: undefined,
    fechaCreacion: '2026-01-01T00:00:00',
  };

  it('debe retirar los botones y mostrar "No disponible" cuando la asignacion está REPROBADO', () => {
    const pagina = {
      content: [asignacionBase],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(
      <TablaAsignacionesVcs
        paginaAsignaciones={pagina}
        proyectos={[]}
      />
    );

    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTitle('Editar asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Cancelar asignación')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reprobar' })).not.toBeInTheDocument();
  });

  it('debe retirar los botones y mostrar "No disponible" cuando la asignacion está CANCELADO', () => {
    const pagina = {
      content: [{ ...asignacionBase, estado: 'CANCELADO' as const }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(
      <TablaAsignacionesVcs
        paginaAsignaciones={pagina}
        proyectos={[]}
      />
    );

    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTitle('Editar asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Cancelar asignación')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reprobar' })).not.toBeInTheDocument();
  });

  it('debe renderizar el botón de cancelar con icono discreto y el lápiz de edición en azul cuando está EN_CURSO en fase ASIGNACION', () => {
    const pagina = {
      content: [{ ...asignacionBase, estado: 'EN_CURSO' as const, faseActual: 'ASIGNACION' as const }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(
      <TablaAsignacionesVcs
        paginaAsignaciones={pagina}
        proyectos={[]}
      />
    );

    const botonesCancelar = screen.getAllByTitle('Cancelar asignación');
    expect(botonesCancelar.length).toBeGreaterThanOrEqual(1);
    expect(botonesCancelar[0]).toHaveClass('text-amber-600');
    expect(botonesCancelar[0]).not.toHaveClass('bg-destructive');

    const botonesEditar = screen.getAllByTitle('Editar asignación');
    expect(botonesEditar.length).toBeGreaterThanOrEqual(1);
    expect(botonesEditar[0]).toHaveClass('text-primary');
  });

  it('debe retirar la columna "Acciones" por completo cuando el filtro de fase es FINALIZACION', () => {
    mockFaseFiltro = 'FINALIZACION';

    const pagina = {
      content: [{ ...asignacionBase, estado: 'APROBADO' as const, faseActual: 'FINALIZACION' as const }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(
      <TablaAsignacionesVcs
        paginaAsignaciones={pagina}
        proyectos={[]}
      />
    );

    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    mockFaseFiltro = null;
  });

  it('debe mostrar "-" en la celda de acciones cuando está en fase FINALIZACION y estado APROBADO sin filtro de fase activo', () => {
    mockFaseFiltro = null;

    const pagina = {
      content: [{ ...asignacionBase, estado: 'APROBADO' as const, faseActual: 'FINALIZACION' as const }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(
      <TablaAsignacionesVcs
        paginaAsignaciones={pagina}
        proyectos={[]}
      />
    );

    expect(screen.getByText('Acciones')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
