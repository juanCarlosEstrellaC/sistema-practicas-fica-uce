import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalDetalleEstudianteVcs } from './modal-detalle-estudiante-vcs';
import { PortafolioVcs } from './portafolio/portafolio-vcs';
import { AlertaEstadoProcesoVcs } from './alerta-estado-proceso-vcs';
import { AsignacionProyectoComunitarioDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { EvidenciaVcs } from '@/lib/tipos/vcs/evidencia-vcs';

const mockObtenerEvidencias = vi.fn();
const mockIniciarDesarrollo = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/acciones/vcs/evidencia-vcs.acciones', () => ({
  obtenerEvidenciasPorAsignacionAccion: (...args: any[]) => mockObtenerEvidencias(...args),
  iniciarDesarrolloAccion: (...args: any[]) => mockIniciarDesarrollo(...args),
  revisarEvidenciaTutorAccion: vi.fn(),
  aprobarHorasSubdecanatoAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalDetalleEstudianteVcs y PortafolioVcs', () => {
  const asignacionBase: AsignacionProyectoComunitarioDto = {
    id: 101,
    estudianteId: 10,
    nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
    identificacionEstudiante: '1712345678',
    correoEstudiante: 'jcestrella@uce.edu.ec',
    proyectoId: 5,
    nombreProyecto: 'Alfabetización Digital Comunitaria',
    tutorId: 20,
    nombreCompletoTutor: 'Ing. Sandra Mendoza',
    correoTutor: 'smendoza@uce.edu.ec',
    carreraId: 1,
    nombreCarrera: 'Ingenieria en Computacion',
    periodoAcademicoId: 1,
    nombrePeriodoAcademico: '2026-2026',
    horasAsignadas: 80,
    horasCompletadas: 0,
    estado: 'EN_CURSO',
    faseActual: 'ASIGNACION',
    documentosValidados: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockObtenerEvidencias.mockResolvedValue({
      exito: true,
      data: [],
    });
    mockIniciarDesarrollo.mockResolvedValue({
      exito: true,
      mensaje: 'Proyecto iniciado con éxito',
      data: { ...asignacionBase, faseActual: 'DESARROLLO' },
    });
  });

  it('debe renderizar la información del estudiante, fase del proceso y portafolio bloqueado en ASIGNACION', async () => {
    render(
      <ModalDetalleEstudianteVcs
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionBase}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getByText('Información de Vinculación con la Sociedad')).toBeInTheDocument();
    expect(screen.getByText('Juan Carlos Estrella Caicedo')).toBeInTheDocument();
    expect(screen.getByText('jcestrella@uce.edu.ec')).toBeInTheDocument();
    expect(screen.getByText('Ingenieria en Computacion')).toBeInTheDocument();
    expect(screen.getByText('Fase del Proceso')).toBeInTheDocument();
    expect(screen.getByText('Inicio de Proyecto pendiente')).toBeInTheDocument();
    expect(screen.getByText('Documentos del Portafolio')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1. Bitácora de Actividades')).toBeInTheDocument();
      expect(screen.getByText('2. Informe Final de Vinculación')).toBeInTheDocument();
      expect(screen.getByText('3. Certificado de Acreditación de Horas')).toBeInTheDocument();
      const botonesBloqueados = screen.getAllByRole('button', { name: /Bloqueado/i });
      expect(botonesBloqueados.length).toBe(3);
    });
  });

  it('no debe mostrar botón de inicio individual en fase ASIGNACION e indicar que se inicia desde Proyectos Comunitarios', async () => {
    render(
      <ModalDetalleEstudianteVcs
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionBase}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(screen.queryByRole('button', { name: /Iniciar Fase de Desarrollo/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    expect(
      screen.getByText(/debe iniciar el proyecto de forma global desde la sección de Proyectos Comunitarios/i)
    ).toBeInTheDocument();
  });

  it('debe habilitar los documentos 1 y 2 en fase DESARROLLO y mantener bloqueado el certificado 3', async () => {
    const evidenciasMock: EvidenciaVcs[] = [
      {
        id: 1,
        asignacionId: 101,
        estudianteId: 10,
        nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
        identificacionEstudiante: '1712345678',
        proyectoId: 5,
        nombreProyecto: 'Alfabetización Digital Comunitaria',
        tipoDocumento: 'BITACORA',
        nombreArchivo: 'Bitacora_Juan.pdf',
        urlArchivo: '/archivos_subidos/vinculacion/bitacora.pdf',
        estadoTutor: 'APROBADO',
        fechaSubida: '2026-10-15T10:00:00',
      },
    ];

    render(
      <PortafolioVcs
        asignacionId={101}
        asignacion={{ ...asignacionBase, faseActual: 'DESARROLLO' }}
        evidencias={evidenciasMock}
        etapaActual="DESARROLLO"
      />
    );

    expect(screen.getByText('1. Bitácora de Actividades')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();

    const botonesBloqueados = screen.getAllByRole('button', { name: /Bloqueado/i });
    expect(botonesBloqueados.length).toBe(1);
  });

  it('debe mostrar el botón de emitir certificado al Subdecano cuando documentosValidados es true', async () => {
    const asignacionValidada: AsignacionProyectoComunitarioDto = {
      ...asignacionBase,
      faseActual: 'FINALIZACION',
      documentosValidados: true,
    };

    render(
      <ModalDetalleEstudianteVcs
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionValidada}
        rol="SUBDECANO"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Portafolio validado por Tutor Académico')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Previsualizar y Emitir Certificado de Horas/i })
      ).toBeInTheDocument();
    });
  });

  it('debe mostrar el estado culminado cuando la asignación está en estado APROBADO', () => {
    render(
      <AlertaEstadoProcesoVcs
        fase="FINALIZACION"
        estado="APROBADO"
        documentosValidados={true}
        rol="SUBDECANO"
      />
    );

    expect(screen.getByText('Proyecto de vinculación culminado')).toBeInTheDocument();
    expect(screen.getByText('Proceso completado')).toBeInTheDocument();
  });

  it('debe mostrar el botón Ver Detalles y no mostrar inline observation ni botón de resubir para documentos observados en VCS', async () => {
    const evidenciasObservadas: EvidenciaVcs[] = [
      {
        id: 1,
        asignacionId: 101,
        estudianteId: 10,
        nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
        identificacionEstudiante: '1712345678',
        proyectoId: 5,
        nombreProyecto: 'Alfabetización Digital Comunitaria',
        tipoDocumento: 'BITACORA',
        nombreArchivo: 'Bitacora_Juan.pdf',
        urlArchivo: '/archivos_subidos/vinculacion/bitacora.pdf',
        estadoTutor: 'OBSERVADO',
        observacionesTutor: 'Faltan firmas del tutor institucional en las páginas 2 y 3',
        fechaSubida: '2026-10-15T10:00:00',
      },
    ];

    render(
      <PortafolioVcs
        asignacionId={101}
        asignacion={{ ...asignacionBase, faseActual: 'DESARROLLO' }}
        evidencias={evidenciasObservadas}
        etapaActual="DESARROLLO"
      />
    );

    expect(screen.getByText('1. Bitácora de Actividades')).toBeInTheDocument();
    expect(screen.getByText('Observado')).toBeInTheDocument();

    // No debe mostrar la observacion inline en la tarjeta
    expect(
      screen.queryByText('Faltan firmas del tutor institucional en las páginas 2 y 3')
    ).not.toBeInTheDocument();

    // No debe existir boton de corregir o resubir en el diálogo de TA
    expect(screen.queryByRole('button', { name: /Corregir y Resubir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Resubir/i })).not.toBeInTheDocument();

    // Debe mostrar boton Ver Detalles
    const botonDetalles = screen.getByRole('button', { name: /Ver Detalles/i });
    expect(botonDetalles).toBeInTheDocument();

    // Al hacer click, debe abrir el modal de detalles con la observación
    fireEvent.click(botonDetalles);

    expect(screen.getByText('Detalles del Documento')).toBeInTheDocument();
    expect(
      screen.getByText('Faltan firmas del tutor institucional en las páginas 2 y 3')
    ).toBeInTheDocument();

    // Al cerrar el modal, se cierra correctamente
    const botonCerrar = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(botonCerrar);
    await waitFor(() => {
      expect(screen.queryByText('Detalles del Documento')).not.toBeInTheDocument();
    });
  });

  it('mantiene estados independientes en PortafolioVcs aunque el nombre de archivo contenga la palabra del otro tipo', () => {
    const evidenciasCruzadas: EvidenciaVcs[] = [
      {
        id: 2,
        asignacionId: 101,
        estudianteId: 10,
        nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
        identificacionEstudiante: '1712345678',
        proyectoId: 5,
        nombreProyecto: 'Alfabetización Digital Comunitaria',
        tipoDocumento: 'INFORME_FINAL',
        nombreArchivo: 'Informe Final - bitacora.pdf',
        urlArchivo: '/evidencias-vcs/2/preview',
        estadoTutor: 'OBSERVADO',
        observacionesTutor: 'Corregir conclusiones',
        fechaSubida: '2026-10-16T10:00:00',
      },
      {
        id: 1,
        asignacionId: 101,
        estudianteId: 10,
        nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
        identificacionEstudiante: '1712345678',
        proyectoId: 5,
        nombreProyecto: 'Alfabetización Digital Comunitaria',
        tipoDocumento: 'BITACORA',
        nombreArchivo: 'Bitácora de Actividades - bitacora.pdf',
        urlArchivo: '/evidencias-vcs/1/preview',
        estadoTutor: 'PENDIENTE',
        fechaSubida: '2026-10-15T10:00:00',
      },
    ];

    render(
      <PortafolioVcs
        asignacionId={101}
        asignacion={{ ...asignacionBase, faseActual: 'FINALIZACION' }}
        evidencias={evidenciasCruzadas}
        etapaActual="FINALIZACION"
      />
    );

    expect(screen.getAllByText('En Revisión')).toHaveLength(1);
    expect(screen.getAllByText('Observado')).toHaveLength(1);
  });
});
