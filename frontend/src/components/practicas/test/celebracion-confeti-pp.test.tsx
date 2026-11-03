import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CelebracionConfetiPp } from '../celebracion-confeti-pp';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('CelebracionConfetiPp (Componente UI)', () => {
  it('debe renderizar la celebracion de aprobacion por periodo', () => {
    render(
      <CelebracionConfetiPp
        tipo="PERIODO"
        horasAprobadas={80}
        nombreInstitucion="Empresa Publica Tech"
      />
    );

    expect(screen.getByText('¡Horas de Prácticas aprobadas con éxito!')).toBeDefined();
    expect(screen.getByText(/Se han validado 80 horas en tu práctica/)).toBeDefined();
  }, 15000);

  it('debe renderizar la culminacion total con mensaje especial', () => {
    render(
      <CelebracionConfetiPp
        tipo="CULMINACION_TOTAL"
        horasAcumuladas={240}
        horasRequeridas={240}
      />
    );

    expect(
      screen.getByText('¡Felicitaciones! Has completado el requisito de Prácticas Preprofesionales')
    ).toBeDefined();
  });

  it('debe cerrarse al presionar el boton de cerrar', () => {
    const fnCerrar = vi.fn();
    render(
      <CelebracionConfetiPp
        tipo="PERIODO"
        horasAprobadas={50}
        onCerrar={fnCerrar}
      />
    );

    const botonCerrar = screen.getByRole('button');
    fireEvent.click(botonCerrar);

    expect(fnCerrar).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('banner-celebracion-pp')).toBeNull();
  });
});
