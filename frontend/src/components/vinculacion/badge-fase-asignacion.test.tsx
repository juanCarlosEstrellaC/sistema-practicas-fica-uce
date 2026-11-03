import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BadgeFaseAsignacion } from './badge-fase-asignacion';

describe('BadgeFaseAsignacion (Componente UI)', () => {
  it('debe renderizar "Asignación" para la fase ASIGNACION', () => {
    render(<BadgeFaseAsignacion fase="ASIGNACION" />);
    expect(screen.getByText('Asignación')).toBeInTheDocument();
  });

  it('debe renderizar "Desarrollo" para la fase DESARROLLO', () => {
    render(<BadgeFaseAsignacion fase="DESARROLLO" />);
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
  });

  it('debe renderizar "Evaluación" para la fase EVALUACION', () => {
    render(<BadgeFaseAsignacion fase="EVALUACION" />);
    expect(screen.getByText('Evaluación')).toBeInTheDocument();
  });

  it('debe renderizar "Finalizado" para la fase FINALIZADO', () => {
    render(<BadgeFaseAsignacion fase="FINALIZADO" />);
    expect(screen.getByText('Finalizado')).toBeInTheDocument();
  });
});
