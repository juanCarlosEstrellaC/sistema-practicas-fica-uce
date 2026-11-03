import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccionesTutorAcademico } from '@/components/practicas/estudiantes/acciones-tutor-academico';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  iniciarDesarrolloAccion: vi.fn(),
  firmarRegistroAccion: vi.fn(),
}));

describe('AccionesTutorAcademico (Pruebas Previas de Caracterización)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el botón para Iniciar Desarrollo si la fase es ASIGNACION y la carta de asignación fue emitida', () => {
    const mockDatos = {
      asignacion: {
        id: 50,
        fase: 'ASIGNACION',
        cartaAsignacionEnviada: true,
      },
    };

    render(
      <AccionesTutorAcademico
        estudianteSeleccionado="301"
        datosEstudianteSeleccionado={mockDatos}
      />
    );

    expect(screen.getByText('Inicio de Desarrollo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Desarrollo/i })).toBeInTheDocument();
  });

  it('no debe renderizar Inicio de Desarrollo si la fase es ASIGNACION y la carta de asignación no ha sido emitida', () => {
    const mockDatos = {
      asignacion: {
        id: 50,
        fase: 'ASIGNACION',
        cartaAsignacionEnviada: false,
      },
    };

    const { container } = render(
      <AccionesTutorAcademico
        estudianteSeleccionado="301"
        datosEstudianteSeleccionado={mockDatos}
      />
    );

    expect(screen.queryByText('Inicio de Desarrollo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar Desarrollo/i })).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('debe renderizar el botón para Cargar Documentos de Finalización si la fase es DESARROLLO', () => {
    const mockDatos = {
      asignacion: {
        id: 50,
        fase: 'DESARROLLO',
      },
    };

    render(
      <AccionesTutorAcademico
        estudianteSeleccionado="301"
        datosEstudianteSeleccionado={mockDatos}
      />
    );

    expect(
      screen.getByRole('button', { name: /Cargar Documentos de Finalización/i })
    ).toBeInTheDocument();
  });

  it('debe permitir arrastrar y soltar archivos válidos en los selectores de drag and drop', () => {
    const mockDatos = {
      asignacion: {
        id: 50,
        fase: 'DESARROLLO',
      },
    };

    render(
      <AccionesTutorAcademico
        estudianteSeleccionado="301"
        datosEstudianteSeleccionado={mockDatos}
      />
    );

    // Abrir modal
    const botonModal = screen.getByRole('button', { name: /Cargar Documentos de Finalización/i });
    fireEvent.click(botonModal);

    // Verificar que el modal se abrió con las 3 zonas
    expect(screen.getByText('1. Registro de Seguimiento / Asistencia')).toBeInTheDocument();
    expect(screen.getByText('2. Informe Final de Prácticas')).toBeInTheDocument();
    expect(screen.getByText('3. Certificado de Cumplimiento Institucional')).toBeInTheDocument();

    // Obtener la zona de drop para Seguimiento
    const zonaSeguimiento = screen.getByText('1. Registro de Seguimiento / Asistencia').closest('div')!;

    // Simular dragover
    fireEvent.dragOver(zonaSeguimiento);

    // Simular drop de archivo PDF válido
    const archivoSeguimiento = new File(['contenido'], 'asistencia_marzo.pdf', { type: 'application/pdf' });
    fireEvent.drop(zonaSeguimiento, {
      dataTransfer: {
        files: [archivoSeguimiento],
      },
    });

    // Debe mostrar el nombre del archivo cargado
    expect(screen.getByText('asistencia_marzo.pdf')).toBeInTheDocument();
  });
});
