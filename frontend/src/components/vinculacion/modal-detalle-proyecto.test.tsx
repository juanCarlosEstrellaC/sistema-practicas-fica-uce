import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ModalDetalleProyecto } from './modal-detalle-proyecto';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';

describe('ModalDetalleProyecto (Componente Modular UI)', () => {
  const proyectoMock: ProyectoComunitarioDto = {
    id: 1,
    nombre: 'Alfabetización Digital para Adultos Mayores',
    descripcion: 'Proyecto enfocado en enseñar el uso básico de herramientas digitales.',
    carreraId: 1,
    nombreCarrera: 'Ingeniería en Sistemas de Información',
    tutorAcademicoId: 10,
    nombreCompletoTutor: 'Ing. Carlos Pérez',
    correoTutor: 'carlos.perez@uce.edu.ec',
    estado: 'ACTIVO',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-07-31',
    urlDocumento: 'https://ejemplo.com/proyecto.pdf',
    nombreDocumento: 'Propuesta_Proyecto_Firmada.pdf',
    iniciado: true,
  };

  it('debe renderizar el nombre del proyecto, estado, datos generales y tutor académico', () => {
    render(
      <ModalDetalleProyecto
        proyecto={proyectoMock}
        abierto={true}
        alCerrar={vi.fn()}
      />
    );

    expect(screen.getByText('Alfabetización Digital para Adultos Mayores')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Datos Generales')).toBeInTheDocument();
    expect(screen.getByText('Vigencia del Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Tutor Académico Responsable')).toBeInTheDocument();
    expect(screen.getByText('Ing. Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('Propuesta_Proyecto_Firmada.pdf')).toBeInTheDocument();
    const iframe = screen.getByTitle('Documento del proyecto Alfabetización Digital para Adultos Mayores');
    expect(iframe).toHaveAttribute('src', '/api/proxy/proyectos-comunitarios/1/preview');
  });

  it('debe mostrar mensaje cuando el proyecto no tiene documento subido', () => {
    render(
      <ModalDetalleProyecto
        proyecto={{ ...proyectoMock, urlDocumento: null, nombreDocumento: null }}
        abierto={true}
        alCerrar={vi.fn()}
      />
    );

    expect(
      screen.getByText('No se ha subido ningún documento para este proyecto.')
    ).toBeInTheDocument();
  });

  it('no debe renderizar nada si abierto es false', () => {
    const { container } = render(
      <ModalDetalleProyecto
        proyecto={proyectoMock}
        abierto={false}
        alCerrar={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
