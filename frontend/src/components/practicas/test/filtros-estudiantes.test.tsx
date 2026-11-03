import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FiltrosEstudiantes } from '../estudiantes/filtros-estudiantes';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'busqueda' ? '' : null),
    toString: () => '',
  }),
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => '/dashboard/practicas/estudiantes',
}));

describe('FiltrosEstudiantes (Componente Modular UI)', () => {
  it('debe renderizar el input de busqueda, selector de fases y selector de estados', () => {
    render(<FiltrosEstudiantes esSubdecano={false} />);

    expect(
      screen.getByPlaceholderText('Buscar por estudiante, cédula o institución...')
    ).toBeInTheDocument();
    expect(screen.getByText('Todas las fases')).toBeInTheDocument();
    expect(screen.getByText('Todos los estados')).toBeInTheDocument();
  });

  it('debe renderizar el selector de carreras cuando esSubdecano es true y existen carreras', () => {
    const carrerasMock = [
      { id: '1', nombre: 'Ingeniería en Sistemas', codigoCarrera: 'SIS', ciudadCarrera: 'Quito', horasPractica: 240, directorId: '1', coordinadorId: '2' },
      { id: '2', nombre: 'Ingeniería Civil', codigoCarrera: 'CIV', ciudadCarrera: 'Quito', horasPractica: 240, directorId: '3', coordinadorId: '4' },
    ];

    render(<FiltrosEstudiantes esSubdecano={true} carreras={carrerasMock as any} />);

    expect(screen.getByText('Todas las carreras')).toBeInTheDocument();
  });

  it('debe permitir escribir en el input de busqueda y enviar el formulario', () => {
    render(<FiltrosEstudiantes esSubdecano={false} />);

    const input = screen.getByPlaceholderText('Buscar por estudiante, cédula o institución...');
    fireEvent.change(input, { target: { value: 'Juan Perez' } });
    fireEvent.submit(input.closest('form')!);

    expect(pushMock).toHaveBeenCalledWith('/dashboard/practicas/estudiantes?page=0&busqueda=Juan+Perez');
  });
});
