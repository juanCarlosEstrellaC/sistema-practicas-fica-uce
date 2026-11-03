import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Portafolio from '@/components/practicas/portafolio/portafolio';
import { DocumentoDto } from '@/lib/tipos/pp/general-pp';

const mockObtenerDocs = vi.fn().mockResolvedValue([
  {
    id: '1',
    tipo: 'CV',
    nombre: 'hoja_de_vida.pdf',
    url: '/uploads/cv.pdf',
    estado: 'APROBADO',
    fechaSubida: '2025-02-10T10:00:00',
    asignacionId: '50',
  },
  {
    id: '2',
    tipo: 'DOCUMENTO_IDENTIDAD',
    nombre: 'cedula.pdf',
    url: '/uploads/cedula.pdf',
    estado: 'APROBADO',
    fechaSubida: '2025-02-10T10:05:00',
    asignacionId: '50',
  },
] as unknown as DocumentoDto[]);

vi.mock('@/lib/acciones/pp/documento-portafolio.acciones', () => ({
  obtenerDocumentosPorEstudianteAccion: (...args: any[]) => mockObtenerDocs(...args),
  registrarDocumentoPortafolioAccion: vi.fn().mockResolvedValue({ exito: true }),
  resubirDocumentoPortafolioAccion: vi.fn().mockResolvedValue({ exito: true }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Portafolio (Componente Modular Refactorizado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el encabezado y los documentos requeridos del portafolio', async () => {
    render(<Portafolio estudianteId="301" mostrarTitulo={true} etapaActual="DESARROLLO" />);

    expect(screen.getByText('Documentos del Portafolio')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1\. Hoja de Vida/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Copia de Identificación/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Carta de Asignación/i)).toBeInTheDocument();
      expect(screen.getByText(/4\. Monitoreo de seguimiento/i)).toBeInTheDocument();
      expect(screen.getByText(/5\. Informe final/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar los badges de estado para los documentos aprobados y pendientes', async () => {
    render(<Portafolio estudianteId="301" soloLectura={true} etapaActual="DESARROLLO" />);

    await waitFor(() => {
      const badgesAprobados = screen.getAllByText('Aprobado');
      expect(badgesAprobados.length).toBeGreaterThanOrEqual(2);

      const badgesPendientes = screen.getAllByText('Pendiente');
      expect(badgesPendientes.length).toBeGreaterThan(0);
    });
  });

  it('debe permitir abrir modal para resubir cuando el ID está en permitirResubirIds', async () => {
    const docsRechazados = [
      {
        id: '10',
        tipo: 'SEGUIMIENTO_TA',
        nombre: 'seguimiento.pdf',
        url: '/uploads/seguimiento.pdf',
        estado: 'RECHAZADO',
        observacion: 'Falta firma del tutor',
        fechaSubida: '2025-02-12T10:00:00',
        asignacionId: '50',
      },
    ];

    render(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsRechazados as unknown as DocumentoDto[]}
        permitirResubirIds={['doc_seguimiento_ta']}
        etapaActual="DESARROLLO"
      />
    );

    const botonResubir = screen.getByRole('button', { name: /Resubir/i });
    expect(botonResubir).toBeInTheDocument();
    fireEvent.click(botonResubir);

    await waitFor(() => {
      expect(screen.getByText('Resubir Documento')).toBeInTheDocument();
    });
  });

  it('debe mostrar la botonera con las 3 opciones (Ver, Descargar, Corregir y Resubir) en perfil cuando un documento rechazado puede resubirse', () => {
    const docsRechazados = [
      {
        id: '10',
        tipo: 'SEGUIMIENTO_TA',
        nombre: 'seguimiento.pdf',
        url: '/uploads/seguimiento.pdf',
        estado: 'RECHAZADO',
        observacion: 'Faltan firmas.',
        fechaSubida: '2026-10-28T10:00:00',
        asignacionId: '50',
      },
    ];

    render(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsRechazados as unknown as DocumentoDto[]}
        permitirResubirIds={['doc_seguimiento_ta']}
        etapaActual="DESARROLLO"
        rol="TA"
      />
    );

    // Debe mostrar la botonería con las 3 opciones (iconos para ver y descargar, y boton para corregir)
    expect(screen.getByRole('button', { name: /Ver/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Corregir y Resubir/i })).toBeInTheDocument();
  });

  it('no debe mostrar observaciones de documentos 4, 5 o 6 para DC o Sub, pero si para TA y CPP', () => {
    const docsConObservacion = [
      {
        id: '10',
        tipo: 'SEGUIMIENTO_TA',
        nombre: 'seguimiento.pdf',
        url: '/uploads/seguimiento.pdf',
        estado: 'RECHAZADO',
        observacion: 'Faltan firmas del tutor institucional',
        fechaSubida: '2025-02-12T10:00:00',
        asignacionId: '50',
      },
    ];

    // Para DIRECTOR_CARRERA: no debe verse la observacion
    const { rerender } = render(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsConObservacion as unknown as DocumentoDto[]}
        rol="DIRECTOR_CARRERA"
        etapaActual="DESARROLLO"
      />
    );
    expect(screen.queryByText(/Faltan firmas del tutor institucional/i)).not.toBeInTheDocument();

    // Para SUBDECANO: no debe verse la observacion
    rerender(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsConObservacion as unknown as DocumentoDto[]}
        rol="SUBDECANO"
        etapaActual="DESARROLLO"
      />
    );
    expect(screen.queryByText(/Faltan firmas del tutor institucional/i)).not.toBeInTheDocument();

    // Para TUTOR_ACADEMICO: si debe tener disponible el boton Ver Detalles
    rerender(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsConObservacion as unknown as DocumentoDto[]}
        rol="TUTOR_ACADEMICO"
        etapaActual="DESARROLLO"
      />
    );
    expect(screen.getByRole('button', { name: /Ver Detalles/i })).toBeInTheDocument();

    // Para COORDINADOR_PRACTICAS: si debe tener disponible el boton Ver Detalles y poder abrir la observacion
    rerender(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsConObservacion as unknown as DocumentoDto[]}
        rol="COORDINADOR_PRACTICAS"
        etapaActual="DESARROLLO"
      />
    );
    const botonDetallesCpp = screen.getByRole('button', { name: /Ver Detalles/i });
    expect(botonDetallesCpp).toBeInTheDocument();
    fireEvent.click(botonDetallesCpp);
    expect(screen.getByText(/Faltan firmas del tutor institucional/i)).toBeInTheDocument();
  });

  it('debe mostrar el esqueleto de carga mientras obtiene los documentos', () => {
    // Al renderizar sin prop de documentos, se activa el estado de carga
    const { container } = render(<Portafolio estudianteId="301" etapaActual="DESARROLLO" />);

    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]');
    expect(elementosEsqueleto.length).toBeGreaterThan(0);
  });

  it('debe mostrar el aval de cumplimiento como aprobado y con opción de previsualizar cuando cuenta con url', async () => {
    const docsConAval = [
      {
        id: '70',
        tipo: 'AVAL',
        nombre: 'Aval_Cumplimiento_Oficial.pdf',
        url: '/uploads/avales/aval_70.pdf',
        estado: 'APROBADO',
        fechaSubida: '2025-02-15T10:00:00',
        asignacionId: '50',
      },
    ];

    render(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsConAval as unknown as DocumentoDto[]}
        asignacionEstado="APROBADO"
        etapaActual="FINALIZACION"
      />
    );

    expect(screen.getByText(/7\. Aval de Cumplimiento/i)).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver Documento/i })).toBeInTheDocument();
  });

  it('debe mostrar bloqueados los documentos 4, 5, 6 y 7 cuando la etapa actual es ASIGNACION (aun no en desarrollo)', async () => {
    render(<Portafolio estudianteId="301" soloLectura={true} etapaActual="ASIGNACION" />);

    await waitFor(() => {
      expect(screen.getByText(/1\. Hoja de Vida/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Copia de Identificación/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Carta de Asignación/i)).toBeInTheDocument();

      const botonesBloqueados = screen.getAllByRole('button', { name: /Bloqueado/i });
      expect(botonesBloqueados.length).toBe(4);
    });
  });

  it('debe renderizar el archivo preparado con nombre largo sin errores al seleccionarlo en el modal de resubir', async () => {
    const docsRechazados = [
      {
        id: '6',
        tipo: 'CERTIFICADO_CUMPLIMIENTO',
        nombre: 'certificado_original.pdf',
        url: '/uploads/cert.pdf',
        estado: 'RECHAZADO',
        observacion: 'Faltan firmas',
        fechaSubida: '2025-02-12T10:00:00',
        asignacionId: '50',
      },
    ];

    render(
      <Portafolio
        estudianteId="301"
        soloLectura={true}
        documentos={docsRechazados as unknown as DocumentoDto[]}
        permitirResubirIds={['doc_cert_cumplimiento']}
        etapaActual="FINALIZACION"
        rol="TUTOR_ACADEMICO"
      />
    );

    const botonResubir = screen.getByRole('button', { name: /Resubir/i });
    fireEvent.click(botonResubir);

    await waitFor(() => {
      expect(screen.getByText('Resubir Documento')).toBeInTheDocument();
      expect(screen.getByText(/Observación de Revisión:/i)).toBeInTheDocument();
      expect(screen.getAllByText('Faltan firmas').length).toBeGreaterThanOrEqual(1);
    });

    const nombreLargo = '3. Juan Carlos Estrella Caicedo - Certificado_Cumplimiento.pdf';
    const archivoSimulado = new File(['dummy-content'], nombreLargo, { type: 'application/pdf' });
    const inputArchivo = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(inputArchivo).toBeInTheDocument();

    fireEvent.change(inputArchivo, { target: { files: [archivoSimulado] } });

    await waitFor(() => {
      expect(screen.getByText(nombreLargo)).toBeInTheDocument();
      expect(screen.getByTitle('Quitar archivo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar y Enviar/i })).toBeEnabled();
    });
  });
});
