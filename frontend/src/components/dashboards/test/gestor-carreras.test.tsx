import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { GestorCarreras } from '@/components/gestor-carreras';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada } from '@/lib/tipos/general';

const mockCarrerasIniciales: RespuestaPaginada<CarreraDto> = {
  content: [
    {
      id: '1',
      nombre: 'Ingeniería en Sistemas de Información',
      codigoCarrera: 'SIS-001',
      ciudadCarrera: 'Quito',
      horasPractica: 240,
      horasProyectosComunitarios: 160,
      director: 'Dr. Roberto Maldonado',
      coordinador: 'Ing. Patricia Vaca',
      directorId: '10',
      coordinadorId: '20',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

vi.mock('@/lib/acciones/carrera.acciones', () => ({
  obtenerCarrerasPaginadasAccion: vi.fn(async () => mockCarrerasIniciales),
  obtenerCarrerasAccion: vi.fn(async () => mockCarrerasIniciales),
  crearCarreraAccion: vi.fn(async () => ({ exito: true })),
  actualizarCarreraAccion: vi.fn(async () => ({ exito: true })),
  eliminarCarreraAccion: vi.fn(async () => ({ exito: true })),
}));

vi.mock('@/lib/acciones/usuario.acciones', () => ({
  obtenerUsuariosPaginadosAccion: vi.fn(async () => ({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  })),
}));

describe('GestorCarreras (Componente Unificado UI)', () => {
  it('debe renderizar CabeceraListado con el título y botón de Nueva Carrera', async () => {
    render(<GestorCarreras carrerasIniciales={mockCarrerasIniciales} />);

    await waitFor(() => {
      expect(screen.getByText('Directorio de Carreras')).toBeInTheDocument();
      expect(screen.getByText(/Total de carreras registradas:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nueva carrera/i })).toBeInTheDocument();
    });
  });

  it('debe renderizar la tabla con las columnas unificadas y los datos de la carrera', async () => {
    render(<GestorCarreras carrerasIniciales={mockCarrerasIniciales} />);

    await waitFor(() => {
      expect(screen.getAllByText('Ingeniería en Sistemas de Información').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SIS-001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('240h').length).toBeGreaterThan(0);
      expect(screen.getByText('Horas Vinculación')).toBeInTheDocument();
      expect(screen.getAllByText('160h').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dr. Roberto Maldonado').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ing. Patricia Vaca').length).toBeGreaterThan(0);
    });
  });

  it('debe renderizar los nombres de DC y CPP cuando provienen de directorNombre y coordinadorNombre', async () => {
    const mockConNombresBackend: RespuestaPaginada<CarreraDto> = {
      content: [
        {
          id: '2',
          nombre: 'Ingeniería en Computación',
          codigoCarrera: 'COM-002',
          ciudadCarrera: 'Quito',
          horasPractica: 240,
          horasProyectosComunitarios: 80,
          directorNombre: 'Dra. Zoila Ruiz',
          coordinadorNombre: 'Ing. Milton Moncayo',
          directorId: '3',
          coordinadorId: '4',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(<GestorCarreras carrerasIniciales={mockConNombresBackend} />);

    await waitFor(() => {
      expect(screen.getAllByText('Dra. Zoila Ruiz').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ing. Milton Moncayo').length).toBeGreaterThan(0);
    });
  });

  it('debe renderizar "No asignado" cuando la carrera no tiene DC ni CPP', async () => {
    const mockSinAsignar: RespuestaPaginada<CarreraDto> = {
      content: [
        {
          id: '3',
          nombre: 'Ingeniería Mecánica',
          codigoCarrera: 'MEC-003',
          ciudadCarrera: 'Quito',
          horasPractica: 296,
          horasProyectosComunitarios: 80,
          directorId: '',
          coordinadorId: '',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: false,
    };

    render(<GestorCarreras carrerasIniciales={mockSinAsignar} />);

    await waitFor(() => {
      expect(screen.getAllByText('No asignado').length).toBeGreaterThanOrEqual(2);
    });
  });
});
