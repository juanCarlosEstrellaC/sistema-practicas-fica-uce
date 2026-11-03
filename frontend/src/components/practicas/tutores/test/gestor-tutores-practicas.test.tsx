import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GestorTutoresPracticas } from '@/components/practicas/tutores/gestor-tutores-practicas';
import { CarreraDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard/practicas/tutores',
  useSearchParams: () => ({
    get: vi.fn((key: string) => null),
    toString: () => '',
  }),
}));

const mockTutores: TutorResumenDto[] = [
  {
    id: '101',
    nombres: 'Diego Fernando',
    apellidos: 'Armas Paredes',
    correo: 'dfarmas@uce.edu.ec',
    especialidad: 'Software',
    estudiantesAsignados: 2,
    urlAvatar: '',
    estudiantes: [
      { id: 1, nombres: 'Carlos', apellidos: 'Pérez' },
      { id: 2, nombres: 'Ana', apellidos: 'Gómez' },
    ],
  },
  {
    id: '102',
    nombres: 'Paola Andrea',
    apellidos: 'Herrera Morales',
    correo: 'paherrera@uce.edu.ec',
    especialidad: 'Redes',
    estudiantesAsignados: 0,
    urlAvatar: '',
    estudiantes: [],
  },
];

describe('GestorTutoresPracticas (Componente UI)', () => {
  it('debe renderizar CabeceraListado con las métricas de tutores y estudiantes asignados', () => {
    render(
      <GestorTutoresPracticas
        carreraId={1}
        periodoId={1}
        tutoresIniciales={mockTutores}
        carreraNombre="Sistemas de Información"
      />
    );

    expect(screen.getByText('Tutores Académicos')).toBeInTheDocument();
    expect(screen.getByText(/Total de tutores registrados/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Docentes/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Estudiantes asignados/i)).toBeInTheDocument();
  });

  it('debe renderizar la tabla con los docentes, su carga y los badges de estudiantes', () => {
    render(
      <GestorTutoresPracticas
        carreraId={1}
        periodoId={1}
        tutoresIniciales={mockTutores}
        carreraNombre="Sistemas de Información"
      />
    );

    expect(screen.getAllByText('Diego Fernando Armas Paredes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('dfarmas@uce.edu.ec').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2/10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Carlos Pérez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Gómez').length).toBeGreaterThan(0);

    expect(screen.getAllByText('Paola Andrea Herrera Morales').length).toBeGreaterThan(0);
    expect(screen.getAllByText('paherrera@uce.edu.ec').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0/10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sin estudiantes asignados').length).toBeGreaterThan(0);
  });

  it('debe renderizar la barra de filtros unificada con selector de carreras si es subdecano', () => {
    const mockCarreras = [
      { id: '1', nombre: 'Computación' },
      { id: '2', nombre: 'Sistemas de Información' },
    ] as unknown as CarreraDto[];

    render(
      <GestorTutoresPracticas
        periodoId={1}
        tutoresIniciales={mockTutores}
        esSubdecano={true}
        carreras={mockCarreras}
      />
    );

    expect(
      screen.getByPlaceholderText(/buscar tutor por nombre, cédula o correo/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Todas las carreras')).toBeInTheDocument();
    expect(screen.getByText('Todos los tutores')).toBeInTheDocument();
  });
});
