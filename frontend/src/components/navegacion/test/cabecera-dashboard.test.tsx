import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CabeceraDashboard } from '../cabecera-dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/practicas/convenios',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: {
      id: '1',
      nombres: 'Director',
      apellidos: 'Carrera',
      rol: 'DIRECTOR_CARRERA',
    },
  }),
}));

vi.mock('@/lib/acciones/periodo-academico.acciones', () => ({
  obtenerPeriodosAcademicosAccion: vi.fn(async () => ({
    content: [
      { id: 1, nombre: '2026-2026', estado: 'ACTIVO', fechaInicio: '2026-04-01' },
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 50,
    first: true,
    last: true,
    empty: false,
  })),
}));

describe('CabeceraDashboard (Componente de Navegación Desacoplado)', () => {
  it('debe renderizar el título del módulo y el selector de periodo para directores', () => {
    render(
      <CabeceraDashboard
        notificaciones={[]}
        alHacerClickNotificacion={vi.fn()}
        periodosIniciales={[
          {
            id: '1',
            nombre: '2026-2026',
            estado: 'ACTIVO',
            fechaInicio: '2026-04-01',
            fechaFin: '2026-08-31',
          },
        ]}
      />
    );

    expect(screen.getByText('Prácticas Preprofesionales')).toBeInTheDocument();
    expect(screen.getByText('Periodo:')).toBeInTheDocument();
  });
});
