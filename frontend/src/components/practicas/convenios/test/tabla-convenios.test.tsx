import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TablaConvenios } from '../tabla-convenios';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';

describe('TablaConvenios (Componente Modular UI)', () => {
  const conveniosPrueba: ConvenioDto[] = [
    {
      id: '1',
      institucion: 'Corporación Nacional de Telecomunicaciones',
      tipo: 'PUBLICO',
      campoEspecifico: 1,
      fechaInicio: '2025-01-01',
      fechaFin: '2026-12-31',
      estado: 'ACTIVO',
      tutorInstitucional: 'Ing. Elena Morales',
      correoTutor: 'elena.morales@cnt.gob.ec',
      telefonoTutor: '0998877665',
      direccion: 'Av. Veintimilla y Juan León Mera',
      cuposTotales: 12,
      ocupados: 5,
      documentoUrl: '/api/proxy/documentos/convenio1.pdf',
      nombreDocumento: 'convenio_cnt.pdf',
    },
  ];

  it('debe renderizar las columnas institucionales y los datos del convenio', () => {
    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alVerDetalle={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    expect(screen.getAllByText('Corporación Nacional de Telecomunicaciones')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ing. Elena Morales')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/5\/12/)[0]).toBeInTheDocument();
  });

  it('debe ejecutar alVerDetalle al hacer clic sobre la fila', () => {
    const fnVerDetalle = vi.fn();
    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alVerDetalle={fnVerDetalle}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    const celda = screen.getAllByText('Corporación Nacional de Telecomunicaciones')[0];
    fireEvent.click(celda);

    expect(fnVerDetalle).toHaveBeenCalledWith(conveniosPrueba[0]);
  });

  it('debe mostrar botones de editar y eliminar para el Subdecano', () => {
    const fnEditar = vi.fn();
    const fnEliminar = vi.fn();

    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alVerDetalle={vi.fn()}
        alEditar={fnEditar}
        alEliminar={fnEliminar}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    expect(screen.getAllByTitle('Editar')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Eliminar')[0]).toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando no hay convenios registrados', () => {
    render(
      <TablaConvenios
        convenios={[]}
        totalPaginas={0}
        totalElementos={0}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={false}
        alVerDetalle={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    expect(screen.getAllByText(/No se encontraron convenios institucionales/)[0]).toBeInTheDocument();
  });

  it('debe renderizar CabeceraListado con el título y conteo total', () => {
    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={5}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alVerDetalle={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    expect(screen.getByText('Listado de Convenios Institucionales')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('debe mostrar el botón Nuevo Convenio en la cabecera para Subdecano y responder al clic', () => {
    const fnNuevo = vi.fn();
    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alAbrirNuevoConvenio={fnNuevo}
        alVerDetalle={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    const botonNuevo = screen.getByText('Nuevo Convenio');
    expect(botonNuevo).toBeInTheDocument();
    fireEvent.click(botonNuevo);
    expect(fnNuevo).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el botón Sugerir nuevo convenio para otros roles y responder al clic', () => {
    const fnSugerir = vi.fn();
    render(
      <TablaConvenios
        convenios={conveniosPrueba}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={false}
        alAbrirSugerirConvenio={fnSugerir}
        alVerDetalle={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    const botonSugerir = screen.getByText('Sugerir nuevo convenio');
    expect(botonSugerir).toBeInTheDocument();
    fireEvent.click(botonSugerir);
    expect(fnSugerir).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar el botón de basurero cuando el convenio se encuentra ANULADO', () => {
    const conveniosAnulados: ConvenioDto[] = [
      {
        ...conveniosPrueba[0],
        id: '99',
        estado: 'ANULADO',
      },
    ];

    // Para Subdecano
    const { rerender } = render(
      <TablaConvenios
        convenios={conveniosAnulados}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={true}
        alVerDetalle={vi.fn()}
        alEliminar={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    const botonEliminar = screen.getAllByTitle('Convenio ya anulado')[0];
    expect(botonEliminar).toBeInTheDocument();
    expect(botonEliminar).toBeDisabled();

    // Para otros roles (sugerir anulación)
    rerender(
      <TablaConvenios
        convenios={conveniosAnulados}
        totalPaginas={1}
        totalElementos={1}
        paginaActual={0}
        elementosPorPagina={10}
        esSubdecano={false}
        alVerDetalle={vi.fn()}
        alSugerirAnulacion={vi.fn()}
        onCambioPagina={vi.fn()}
        onCambioElementosPorPagina={vi.fn()}
      />
    );

    const botonSugerirAnulacion = screen.getAllByTitle('Convenio ya anulado')[0];
    expect(botonSugerirAnulacion).toBeInTheDocument();
    expect(botonSugerirAnulacion).toBeDisabled();
  });
});

