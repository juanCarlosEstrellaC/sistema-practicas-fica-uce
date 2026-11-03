import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaGestionMatrizCaces } from '@/components/practicas/matriz-caces/vista-gestion-matriz-caces';
import { obtenerMatrizPorPeriodoYCarreraAccion } from '@/lib/acciones/pp/matriz-caces.acciones';

// Mock de Server Actions
vi.mock('@/lib/acciones/pp/matriz-caces.acciones', () => ({
  obtenerMatricesCacesPorPeriodoAccion: vi.fn(async () => ({
    content: [
      {
        id: 1,
        periodoAcademicoId: 1,
        carreraId: 1,
        carreraNombre: 'Ingeniería en Sistemas de Información',
        carreraCodigo: 'SIS-001',
        estado: 'ENVIADA_A_SUBDECANO',
        archivoFirmadoUrl: null,
        observacion: null,
      },
      {
        id: 2,
        periodoAcademicoId: 1,
        carreraId: 2,
        carreraNombre: 'Computación',
        carreraCodigo: 'COM-001',
        estado: 'FIRMADA_POR_SUBDECANO',
        archivoFirmadoUrl: 'https://ejemplo.uce.edu.ec/matriz-firmada.pdf',
        observacion: null,
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
  })),
  obtenerMatrizPorPeriodoYCarreraAccion: vi.fn(async () => ({
    id: 1,
    periodoAcademicoId: 1,
    carreraId: 1,
    carreraNombre: 'Ingeniería en Sistemas de Información',
    carreraCodigo: 'SIS-001',
    estado: 'PENDIENTE',
    archivoFirmadoUrl: null,
    observacion: null,
  })),
  crearOActualizarMatrizCacesAccion: vi.fn(),
  cambiarEstadoMatrizCacesAccion: vi.fn(),
  subirArchivoFirmadoMatrizCacesAccion: vi.fn(),
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  obtenerAsignacionesPracticasAccion: vi.fn(async () => ({
    content: [
      {
        id: 1,
        estudiante: {
          id: 101,
          nombres: 'Carlos Andrés',
          apellidos: 'Pérez Gómez',
          identificacion: '1723456789',
          correo: 'caperez@uce.edu.ec',
        },
        institucion: 'Empresa Tech',
        tutorAcademico: {
          id: 201,
          nombres: 'Diego Fernando',
          apellidos: 'Armas',
        },
        horasCompletadas: 240,
        horasAsignadas: 240,
        fechaInicio: '2025-05-10',
        fechaFin: '2025-08-20',
        sectorReceptora: 'PRIVADO',
        observacionesCaces: 'Sin novedades',
      },
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10,
  })),
  actualizarDatosCacesAccion: vi.fn(),
}));

describe('VistaGestionMatrizCaces (Componente Modular Refactorizado)', () => {
  it('debe renderizar la vista de Subdecano con la lista de carreras y consolidado institucional', async () => {
    render(<VistaGestionMatrizCaces rol="SUBDECANO" periodoId={1} />);

    expect(await screen.findByText('Matrices CACES de la Facultad')).toBeInTheDocument();
    expect(await screen.findByText('Consolidado Institucional')).toBeInTheDocument();
    expect(await screen.findByText('Ingeniería en Sistemas de Información')).toBeInTheDocument();
    expect(await screen.findByText('En Revisión (Subdecanato)')).toBeInTheDocument();
    expect(await screen.findByText('Oficializada')).toBeInTheDocument();
    // La columna de Observaciones fue retirada
    expect(screen.queryByRole('columnheader', { name: /Observaciones/i })).toBeNull();
  });

  it('debe renderizar la vista de Carrera para Coordinador con metadatos superiores, fechas y sin botón de actualizar matriz', async () => {
    render(
      <VistaGestionMatrizCaces
        rol="COORDINADOR_PRACTICAS"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
        carreraCiudad="Quito"
        codigoIes="1005"
      />
    );

    expect(await screen.findByText(/Matriz CACES/i)).toBeInTheDocument();
    expect((await screen.findAllByText('SIS-001')).length).toBeGreaterThan(0);

    // 1. Información CACES superior sin uppercase ni _
    expect(await screen.findByText('Código IES')).toBeInTheDocument();
    expect(await screen.findByText('1005')).toBeInTheDocument();
    expect(await screen.findByText('Código carrera')).toBeInTheDocument();
    expect(await screen.findByText('Ciudad carrera')).toBeInTheDocument();
    expect(await screen.findByText('Quito')).toBeInTheDocument();

    // 2. Columnas Horas validadas (sin barra ni /numhoras), Fecha inicio y Fecha fin
    expect(await screen.findByText('Horas validadas')).toBeInTheDocument();
    expect(await screen.findByText('Fecha inicio')).toBeInTheDocument();
    expect(await screen.findByText('Fecha fin')).toBeInTheDocument();

    expect((await screen.findAllByText('Carlos Andrés Pérez Gómez')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Empresa Tech')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('240 h')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('10/05/2025')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('20/08/2025')).length).toBeGreaterThan(0);

    // 3. No debe existir botón de Actualizar matriz, solo Descargar Excel y Enviar a Dirección
    expect(screen.queryByText('Actualizar Matriz')).toBeNull();
    expect(screen.queryByText('Generar Matriz')).toBeNull();
    expect(await screen.findByText('Descargar Excel')).toBeInTheDocument();
    expect(await screen.findByText('Enviar a Dirección')).toBeInTheDocument();
  });

  it('debe mostrar el banner de observaciones, habilitar la edición de corrección y permitir devolver la matriz corregida cuando DC la devuelve', async () => {
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'PENDIENTE',
      archivoFirmadoUrl: null,
      observacion: '[Dirección de Carrera] No está bien los nombres',
    });

    // Validar también tolerancia a rol "CPP"
    render(
      <VistaGestionMatrizCaces
        rol="CPP"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    // Banner de observaciones presente
    expect(await screen.findByText(/Observaciones registradas en la matriz:/i)).toBeInTheDocument();
    expect(await screen.findByText(/\[Dirección de Carrera\] No está bien los nombres/i)).toBeInTheDocument();
    expect(await screen.findByText('Corrección habilitada')).toBeInTheDocument();

    // Botón de Devolver Matriz Corregida presente
    const botonesDevolver = await screen.findAllByRole('button', { name: /Devolver Matriz Corregida/i });
    expect(botonesDevolver.length).toBeGreaterThan(0);

    // En la tabla debe estar habilitada la opción de corrección
    expect((await screen.findAllByRole('button', { name: /Corregir/i })).length).toBeGreaterThan(0);
  });

  it('debe permitir a CPP firmar y remitir a Subdecanato cuando la matriz está en FIRMADA_POR_DC, y DC no debe tener botón hacia sub', async () => {
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'FIRMADA_POR_DC',
      archivoFirmadoUrl: 'https://ejemplo.uce.edu.ec/dc-firmado.xlsx',
      observacion: null,
    });

    // 1. Coordinador de Prácticas
    const { unmount } = render(
      <VistaGestionMatrizCaces
        rol="COORDINADOR_PRACTICAS"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    // CPP debe tener el botón para firmar y remitir a Subdecanato
    expect(await screen.findByRole('button', { name: /Firmar y Remitir a Subdecanato/i })).toBeInTheDocument();
    // No debe haber botón de ver archivo firmado
    expect(screen.queryByRole('button', { name: /Ver Archivo Firmado/i })).toBeNull();

    unmount();

    // 2. Director de Carrera en estado FIRMADA_POR_DC no debe tener botón de enviar a Subdecanato
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'FIRMADA_POR_DC',
      archivoFirmadoUrl: 'https://ejemplo.uce.edu.ec/dc-firmado.xlsx',
      observacion: null,
    });

    render(
      <VistaGestionMatrizCaces
        rol="DIRECTOR_CARRERA"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    // Para DC en estado FIRMADA_POR_DC, el botón de descargar no debe aparecer hasta que el subdecano firme
    expect(screen.queryByText(/Descargar Matriz Firmada/i)).toBeNull();
    // No debe existir el botón de remitir a subdecanato en DC
    expect(screen.queryByRole('button', { name: /Remitir a Subdecanato/i })).toBeNull();
    // No debe haber botón de ver archivo firmado
    expect(screen.queryByRole('button', { name: /Ver Archivo Firmado/i })).toBeNull();
  });

  it('debe mostrar el botón de Descargar Matriz Firmada en Director de Carrera solo cuando el Subdecano ha firmado', async () => {
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      periodoNombre: '2025-2025',
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'FIRMADA_POR_SUBDECANO',
      archivoFirmadoUrl: 'https://ejemplo.uce.edu.ec/oficializada.xlsx',
      observacion: null,
    });

    render(
      <VistaGestionMatrizCaces
        rol="DIRECTOR_CARRERA"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    const botonDescarga = await screen.findByText('Descargar Matriz Firmada');
    expect(botonDescarga).toBeInTheDocument();
    // El enlace debe tener el nombre estandarizado de archivo
    const enlace = botonDescarga.closest('a');
    expect(enlace).toHaveAttribute(
      'download',
      'Matriz CACES - Ingeniería en Sistemas de Información - 2025-2025 - Oficializada.xlsx'
    );
  });

  it('no debe mostrar el botón de Descargar Excel en Director de Carrera cuando la matriz está en estado PENDIENTE', async () => {
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'PENDIENTE',
      archivoFirmadoUrl: null,
      observacion: '[Dirección de Carrera] No está bien los nombres',
    });

    render(
      <VistaGestionMatrizCaces
        rol="DIRECTOR_CARRERA"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    expect(await screen.findByText(/Observaciones registradas en la matriz:/i)).toBeInTheDocument();
    // En estado PENDIENTE, DC no debe ver el botón de descargar excel
    expect(screen.queryByText(/Descargar Excel/i)).toBeNull();
    expect(screen.queryByText(/Descargar Matriz Firmada/i)).toBeNull();
  });

  it('debe mostrar únicamente el botón de Oficializar y Subir Firma para Subdecano y no debe permitir devolver con observaciones', async () => {
    vi.mocked(obtenerMatrizPorPeriodoYCarreraAccion).mockResolvedValueOnce({
      id: 1,
      periodoAcademicoId: 1,
      carreraId: 1,
      carreraNombre: 'Ingeniería en Sistemas de Información',
      carreraCodigo: 'SIS-001',
      estado: 'ENVIADA_A_SUBDECANO',
      archivoFirmadoUrl: 'https://ejemplo.uce.edu.ec/matriz-firmada-cpp.xlsx',
      observacion: null,
    });

    const { VistaMatrizCacesCarrera } = await import('@/components/practicas/matriz-caces/vista-matriz-caces-carrera');

    render(
      <VistaMatrizCacesCarrera
        rol="SUBDECANO"
        periodoId={1}
        carreraId={1}
        carreraNombre="Ingeniería en Sistemas de Información"
        carreraCodigo="SIS-001"
      />
    );

    expect(await screen.findByRole('button', { name: /Oficializar y Subir Firma/i })).toBeInTheDocument();
    // Subdecano NO debe tener el botón de devolver con observaciones
    expect(screen.queryByRole('button', { name: /Devolver observaciones/i })).toBeNull();
  });
});
