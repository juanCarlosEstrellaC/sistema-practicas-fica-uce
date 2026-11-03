import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GestorIngresoDatos } from '../gestor-ingreso-datos';

vi.mock('@/components/gestor-usuarios', () => ({
  GestorUsuarios: () => <div data-testid="gestor-usuarios">Módulo de Usuarios</div>,
}));

vi.mock('@/components/gestor-carreras', () => ({
  GestorCarreras: () => <div data-testid="gestor-carreras">Módulo de Carreras</div>,
}));

vi.mock('@/components/gestor-periodos', () => ({
  GestorPeriodos: () => <div data-testid="gestor-periodos">Módulo de Periodos</div>,
}));

describe('GestorIngresoDatos (Administración del Sistema)', () => {
  it('debe renderizar los tabs de Usuarios, Carreras y Periodos Académicos sin Convenios', () => {
    render(<GestorIngresoDatos rol="SUBDECANO" usuarioId="1" />);

    expect(screen.getByRole('tab', { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /carreras/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /periodos académicos/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /convenios/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('gestor-usuarios')).toBeInTheDocument();
  });
});
