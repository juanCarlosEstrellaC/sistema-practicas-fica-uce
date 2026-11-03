import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalSubirMatrizFirmada } from '../modal-subir-matriz-firmada';

vi.mock('@/lib/servicios/documento.servicio', () => ({
  subirArchivo: vi.fn(async () => 'https://ejemplo.uce.edu.ec/matriz-firmada.pdf'),
  CARPETAS_ARCHIVOS: {
    MATRICES_CACES: 'matrices-caces',
  },
}));

vi.mock('@/lib/acciones/pp/matriz-caces.acciones', () => ({
  cambiarEstadoMatrizCacesAccion: vi.fn(async () => ({
    exito: true,
    mensaje: 'Estado actualizado correctamente',
  })),
  subirArchivoFirmadoMatrizCacesAccion: vi.fn(async () => ({
    exito: true,
    mensaje: 'Archivo firmado registrado',
  })),
}));

// Mock de URL.createObjectURL y URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost:3000/mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

describe('ModalSubirMatrizFirmada (Componente con 2 métodos de firma)', () => {
  it('debe renderizar el diálogo con información de carrera y las 2 opciones de firma', () => {
    render(
      <ModalSubirMatrizFirmada
        abierto={true}
        alCerrar={vi.fn()}
        matrizId={1}
        nuevoEstado="FIRMADA_POR_DC"
        carreraNombre="Ingeniería en Computación"
        carreraCodigo="650611A02"
        rolUsuario="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getByText(/Firma y Validación de Matriz CACES/i)).toBeInTheDocument();
    expect(screen.getByText('Ingeniería en Computación')).toBeInTheDocument();
    expect(screen.getByText('650611A02')).toBeInTheDocument();

    // Las 2 formas de firmar
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' })).toBeInTheDocument();

    // El botón de confirmación debe estar deshabilitado porque no hay archivo cargado
    expect(screen.getByRole('button', { name: /Validar y Remitir/i })).toBeDisabled();
  });

  it('debe permitir cambiar al modo manual, ver instrucciones, botón de descarga y volver', async () => {
    render(
      <ModalSubirMatrizFirmada
        abierto={true}
        alCerrar={vi.fn()}
        matrizId={1}
        nuevoEstado="FIRMADA_POR_DC"
        carreraNombre="Ingeniería en Computación"
        carreraCodigo="650611A02"
        rolUsuario="DIRECTOR_CARRERA"
      />
    );

    // Clic en Sin FirmaEC
    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    // Instrucciones
    expect(screen.getByText(/Instrucciones de firma:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Descargar$/i })).toBeInTheDocument();
    expect(screen.getByText(/Subir archivo/i)).toBeInTheDocument();

    // Botón Volver
    const botonVolver = screen.getByRole('button', { name: /Volver/i });
    expect(botonVolver).toBeInTheDocument();
    fireEvent.click(botonVolver);

    // Debe regresar a los métodos de firma
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' })).toBeInTheDocument();
  });

  it('debe habilitar el botón de envío al cargar un archivo PDF y mostrar el iframe de previsualización', async () => {
    const alCompletarMock = vi.fn();
    const alCerrarMock = vi.fn();

    render(
      <ModalSubirMatrizFirmada
        abierto={true}
        alCerrar={alCerrarMock}
        matrizId={1}
        nuevoEstado="FIRMADA_POR_SUBDECANO"
        carreraNombre="Ingeniería en Computación"
        carreraCodigo="650611A02"
        rolUsuario="SUBDECANO"
        alCompletar={alCompletarMock}
      />
    );

    // Título de Subdecanato
    expect(screen.getByText(/Oficialización y Firma de Matriz CACES/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    // Simular carga de archivo PDF
    const archivoMock = new File(['dummy-content'], 'matriz_firmada.pdf', {
      type: 'application/pdf',
    });
    const input = document.getElementById('subir-matriz-firmada-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [archivoMock] } });

    // Debe mostrar el nombre del archivo cargado
    expect(await screen.findByText('matriz_firmada.pdf')).toBeInTheDocument();

    // Debe renderizar el iframe de previsualización
    const iframe = screen.getByTitle('Previsualización de Matriz CACES Firmada');
    expect(iframe).toBeInTheDocument();

    // El botón Oficializar Matriz debe estar habilitado
    const botonOficializar = screen.getByRole('button', { name: /Oficializar Matriz/i });
    expect(botonOficializar).toBeEnabled();

    // Enviar formulario
    fireEvent.click(botonOficializar);

    await waitFor(() => {
      expect(alCerrarMock).toHaveBeenCalled();
      expect(alCompletarMock).toHaveBeenCalled();
    });
  });

  it('debe soportar el flujo de firma y remisión para Coordinador de Prácticas con documento previo firmado', async () => {
    const alCompletarMock = vi.fn();
    const alCerrarMock = vi.fn();

    render(
      <ModalSubirMatrizFirmada
        abierto={true}
        alCerrar={alCerrarMock}
        matrizId={1}
        nuevoEstado="ENVIADA_A_SUBDECANO"
        carreraNombre="Ingeniería en Computación"
        carreraCodigo="650611A02"
        rolUsuario="COORDINADOR_PRACTICAS"
        archivoPrevioUrl="https://ejemplo.uce.edu.ec/matriz-firmada-por-dc.xlsx"
        alCompletar={alCompletarMock}
      />
    );

    // Título de Coordinador
    expect(screen.getByText(/Firma y Remisión de Matriz CACES a Subdecanato/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    // Debe mostrar botón para descargar la matriz
    const botonDescargar = screen.getByRole('button', { name: /^Descargar$/i });
    expect(botonDescargar).toBeInTheDocument();
    expect(botonDescargar).toHaveAttribute('title', 'Descargar matriz firmada previamente');

    // El botón de remitir a Subdecanato debe tener el texto correspondiente
    expect(screen.getByRole('button', { name: /Firmar y Remitir a Subdecanato/i })).toBeDisabled();
  });
});

