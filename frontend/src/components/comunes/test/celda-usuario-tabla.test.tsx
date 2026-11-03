import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CeldaUsuarioTabla } from '../celda-usuario-tabla';

describe('CeldaUsuarioTabla (Componente Común UI)', () => {
  it('debe renderizar el nombre, identificacion, correo y avatar con iniciales', () => {
    render(
      <CeldaUsuarioTabla
        nombre="Juan Estrella"
        identificacion="1711111111"
        correo="jcestrella@uce.edu.ec"
      />
    );

    expect(screen.getByText('Juan Estrella')).toBeInTheDocument();
    expect(screen.getByText('C.I: 1711111111')).toBeInTheDocument();
    expect(screen.getByText('jcestrella@uce.edu.ec')).toBeInTheDocument();
    expect(screen.getByText('JE')).toBeInTheDocument();
  });

  it('debe manejar campos opcionales sin romper el renderizado', () => {
    render(<CeldaUsuarioTabla nombre="Maria Lopez" />);

    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
    expect(screen.getByText('ML')).toBeInTheDocument();
    expect(screen.queryByText(/C\.I:/)).toBeNull();
  });
});
