import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GestorUsuarios } from '@/components/gestor-usuarios';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: {
      id: 99,
      correo: 'admin@uce.edu.ec',
      nombres: 'Admin',
      apellidos: 'UCE',
      rol: 'SUBDECANO',
    },
    cerrarSesion: vi.fn(),
  }),
}));

const mockUsuariosIniciales = {
  content: [
    {
      id: '1',
      nombres: 'Carlos Andrés',
      apellidos: 'Pérez Gómez',
      correo: 'caperez@uce.edu.ec',
      identificacion: '1723456789',
      rol: 'ESTUDIANTE',
      estado: 'ACTIVO' as const,
      carreraId: '1',
    },
    {
      id: '2',
      nombres: 'María Elena',
      apellidos: 'Torres Castro',
      correo: 'metorres@uce.edu.ec',
      identificacion: '1719876543',
      rol: 'DIRECTOR_CARRERA',
      estado: 'ACTIVO' as const,
      carreraId: '1',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

const mockEstadisticasIniciales = {
  total: 2,
  estudiantes: 1,
  personalAcademico: 1,
};

const mockCarrerasIniciales = [
  { id: 1, nombre: 'Sistemas de Información' },
  { id: 2, nombre: 'Computación' },
];

vi.mock('@/lib/acciones/usuario.acciones', () => ({
  obtenerUsuariosPaginadosAccion: vi.fn(async () => mockUsuariosIniciales),
  obtenerEstadisticasUsuariosAccion: vi.fn(async () => mockEstadisticasIniciales),
  crearUsuarioAccion: vi.fn(async () => ({ exito: true })),
  actualizarUsuarioAccion: vi.fn(async () => ({ exito: true })),
  eliminarUsuarioAccion: vi.fn(async () => ({ exito: true })),
  cargaMasivaUsuariosAccion: vi.fn(async () => ({ exito: true })),
  reenviarActivacionUsuarioAccion: vi.fn(async () => ({ exito: true, mensaje: 'Correo de activación reenviado exitosamente' })),
}));

vi.mock('@/lib/acciones/carrera.acciones', () => ({
  obtenerCarrerasAccion: vi.fn(async () => ({
    content: mockCarrerasIniciales,
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: false,
  })),
}));

describe('GestorUsuarios (Componente Unificado UI)', () => {
  it('debe renderizar CabeceraListado con el conteo de usuarios y botón de acción', () => {
    render(
      <GestorUsuarios
        usuariosIniciales={mockUsuariosIniciales}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    expect(screen.getByText('Directorio de Usuarios')).toBeInTheDocument();
    expect(screen.getByText(/Total de usuarios registrados:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cargar usuarios/i })).toBeInTheDocument();
  });

  it('debe renderizar las métricas compactas de resumen en la cabecera', () => {
    render(
      <GestorUsuarios
        usuariosIniciales={mockUsuariosIniciales}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    expect(screen.getByText(/Total de usuarios registrados/i)).toBeInTheDocument();
    expect(screen.getByText(/Estudiantes/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Académico/i)).toBeInTheDocument();
  });

  it('debe renderizar la lista de usuarios con CeldaUsuarioTabla y badges de rol/estado', () => {
    render(
      <GestorUsuarios
        usuariosIniciales={mockUsuariosIniciales}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    // Celda de usuario con datos formateados
    expect(screen.getAllByText('Carlos Andrés Pérez Gómez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('C.I: 1723456789').length).toBeGreaterThan(0);
    expect(screen.getAllByText('caperez@uce.edu.ec').length).toBeGreaterThan(0);

    // Badges
    expect(screen.getAllByText('Estudiante').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dir. Carrera').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activo').length).toBeGreaterThanOrEqual(2);
  });

  it('debe renderizar los botones de reenvío de activación para cada usuario', () => {
    render(
      <GestorUsuarios
        usuariosIniciales={mockUsuariosIniciales}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    const botonesReenvio = screen.getAllByTitle('Reenviar correo de activación');
    expect(botonesReenvio.length).toBeGreaterThanOrEqual(2);
  });

  it('debe deshabilitar el botón de eliminación para el usuario actualmente autenticado', () => {
    render(
      <GestorUsuarios
        usuarioIdActual="1"
        usuariosIniciales={mockUsuariosIniciales}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    const botonEliminarPropio = screen.getByTitle('No puedes eliminar tu propia cuenta en sesión');
    expect(botonEliminarPropio).toBeInTheDocument();
    expect(botonEliminarPropio).toBeDisabled();

    const botonEliminarOtro = screen.getByTitle('Eliminar usuario');
    expect(botonEliminarOtro).toBeInTheDocument();
    expect(botonEliminarOtro).not.toBeDisabled();
  });

  it('no debe renderizar el botón de reenvío de activación para usuarios con rol Subdecano', () => {
    const usuariosConSubdecano = {
      content: [
        {
          id: '10',
          nombres: 'Ana Lucía',
          apellidos: 'Pérez Pérez',
          correo: 'aperez@uce.edu.ec',
          identificacion: '1711111119',
          rol: 'SUBDECANO',
          carreraId: '1',
          estado: 'ACTIVO' as const,
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

    render(
      <GestorUsuarios
        usuariosIniciales={usuariosConSubdecano}
        estadisticasIniciales={mockEstadisticasIniciales}
        carrerasIniciales={mockCarrerasIniciales as any}
      />
    );

    expect(screen.queryByTitle('Reenviar correo de activación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Reenviar activación')).not.toBeInTheDocument();
  });
});
