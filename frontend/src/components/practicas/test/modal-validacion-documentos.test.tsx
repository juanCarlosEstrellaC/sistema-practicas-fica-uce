import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ModalValidacionDocumentos } from '../estudiantes/modal-validacion-documentos';

vi.mock('@/lib/acciones/pp/documento-portafolio.acciones', () => ({
  revisarDocumentoPortafolioAccion: vi.fn(),
  obtenerDocumentosPorEstudianteAccion: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  validarCppAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalValidacionDocumentos (Componente UI)', () => {
  it('debe renderizarse sin advertencias de claves duplicadas cuando no hay documentos cargados', () => {
    const espiaErrorConsola = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ModalValidacionDocumentos
        open={true}
        onOpenChange={vi.fn()}
        documentos={[]}
        estudianteId="10"
        asignacionId="20"
        onValidacionCompleta={vi.fn()}
      />
    );

    // Verificar que el modal y los botones de tipos de documentos se rendericen
    expect(screen.getByText('Validación de Documentos del Portafolio')).toBeInTheDocument();
    expect(screen.getAllByText('Hoja de Vida (CV)').length).toBeGreaterThan(0);
    expect(screen.getByText('Documento de Identidad')).toBeInTheDocument();
    expect(screen.getByText('Informe Final')).toBeInTheDocument();
    expect(screen.getByText('Certificado de Cumplimiento')).toBeInTheDocument();

    // Comprobar que no haya errores de React por keys duplicadas
    const llamadasConKeyError = espiaErrorConsola.mock.calls.filter((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes('same key'))
    );
    expect(llamadasConKeyError).toHaveLength(0);

    espiaErrorConsola.mockRestore();
  });

  it('permite alternar entre los documentos requeridos sin error', () => {
    render(
      <ModalValidacionDocumentos
        open={true}
        onOpenChange={vi.fn()}
        documentos={[]}
        estudianteId="10"
        asignacionId="20"
        onValidacionCompleta={vi.fn()}
      />
    );

    const botonInformeFinal = screen.getByRole('button', { name: /informe final/i });
    fireEvent.click(botonInformeFinal);

    expect(screen.getByText('El estudiante aún no ha subido este documento.')).toBeInTheDocument();
  });

  it('aplica las clases y colores de badges correspondientes al diseño de portafolio', () => {
    const documentosMock = [
      {
        id: 1,
        tipo: 'CV',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/cv.pdf',
        nombre: 'cv.pdf',
      },
      {
        id: 2,
        tipo: 'DOCUMENTO_IDENTIDAD',
        estado: 'RECHAZADO',
        url: 'https://ejemplo.com/cedula.pdf',
        nombre: 'cedula.pdf',
        observacion: 'Falta reverso',
      },
      {
        id: 3,
        tipo: 'SEGUIMIENTO_TA',
        estado: 'PENDIENTE_REVISION',
        url: 'https://ejemplo.com/seguimiento.pdf',
        nombre: 'seguimiento.pdf',
      },
      {
        id: 4,
        tipo: 'INFORME_FINAL',
        estado: 'PENDIENTE',
        url: '',
        nombre: '',
      },
    ];

    render(
      <ModalValidacionDocumentos
        open={true}
        onOpenChange={vi.fn()}
        documentos={documentosMock}
        estudianteId="10"
        asignacionId="20"
        onValidacionCompleta={vi.fn()}
      />
    );

    // Badge Aprobado con estilo emerald de portafolio
    const badgeAprobado = screen.getAllByText('Aprobado')[0];
    expect(badgeAprobado).toHaveClass('bg-emerald-500/10', 'text-emerald-600', 'border-emerald-200');

    // Badge Rechazado con estilo destructive de portafolio (sin variant destructive)
    const badgeRechazado = screen.getAllByText('Rechazado')[0];
    expect(badgeRechazado).toHaveClass('bg-destructive/10', 'text-destructive', 'border-destructive/20');

    // Badge En Revisión con estilo amber de portafolio
    const badgeEnRevision = screen.getByText('En Revisión');
    expect(badgeEnRevision).toHaveClass('bg-amber-500/10', 'text-amber-600', 'border-amber-200');

    // Badge Pendiente (sin archivo)
    const badgesPendiente = screen.getAllByText('Pendiente');
    expect(badgesPendiente.length).toBeGreaterThan(0);
  });

  it('muestra la descripcion con el nombre del estudiante, la fecha de los archivos y el nombre del documento con su pdf', () => {
    const documentosMock = [
      {
        id: 1,
        tipo: 'CV',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/cv_juan_carlos.pdf',
        nombre: 'cv_juan_carlos.pdf',
        fechaSubida: '2026-10-27T14:30:00Z',
      },
      {
        id: 2,
        tipo: 'DOCUMENTO_IDENTIDAD',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/cedula.pdf',
        nombre: 'cedula.pdf',
        fechaSubida: '2026-10-28T09:00:00Z',
      },
    ];

    render(
      <ModalValidacionDocumentos
        open={true}
        onOpenChange={vi.fn()}
        documentos={documentosMock}
        estudianteId="10"
        nombreEstudiante="Juan Carlos Estrella Caicedo"
        asignacionId="20"
        onValidacionCompleta={vi.fn()}
      />
    );

    // 1. Descripcion con el nombre del estudiante
    expect(screen.getByText('Juan Carlos Estrella Caicedo')).toBeInTheDocument();
    expect(screen.getByText(/Estudiante:/i)).toBeInTheDocument();

    // 2. Fecha de los archivos
    expect(screen.getByText('27/10/2026')).toBeInTheDocument();
    expect(screen.getByText('28/10/2026')).toBeInTheDocument();

    // 3. Al estar CV y Cédula aprobados, si se selecciona Hoja de Vida (CV) muestra el nombre del PDF y su iframe
    fireEvent.click(screen.getByRole('button', { name: /Hoja de Vida \(CV\)/i }));

    const elementoPdf = screen.getByText('cv_juan_carlos.pdf');
    expect(elementoPdf).toBeInTheDocument();
    expect(elementoPdf).toHaveClass('truncate', 'min-w-0');
    expect(screen.getByText('|')).toBeInTheDocument();

    // 4. El iframe usa la ruta de previsualización protegida del controlador a través del proxy
    const iframe = screen.getByTitle(/Visor cv_juan_carlos\.pdf/i);
    expect(iframe).toHaveAttribute('src', '/api/proxy/documentos/1/preview');
  });

  it('oculta el boton Revertir a Pendiente para CV y Documento de Identidad aprobados, y salta al primer documento pendiente al abrir', () => {
    const documentosMock = [
      {
        id: 1,
        tipo: 'CV',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/cv.pdf',
        nombre: 'cv.pdf',
      },
      {
        id: 2,
        tipo: 'DOCUMENTO_IDENTIDAD',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/cedula.pdf',
        nombre: 'cedula.pdf',
      },
      {
        id: 3,
        tipo: 'SEGUIMIENTO_TA',
        estado: 'PENDIENTE_REVISION',
        url: 'https://ejemplo.com/seguimiento.pdf',
        nombre: 'seguimiento.pdf',
      },
      {
        id: 4,
        tipo: 'INFORME_FINAL',
        estado: 'APROBADO',
        url: 'https://ejemplo.com/informe.pdf',
        nombre: 'informe.pdf',
      },
    ];

    render(
      <ModalValidacionDocumentos
        open={true}
        onOpenChange={vi.fn()}
        documentos={documentosMock}
        estudianteId="10"
        asignacionId="20"
        onValidacionCompleta={vi.fn()}
      />
    );

    // 1. Por defecto salta CV y Cedula (ya aprobados) y posiciona en Seguimiento TA
    expect(screen.getByText('seguimiento.pdf')).toBeInTheDocument();

    // 2. Al seleccionar CV (aprobado), no muestra el botón Revertir a Pendiente
    fireEvent.click(screen.getByRole('button', { name: /Hoja de Vida \(CV\)/i }));
    expect(
      screen.getByText(/Este documento ya fue aprobado y se reutiliza en todas las prácticas del estudiante/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revertir a Pendiente/i })).not.toBeInTheDocument();

    // 3. Al seleccionar Informe Final (aprobado, documento de la práctica puntual), SÍ muestra Revertir a Pendiente
    fireEvent.click(screen.getByRole('button', { name: /Informe Final/i }));
    expect(screen.getByRole('button', { name: /Revertir a Pendiente/i })).toBeInTheDocument();
  });
});
