import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CeldaEntidadTutor } from '../celda-entidad-tutor';

describe('CeldaEntidadTutor (Componente Común UI)', () => {
  it('debe renderizar el título de la entidad y el nombre del tutor', () => {
    render(
      <CeldaEntidadTutor
        titulo="Empresa Pública Petroecuador"
        nombreTutor="Ing. Marco Silva"
      />
    );

    expect(screen.getByText('Empresa Pública Petroecuador')).toBeInTheDocument();
    expect(screen.getByText('Tutor: Ing. Marco Silva')).toBeInTheDocument();
  });

  it('debe mostrar mensaje por defecto cuando no hay tutor asignado', () => {
    render(<CeldaEntidadTutor titulo="GAD Pichincha" />);

    expect(screen.getByText('GAD Pichincha')).toBeInTheDocument();
    expect(screen.getByText('Sin tutor asignado')).toBeInTheDocument();
  });
});
