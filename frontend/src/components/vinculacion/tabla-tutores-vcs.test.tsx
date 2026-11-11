import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TablaTutoresVcs } from './tabla-tutores-vcs';
import { TutorResumenVcsDto } from '@/lib/tipos/vcs/asignacion-proyecto';

const usuarioMock = {
  id: 1,
  nombres: 'Coordinador',
  apellidos: 'Practicas',
  correo: 'cpp@uce.edu.ec',
  rol: 'COORDINADOR_PRACTICAS',
};

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: usuarioMock,
    estaAutenticado: true,
    cargando: false,
  }),
}));

describe('TablaTutoresVcs (Componente UI)', () => {
  const tutoresMock: TutorResumenVcsDto[] = [
    {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Pérez',
      identificacion: '1723456789',
      correo: 'carlos.perez@uce.edu.ec',
      carreraId: 1,
      nombreCarrera: 'Ingeniería en Sistemas',
      asignacionesActuales: 3,
      proyectos: [
        {
          id: 10,
          nombre: 'Alfabetización Digital',
          estado: 'ACTIVO',
        },
      ],
      estudiantes: [],
    },
    {
      id: 2,
      nombres: 'María',
      apellidos: 'Gómez',
      identificacion: '1798765432',
      correo: 'maria.gomez@uce.edu.ec',
      carreraId: 1,
      nombreCarrera: 'Ingeniería en Sistemas',
      asignacionesActuales: 0,
      proyectos: [],
      estudiantes: [],
    },
  ];

  it('debe renderizar la lista de tutores con nombre, cédula y proyectos asociados', () => {
    render(<TablaTutoresVcs tutores={tutoresMock} />);

    expect(screen.getAllByText('Carlos Pérez')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/1723456789/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('carlos.perez@uce.edu.ec')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Alfabetización Digital')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1/2')[0]).toBeInTheDocument();

    expect(screen.getAllByText('María Gómez')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/1798765432/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('0/2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sin proyectos asociados')[0]).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay tutores registrados', () => {
    render(<TablaTutoresVcs tutores={[]} />);

    expect(screen.getAllByText('No se encontraron tutores académicos')[0]).toBeInTheDocument();
  });

  it('debe ocultar el botón de Asociar Proyectos cuando el periodo está inactivo', () => {
    const { rerender } = render(<TablaTutoresVcs tutores={tutoresMock} esInactivo={false} />);
    expect(screen.getAllByText('Asociar Proyectos').length).toBeGreaterThan(0);

    rerender(<TablaTutoresVcs tutores={tutoresMock} esInactivo={true} />);
    expect(screen.queryByText('Asociar Proyectos')).not.toBeInTheDocument();
  });
});
