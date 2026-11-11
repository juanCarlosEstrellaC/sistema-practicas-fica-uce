import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { ModalCrearProyecto } from './modal-crear-proyecto';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import * as accionesProyecto from '@/lib/acciones/vcs/proyecto-comunitario.acciones';

vi.mock('@/lib/acciones/vcs/proyecto-comunitario.acciones', () => ({
  crearProyectoComunitarioAccion: vi.fn(),
  actualizarProyectoComunitarioAccion: vi.fn(),
}));

vi.mock('@/lib/servicios/documento.servicio', () => ({
  CARPETAS_ARCHIVOS: {
    VINCULACION: 'vinculacion',
  },
  subirArchivo: vi.fn(),
}));

vi.mock('@/components/comunes/boton-previsualizar-documento', () => ({
  BotonPrevisualizarDocumento: ({ url, texto }: { url?: string; texto?: string }) => (
    <button type="button" data-url={url}>
      {texto || 'Ver'}
    </button>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('ModalCrearProyecto (Edición de Documento Protegido)', () => {
  const carrerasMock: CarreraDto[] = [
    { id: 1, nombre: 'Ingeniería en Computación', codigo: 'IC', horasPracticas: 240, horasVinculacion: 96 },
  ];

  const proyectoMock: ProyectoComunitarioDto = {
    id: 41,
    nombre: 'Alfabetización Digital para Adultos Mayores',
    descripcion: 'Proyecto comunitario',
    carreraId: 1,
    nombreCarrera: 'Ingeniería en Computación',
    estado: 'ACTIVO',
    fechaInicio: '2026-02-28',
    fechaFin: '2026-07-30',
    urlDocumento: '/proyectos-comunitarios/41/preview',
    nombreDocumento: '41. Convenio FING-empresa.pdf',
    iniciado: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe previsualizar el documento existente usando el endpoint protegido via proxy', () => {
    render(
      <ModalCrearProyecto
        abierto={true}
        abrirModal={vi.fn()}
        proyectoAEditar={proyectoMock}
        carreras={carrerasMock}
      />
    );

    const botonVer = screen.getByRole('button', { name: 'Ver' });
    expect(botonVer).toHaveAttribute('data-url', '/api/proxy/proyectos-comunitarios/41/preview');
  });

  it('al guardar cambios sin reemplazar el PDF, no debe enviar la URL de preview como urlDocumento', async () => {
    vi.mocked(accionesProyecto.actualizarProyectoComunitarioAccion).mockResolvedValue({
      exito: true,
      mensaje: 'Proyecto comunitario actualizado con éxito',
    });

    render(
      <ModalCrearProyecto
        abierto={true}
        abrirModal={vi.fn()}
        proyectoAEditar={proyectoMock}
        carreras={carrerasMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(accionesProyecto.actualizarProyectoComunitarioAccion).toHaveBeenCalledWith(
        41,
        expect.objectContaining({
          nombre: 'Alfabetización Digital para Adultos Mayores',
          urlDocumento: undefined,
          nombreDocumento: '41. Convenio FING-empresa.pdf',
        })
      );
    });
  });

  it('al quitar el documento actual y guardar, debe enviar urlDocumento vacia', async () => {
    vi.mocked(accionesProyecto.actualizarProyectoComunitarioAccion).mockResolvedValue({
      exito: true,
      mensaje: 'Proyecto comunitario actualizado con éxito',
    });

    render(
      <ModalCrearProyecto
        abierto={true}
        abrirModal={vi.fn()}
        proyectoAEditar={proyectoMock}
        carreras={carrerasMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Quitar/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => {
      expect(accionesProyecto.actualizarProyectoComunitarioAccion).toHaveBeenCalledWith(
        41,
        expect.objectContaining({
          urlDocumento: '',
          nombreDocumento: '',
        })
      );
    });
  });
});

