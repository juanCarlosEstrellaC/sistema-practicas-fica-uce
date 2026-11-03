import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BarraProgresoPp } from '../barra-progreso-pp';

describe('BarraProgresoPp (Componente Modular UI)', () => {
  it('debe renderizar las 4 fases del proceso', () => {
    render(<BarraProgresoPp faseActual="ASIGNACION" />);

    expect(screen.getByText('1. Convocatoria')).toBeInTheDocument();
    expect(screen.getByText('2. Asignación')).toBeInTheDocument();
    expect(screen.getByText('3. Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('4. Finalización')).toBeInTheDocument();
  });

  it('debe limitar el ancho de la barra de progreso a 75% cuando finalizado es true', () => {
    const { container } = render(<BarraProgresoPp faseActual="FINALIZACION" finalizado={true} />);

    const lineaProgreso = container.querySelector('.bg-primary.rounded-full');
    expect(lineaProgreso).toBeInTheDocument();
    expect((lineaProgreso as HTMLElement).style.width).toBe('75%');
    expect((lineaProgreso as HTMLElement).style.maxWidth).toBe('75%');
  });

  it('debe calcular el progreso proporcional sin exceder los límites en fases intermedias', () => {
    const { container } = render(<BarraProgresoPp faseActual="DESARROLLO" finalizado={false} />);

    const lineaProgreso = container.querySelector('.bg-primary.rounded-full');
    expect(lineaProgreso).toBeInTheDocument();
    expect((lineaProgreso as HTMLElement).style.width).toBe('50%');
  });
});
