import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GestorPeriodos } from '@/components/gestor-periodos';

const mockPeriodosIniciales = {
  content: [
    {
      id: '1',
      nombre: '2026-2026',
      fechaInicio: '2026-04-01',
      fechaFin: '2026-08-31',
      estado: 'ACTIVO',
    },
    {
      id: '2',
      nombre: '2025-2026',
      fechaInicio: '2025-10-01',
      fechaFin: '2026-02-28',
      estado: 'INACTIVO',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

vi.mock('@/lib/acciones/periodo-academico.acciones', () => ({
  obtenerPeriodosPaginadosAccion: vi.fn(async () => mockPeriodosIniciales),
  crearPeriodoAccion: vi.fn(async () => ({ exito: true })),
  actualizarPeriodoAccion: vi.fn(async () => ({ exito: true })),
  eliminarPeriodoAccion: vi.fn(async () => ({ exito: true })),
}));

describe('GestorPeriodos (Componente Unificado UI)', () => {
  it('debe renderizar CabeceraListado con el título y botón de Nuevo Periodo', () => {
    render(<GestorPeriodos periodosIniciales={mockPeriodosIniciales} />);

    expect(screen.getByText('Periodos Académicos')).toBeInTheDocument();
    expect(screen.getByText(/Total de periodos registrados:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo periodo/i })).toBeInTheDocument();
  });

  it('debe renderizar las métricas compactas en la cabecera y la lista con badges de estado', () => {
    render(<GestorPeriodos periodosIniciales={mockPeriodosIniciales} />);

    expect(screen.getByText(/Total de periodos registrados/i)).toBeInTheDocument();
    expect(screen.getByText(/Activos/i)).toBeInTheDocument();

    expect(screen.getAllByText('2026-2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2025-2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ACTIVO').length).toBeGreaterThan(0);
    expect(screen.getAllByText('INACTIVO').length).toBeGreaterThan(0);
  });
});
