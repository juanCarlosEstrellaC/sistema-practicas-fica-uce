import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BadgeEstadoAsignacion } from './badge-estado-asignacion';

describe('BadgeEstadoAsignacion (Componente UI)', () => {
  it('debe renderizar "En Curso" para el estado EN_CURSO', () => {
    render(<BadgeEstadoAsignacion estado="EN_CURSO" />);
    expect(screen.getByText('En Curso')).toBeInTheDocument();
  });

  it('debe renderizar "Aprobado" con color esmeralda para el estado APROBADO', () => {
    render(<BadgeEstadoAsignacion estado="APROBADO" />);
    const badge = screen.getByText('Aprobado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-emerald-500/10', 'text-emerald-600');
  });

  it('debe renderizar el badge outline para un estado desconocido', () => {
    render(<BadgeEstadoAsignacion estado="OTRO" />);
    expect(screen.getByText('OTRO')).toBeInTheDocument();
  });

  it('debe renderizar "Cancelado" para el estado CANCELADO', () => {
    render(<BadgeEstadoAsignacion estado="CANCELADO" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('debe renderizar "Reprobado" para el estado REPROBADO', () => {
    render(<BadgeEstadoAsignacion estado="REPROBADO" />);
    expect(screen.getByText('Reprobado')).toBeInTheDocument();
  });
});
