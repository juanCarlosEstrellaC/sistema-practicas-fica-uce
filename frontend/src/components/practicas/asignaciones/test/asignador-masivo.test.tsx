import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AsignadorMasivoPracticas } from '@/components/practicas/asignaciones/asignador-masivo-practicas';
import { UsuarioDto, ConvenioDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';

const mockAsignarMasivoAccion = vi.fn().mockResolvedValue({
  exito: true,
  mensaje: 'Se asignó exitosamente 1 estudiante',
  data: { exitosos: 1, errores: 0 },
});

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  asignarEstudiantesPracticasMasivoAccion: (...args: any[]) => mockAsignarMasivoAccion(...args),
  obtenerEstudiantesDisponiblesPracticasAccion: vi.fn().mockResolvedValue([]),
  obtenerTutoresResumenAccion: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/acciones/pp/convenio.acciones', () => ({
  obtenerConveniosAccion: vi.fn().mockResolvedValue({ content: [] }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockEstudiantes: UsuarioDto[] = [
  {
    id: '301',
    nombres: 'Ana',
    apellidos: 'Perez',
    identificacion: '1711111111',
    correo: 'ana.perez@uce.edu.ec',
    rol: 'ESTUDIANTE',
    carreraId: '10',
    horasRequeridas: 240,
    horasAcumuladas: 80,
  },
];

const mockConvenios: ConvenioDto[] = [
  {
    id: '201',
    institucion: 'Empresa Tech Ecuador',
    tutorInstitucional: 'Ing. Supervisor',
    correoTutor: 'supervisor@tech.ec',
    telefonoTutor: '0999999999',
    direccion: 'Quito',
    cuposTotales: 5,
    ocupados: 1,
    tipo: 'PRIVADA',
    campoEspecifico: 1,
    estado: 'ACTIVO',
    fechaInicio: '2025-01-01',
    fechaFin: '2026-01-01',
  },
];

const mockTutores: TutorResumenDto[] = [
  {
    id: '101',
    nombres: 'Carlos',
    apellidos: 'Mendoza',
    correo: 'carlos.mendoza@uce.edu.ec',
    especialidad: 'Software',
    estudiantesAsignados: 2,
    urlAvatar: '',
  },
];

describe('AsignadorMasivoPracticas (Componente Modular Refactorizado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar las 3 columnas de estudiantes, convenios y tutores', () => {
    render(
      <AsignadorMasivoPracticas
        estudiantes={mockEstudiantes}
        convenios={mockConvenios}
        tutores={mockTutores}
        periodoAcademicoId={1}
        carreraId={10}
      />
    );

    expect(screen.getByText(/^Estudiantes/i)).toBeInTheDocument();
    expect(screen.getByText('Ana Perez')).toBeInTheDocument();
    expect(screen.getByText('C.I: 1711111111')).toBeInTheDocument();
    expect(screen.getByText('80/240h')).toBeInTheDocument();

    expect(screen.getByText('Convenio / Empresa')).toBeInTheDocument();
    expect(screen.getByText('Empresa Tech Ecuador')).toBeInTheDocument();
    expect(screen.getByText(/4 disponibles de 5/i)).toBeInTheDocument();

    expect(screen.getByText('Tutor Académico')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText(/2 asignados de 10/i)).toBeInTheDocument();
  });

  it('debe habilitar el botón de confirmación tras seleccionar estudiante, convenio y tutor', async () => {
    render(
      <AsignadorMasivoPracticas
        estudiantes={mockEstudiantes}
        convenios={mockConvenios}
        tutores={mockTutores}
        periodoAcademicoId={1}
        carreraId={10}
      />
    );

    const botonConfirmar = screen.getByRole('button', { name: /Confirmar Asignación \(0\)/i });
    expect(botonConfirmar).toBeDisabled();

    // 1. Seleccionar estudiante
    fireEvent.click(screen.getByText('Ana Perez'));

    // 2. Seleccionar convenio
    fireEvent.click(screen.getByText('Empresa Tech Ecuador'));

    // 3. Seleccionar tutor
    fireEvent.click(screen.getByText('Carlos Mendoza'));

    // Botón habilitado
    await waitFor(() => {
      expect(botonConfirmar).not.toBeDisabled();
      expect(botonConfirmar).toHaveTextContent('Confirmar Asignación (1)');
    });

    // Clic en Confirmar abre el Modal de Resumen
    fireEvent.click(botonConfirmar);

    await waitFor(() => {
      expect(screen.getByText('Resumen de Asignación de Prácticas')).toBeInTheDocument();
      expect(screen.getByText('Institución receptora / Convenio:')).toBeInTheDocument();
    });

    // Confirmar en el modal llama a la Server Action
    const botonModalConfirmar = screen.getByRole('button', { name: 'Confirmar Asignación' });
    fireEvent.click(botonModalConfirmar);

    await waitFor(() => {
      expect(mockAsignarMasivoAccion).toHaveBeenCalledWith({
        estudianteIds: [301],
        convenioId: 201,
        tutorAcademicoId: 101,
        periodoAcademicoId: 1,
        horasAsignadas: 80,
      });
    });
  });

  it('debe permitir escribir las horas a asignar y validar el límite máximo', () => {
    render(
      <AsignadorMasivoPracticas
        estudiantes={mockEstudiantes}
        convenios={mockConvenios}
        tutores={mockTutores}
        periodoAcademicoId={1}
        carreraId={10}
        horasMaximasCarrera={240}
      />
    );

    const inputHoras = screen.getByRole('spinbutton');
    expect(inputHoras).toBeInTheDocument();
    expect(inputHoras).toHaveValue(80);

    // Escribir 120 horas
    fireEvent.change(inputHoras, { target: { value: '120' } });
    expect(inputHoras).toHaveValue(120);

    // Seleccionar estudiante que tiene 80 acumuladas de 240 (max 160)
    fireEvent.click(screen.getByText('Ana Perez'));
    expect(screen.getByText('(Máximo permitido: 160h)')).toBeInTheDocument();
  });
});
