import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModalAprobarHorasSubdecano } from './modal-aprobar-horas-subdecano';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';

vi.mock('@/lib/servicios/documento.servicio', () => ({
  subirArchivo: vi.fn().mockResolvedValue('https://storage.uce.edu.ec/documentos/vcs_firmado.pdf'),
  CARPETAS_ARCHIVOS: {
    VINCULACION: 'vinculacion',
  },
}));

vi.mock('@/lib/acciones/vcs/evidencia-vcs.acciones', () => ({
  aprobarHorasSubdecanatoAccion: vi.fn().mockResolvedValue({
    exito: true,
    mensaje: 'Horas acreditadas exitosamente',
    data: { id: 10, estadoAsignacion: 'APROBADO', faseActual: 'FINALIZADO', horasAprobadas: 80 },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalAprobarHorasSubdecano (Estandarizado con layout PP)', () => {
  const asignacionMock: AsignacionProyectoDto = {
    id: 10,
    proyectoId: 1,
    estudianteId: 101,
    tutorId: 202,
    carreraId: 1,
    periodoAcademicoId: 1,
    nombrePeriodoAcademico: '2026-2026',
    nombreProyecto: 'Alfabetización Digital para Adultos Mayores',
    nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
    identificacionEstudiante: '1723522403',
    correoEstudiante: 'jestrellac@uce.edu.ec',
    nombreCompletoTutor: 'Jaime Oswaldo Salvador Meneses',
    correoTutor: 'jsalvador@uce.edu.ec',
    nombreCarrera: 'Ingeniería en Computación',
    horasAsignadas: 80,
    horasCompletadas: 80,
    faseActual: 'EVALUACION',
    estado: 'EN_CURSO',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-06-01',
    documentosValidados: true,
  };

  it('debe renderizar el título estandarizado, los datos de la asignación y el selector de firma', () => {
    render(
      <ModalAprobarHorasSubdecano
        abierto={true}
        abrirModal={vi.fn()}
        asignacion={asignacionMock}
      />
    );

    expect(screen.getByText('Validación de Horas y Emisión de Certificado de Vinculación')).toBeInTheDocument();
    expect(screen.getByText('Juan Carlos Estrella Caicedo')).toBeInTheDocument();
    expect(screen.getByText('1723522403')).toBeInTheDocument();
    expect(screen.getByText('Alfabetización Digital para Adultos Mayores')).toBeInTheDocument();
    expect(screen.getByText('Jaime Oswaldo Salvador Meneses')).toBeInTheDocument();
    expect(screen.getByText('Bitácora e Informe Validados')).toBeInTheDocument();
    expect(screen.getByText('80 horas')).toBeInTheDocument();

    // Selector de firma
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' })).toBeInTheDocument();

    // El botón de aprobación debe estar deshabilitado hasta subir archivo
    const botonAprobar = screen.getByRole('button', { name: /Aprobar/i });
    expect(botonAprobar).toBeDisabled();
  });

  it('debe habilitar el botón de aprobación al cargar archivo firmado en modo manual', () => {
    render(
      <ModalAprobarHorasSubdecano
        abierto={true}
        abrirModal={vi.fn()}
        asignacion={asignacionMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));
    expect(screen.getByText('Firma manual')).toBeInTheDocument();

    const input = document.getElementById('upload-cert-firmado') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const archivoMock = new File(['pdf-dummy'], 'certificado_firmado.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [archivoMock] } });

    expect(screen.getByText('certificado_firmado.pdf')).toBeInTheDocument();

    const botonAprobar = screen.getByRole('button', { name: 'Aprobar y Enviar Certificado Firmado' });
    expect(botonAprobar).not.toBeDisabled();
  });
});
