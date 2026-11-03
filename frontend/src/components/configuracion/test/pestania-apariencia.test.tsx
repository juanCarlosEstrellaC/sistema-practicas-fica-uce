import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PestaniaApariencia } from '../pestania-apariencia';

const mockSetTema = vi.fn();

vi.mock('@/lib/contextos/contexto-tema', () => ({
  useTema: () => ({
    tema: 'oscuro',
    temaActual: 'oscuro',
    varianteOscura: 'windows-11',
    setTema: mockSetTema,
  }),
}));

describe('PestaniaApariencia (Componente Modular de Temas)', () => {
  beforeEach(() => {
    mockSetTema.mockClear();
  });

  it('debe renderizar las opciones de Modo Claro, Modo Oscuro y Tema del Sistema', () => {
    render(<PestaniaApariencia />);

    expect(screen.getByText('Modo Claro')).toBeInTheDocument();
    expect(screen.getByText('Modo Oscuro')).toBeInTheDocument();
    expect(screen.getByText('Tema del Sistema')).toBeInTheDocument();
  });

  it('no debe renderizar selectores adicionales de paletas de modo oscuro', () => {
    render(<PestaniaApariencia />);

    expect(screen.queryByText('Moderno oscuro')).not.toBeInTheDocument();
    expect(screen.queryByText('Oscuro (Visual Studio)')).not.toBeInTheDocument();
    expect(screen.queryByText('Paletas para Modo Oscuro')).not.toBeInTheDocument();
  });

  it('debe invocar setTema con "claro" al hacer clic en Modo Claro', () => {
    render(<PestaniaApariencia />);

    const botonClaro = screen.getByText('Modo Claro').closest('button');
    expect(botonClaro).toBeInTheDocument();
    fireEvent.click(botonClaro!);

    expect(mockSetTema).toHaveBeenCalledWith('claro');
  });

  it('debe invocar setTema con "sistema" al hacer clic en Tema del Sistema', () => {
    render(<PestaniaApariencia />);

    const botonSistema = screen.getByText('Tema del Sistema').closest('button');
    expect(botonSistema).toBeInTheDocument();
    fireEvent.click(botonSistema!);

    expect(mockSetTema).toHaveBeenCalledWith('sistema');
  });
});

