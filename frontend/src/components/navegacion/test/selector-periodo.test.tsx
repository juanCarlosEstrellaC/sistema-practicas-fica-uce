import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SelectorPeriodo } from '@/components/selector-periodo';

const mockPeriodos = [
  {
    id: 1,
    nombre: '2026-2026',
    fechaInicio: '2026-04-01',
    fechaFin: '2026-08-31',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    nombre: '2025-2026',
    fechaInicio: '2025-10-01',
    fechaFin: '2026-02-28',
    estado: 'INACTIVO',
  },
];

vi.mock('@/lib/acciones/periodo-academico.acciones', () => ({
  obtenerPeriodosAcademicosAccion: vi.fn(async () => ({
    content: mockPeriodos,
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 50,
    first: true,
    last: true,
    empty: false,
  })),
}));

describe('SelectorPeriodo (Componente Desacoplado)', () => {
  it('debe renderizar el selector con el periodo seleccionado actual', () => {
    render(
      <SelectorPeriodo
        periodoSeleccionado="1"
        onPeriodoChange={vi.fn()}
        periodos={mockPeriodos as any}
      />
    );

    expect(screen.getByText('Periodo:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
