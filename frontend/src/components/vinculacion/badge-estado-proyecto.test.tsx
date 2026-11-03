import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BadgeEstadoProyecto } from './badge-estado-proyecto';

describe('BadgeEstadoProyecto (Componente UI)', () => {
  it('debe renderizar el texto "Activo" para el estado ACTIVO', () => {
    render(<BadgeEstadoProyecto estado="ACTIVO" />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('debe renderizar el texto "Finalizado" para el estado FINALIZADO', () => {
    render(<BadgeEstadoProyecto estado="FINALIZADO" />);
    expect(screen.getByText('Finalizado')).toBeInTheDocument();
  });

  it('debe renderizar el texto "Cancelado" para el estado CANCELADO', () => {
    render(<BadgeEstadoProyecto estado="CANCELADO" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('debe renderizar el texto "Inactivo" para el estado INACTIVO', () => {
    render(<BadgeEstadoProyecto estado="INACTIVO" />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});
