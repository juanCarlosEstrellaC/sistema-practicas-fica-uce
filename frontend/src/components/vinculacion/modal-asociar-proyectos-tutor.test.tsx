import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalAsociarProyectosTutor } from './modal-asociar-proyectos-tutor';
import { TutorResumenVcsDto, ProyectoResumenDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import * as acciones from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { toast } from 'sonner';

vi.mock('@/lib/acciones/vcs/asignacion-proyecto.acciones', () => ({
  asociarProyectosATutorAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('ModalAsociarProyectosTutor (Componente UI)', () => {
  const tutorMock: TutorResumenVcsDto = {
    id: 1,
    nombres: 'Carlos',
    apellidos: 'Pérez',
    identificacion: '1723456789',
    correo: 'carlos.perez@uce.edu.ec',
    carreraId: 1,
    nombreCarrera: 'Ingeniería en Sistemas',
    asignacionesActuales: 1,
    proyectos: [
      {
        id: 10,
        nombre: 'Alfabetización Digital',
        estado: 'ACTIVO',
      },
    ],
    estudiantes: [],
  };

  const proyectosMock: ProyectoResumenDto[] = [
    {
      id: 10,
      nombre: 'Alfabetización Digital',
      descripcion: 'Proyecto de alfabetización digital',
      tutorAcademicoId: 1,
      nombreTutor: 'Carlos Pérez',
      estado: 'ACTIVO',
    },
    {
      id: 20,
      nombre: 'Desarrollo de Software Comunitario',
      descripcion: 'Desarrollo de sistemas web',
      tutorAcademicoId: undefined,
      nombreTutor: undefined,
      estado: 'ACTIVO',
    },
    {
      id: 30,
      nombre: 'Redes y Telecomunicaciones Rurales',
      descripcion: 'Instalación de antenas',
      tutorAcademicoId: 99,
      nombreTutor: 'María Gómez',
      estado: 'ACTIVO',
    },
    {
      id: 40,
      nombre: 'Seguridad Informática para PYMES',
      descripcion: 'Auditorías comunitarias',
      tutorAcademicoId: undefined,
      nombreTutor: undefined,
      estado: 'ACTIVO',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el modal con los proyectos y el badge en formato num/2', () => {
    render(
      <ModalAsociarProyectosTutor
        abierto={true}
        abrirModal={vi.fn()}
        tutor={tutorMock}
        proyectos={proyectosMock}
      />
    );

    expect(screen.getByText('Asociar Proyectos a Tutor Académico')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Alfabetización Digital')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo de Software Comunitario')).toBeInTheDocument();
    expect(screen.getByText('Asignado a: María Gómez')).toBeInTheDocument();
  });

  it('debe permitir seleccionar un segundo proyecto disponible y actualizar el badge a 2/2', () => {
    render(
      <ModalAsociarProyectosTutor
        abierto={true}
        abrirModal={vi.fn()}
        tutor={tutorMock}
        proyectos={proyectosMock}
      />
    );

    const segundoProyecto = screen.getByText('Desarrollo de Software Comunitario');
    fireEvent.click(segundoProyecto);

    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('debe impedir seleccionar un proyecto ya asignado a otro tutor y mostrar advertencia', () => {
    render(
      <ModalAsociarProyectosTutor
        abierto={true}
        abrirModal={vi.fn()}
        tutor={tutorMock}
        proyectos={proyectosMock}
      />
    );

    const proyectoOcupado = screen.getByText('Redes y Telecomunicaciones Rurales');
    fireEvent.click(proyectoOcupado);

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining('El proyecto ya está asignado al tutor María Gómez')
    );
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('debe llamar a asociarProyectosATutorAccion con los IDs seleccionados al guardar', async () => {
    vi.mocked(acciones.asociarProyectosATutorAccion).mockResolvedValue({
      exito: true,
      mensaje: 'Proyectos asociados correctamente',
    });

    const abrirModalMock = vi.fn();

    render(
      <ModalAsociarProyectosTutor
        abierto={true}
        abrirModal={abrirModalMock}
        tutor={tutorMock}
        proyectos={proyectosMock}
      />
    );

    const botonGuardar = screen.getByRole('button', { name: /Guardar Asignación/i });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(acciones.asociarProyectosATutorAccion).toHaveBeenCalledWith(1, [10]);
      expect(toast.success).toHaveBeenCalledWith('Proyectos asociados correctamente');
      expect(abrirModalMock).toHaveBeenCalledWith(false);
    });
  });
});
