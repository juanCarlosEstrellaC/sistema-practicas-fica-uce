import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CabeceraListado } from '../cabecera-listado';

describe('CabeceraListado (Componente Común UI)', () => {
  it('debe renderizar el título y total de registros correctamente', () => {
    render(
      <CabeceraListado
        titulo="Listado de Asignaciones"
        total={42}
      />
    );

    expect(screen.getByText('Listado de Asignaciones')).toBeInTheDocument();
    expect(screen.getByText(/Total de asignaciones registradas:/)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('debe renderizar un botón de acción cuando se proporciona', () => {
    render(
      <CabeceraListado
        titulo="Listado de Proyectos"
        total={10}
        accion={<button data-testid="boton-accion">Nuevo Proyecto</button>}
      />
    );

    expect(screen.getByTestId('boton-accion')).toBeInTheDocument();
  });
});
