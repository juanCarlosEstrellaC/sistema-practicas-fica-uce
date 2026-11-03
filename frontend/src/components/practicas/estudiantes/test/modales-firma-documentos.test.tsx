import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModalEmitirCartaCpp } from '../modal-emitir-carta-cpp';
import { ModalGenerarAvalSubdecano } from '../modal-generar-aval-subdecano';

// Mock de servicios y acciones
vi.mock('@/lib/servicios/documento.servicio', () => ({
  subirArchivo: vi.fn().mockResolvedValue('https://storage.uce.edu.ec/documentos/test.pdf'),
  CARPETAS_ARCHIVOS: {
    CARTAS_ASIGNACION: 'cartas-asignacion',
    AVALES: 'avales',
  },
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  emitirCartaAsignacionAccion: vi.fn().mockResolvedValue({ exito: true, mensaje: 'OK' }),
  generarAvalAccion: vi.fn().mockResolvedValue({ exito: true, mensaje: 'OK' }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalEmitirCartaCpp - Rediseño con Wireframe', () => {
  it('debe renderizar con el estado inicial de selección, detalles del correo y botón Enviar Carta deshabilitado', () => {
    render(
      <ModalEmitirCartaCpp
        abierto={true}
        alCambiarAbierto={() => {}}
        asignacionId={123}
        nombreEstudiante="Juan Perez"
        tutorInstitucional="Ing. Carlos Mendoza"
        correoTutorInstitucional="cmendoza@empresa.com"
        institucion="Tech Solutions S.A."
      />
    );

    // Titulo
    expect(screen.getByText('Confirmar Emisión de Carta de Asignación')).toBeInTheDocument();

    // Notificación por correo: Destinatario, Asunto, Cuerpo
    expect(screen.getByText(/Notificación al Tutor Institucional/i)).toBeInTheDocument();
    expect(screen.getByText(/Destinatario:/i)).toBeInTheDocument();
    expect(screen.getByText(/Ing\. Carlos Mendoza <cmendoza@empresa\.com>/i)).toBeInTheDocument();
    expect(screen.getByText(/Asunto:/i)).toBeInTheDocument();
    expect(screen.getByText('Carta de Asignación - Prácticas Preprofesionales UCE')).toBeInTheDocument();
    expect(screen.getByText(/Cuerpo del correo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Solutions S\.A\./i)).toBeInTheDocument();

    // Botones iniciales
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' })).toBeInTheDocument();

    // El boton Enviar Carta debe existir y estar deshabilitado
    const botonEnviar = screen.getByRole('button', { name: 'Enviar Carta' });
    expect(botonEnviar).toBeDisabled();
  });

  it('debe cambiar al modo manual al pulsar "Sin FirmaEC", mostrar pasos unificados y permitir volver', () => {
    render(
      <ModalEmitirCartaCpp
        abierto={true}
        alCambiarAbierto={() => {}}
        asignacionId={123}
        nombreEstudiante="Juan Perez"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    // Secciones del modo manual
    expect(screen.getByText('Firma manual')).toBeInTheDocument();
    expect(screen.getByText(/Instrucciones de firma:/i)).toBeInTheDocument();
    expect(screen.getByText(/Descargar PDF:/i)).toBeInTheDocument();
    expect(screen.getByText(/Firmar documento:/i)).toBeInTheDocument();
    expect(screen.getByText(/esferográfico azul/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.getByText('Subir')).toBeInTheDocument();

    // Volver a la selección inicial
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
  });
});

describe('ModalGenerarAvalSubdecano - Rediseño con Wireframe', () => {
  it('debe renderizar el título, la explicación de acreditación y el botón Aprobar Aval deshabilitado', () => {
    render(
      <ModalGenerarAvalSubdecano
        abierto={true}
        alCambiarAbierto={() => {}}
        asignacionId={456}
        nombreEstudiante="Maria Gomez"
      />
    );

    expect(screen.getByText('Generar y Firmar Aval de Cumplimiento')).toBeInTheDocument();
    expect(screen.getByText('Acreditación de Práctica')).toBeInTheDocument();

    const botonAprobar = screen.getByRole('button', { name: 'Aprobar Aval' });
    expect(botonAprobar).toBeDisabled();
  });

  it('debe mostrar las instrucciones unificadas (base descargar/subir con opción editor o esferográfico azul) y permitir subir', () => {
    render(
      <ModalGenerarAvalSubdecano
        abierto={true}
        alCambiarAbierto={() => {}}
        asignacionId={456}
        nombreEstudiante="Maria Gomez"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    // Verificación de instrucciones unificadas
    expect(screen.getByText(/Instrucciones de firma:/i)).toBeInTheDocument();
    expect(screen.getByText(/Descargar PDF:/i)).toBeInTheDocument();
    expect(screen.getByText(/Firmar documento:/i)).toBeInTheDocument();
    expect(screen.getByText(/editor de PDF del visor/i)).toBeInTheDocument();
    expect(screen.getByText(/esferográfico azul/i)).toBeInTheDocument();

    // Simular subida de archivo
    const inputArchivo = document.getElementById('subir-aval-firmado') as HTMLInputElement;
    expect(inputArchivo).toBeInTheDocument();

    const archivoMock = new File(['contenido pdf dummy'], 'aval_firmado.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(inputArchivo, { target: { files: [archivoMock] } });

    // Archivo mostrado y botón de aprobación habilitado
    expect(screen.getByText('aval_firmado.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobar Aval' })).not.toBeDisabled();
  });
});
