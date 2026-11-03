import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DialogoDetalleTutor } from '../dialogo-detalle-tutor';

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  obtenerAsignacionesPracticasAccion: vi.fn().mockResolvedValue({
    content: [],
    totalElements: 0,
  }),
}));

describe('DialogoDetalleTutor (Componente UI)', () => {
  const mockTutor = {
    id: '101',
    nombres: 'Diego Fernando',
    apellidos: 'Armas Paredes',
    correo: 'dfarmas@uce.edu.ec',
    estudiantes: [
      { id: 1, nombres: 'Carlos', apellidos: 'Pérez', institucion: 'Empresa A', fase: 'DESARROLLO' },
      { id: 2, nombres: 'Ana', apellidos: 'Gómez', institucion: 'Empresa B', fase: 'FINALIZACION' },
    ],
  };

  it('no debe renderizar nada si tutor es null', () => {
    const { container } = render(
      <DialogoDetalleTutor tutor={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar la cabecera compacta y las tarjetas métricas optimizadas', async () => {
    render(
      <DialogoDetalleTutor
        tutor={mockTutor}
        onClose={vi.fn()}
        carreraNombre="Sistemas de Información"
      />
    );

    // Encabezado
    expect(screen.getByText('Diego Fernando Armas Paredes')).toBeInTheDocument();
    expect(screen.getByText(/dfarmas@uce\.edu\.ec/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistemas de Información/i)).toBeInTheDocument();

    // Métricas compactas
    expect(screen.getByText('Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Cupo Máximo')).toBeInTheDocument();
    expect(screen.getByText('Carga')).toBeInTheDocument();

    // Valores calculados
    expect(screen.getByText('2')).toBeInTheDocument(); // totalSupervisiones
    expect(screen.getByText('10')).toBeInTheDocument(); // cupo maximo
    expect(screen.getByText('20%')).toBeInTheDocument(); // porcentaje de carga
  });

  it('debe renderizar el listado de supervisiones y permitir ordenar por columnas', async () => {
    render(
      <DialogoDetalleTutor
        tutor={mockTutor}
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByText('Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('Empresa A')).toBeInTheDocument();
    expect(screen.getByText('Empresa B')).toBeInTheDocument();
    expect(screen.getByText('DESARROLLO')).toBeInTheDocument();
    expect(screen.getByText('FINALIZACION')).toBeInTheDocument();

    // Alternar ordenación
    const encabezadoEstudiante = screen.getByRole('button', { name: /Estudiante/i });
    fireEvent.click(encabezadoEstudiante);
  });
});
