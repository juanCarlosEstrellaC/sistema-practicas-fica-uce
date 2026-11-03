import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalEditarAsignacionPractica } from '@/components/practicas/estudiantes/modal-editar-asignacion-practica';

vi.mock('@/lib/acciones/pp/convenio.acciones', () => ({
  obtenerConveniosAccion: vi.fn().mockResolvedValue({
    content: [{ id: 201, institucion: 'Empresa A', tipo: 'PRIVADA' }],
  }),
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  obtenerTutoresResumenAccion: vi.fn().mockResolvedValue([
    { id: 101, nombres: 'Carlos', apellidos: 'Mendoza', estudiantesAsignados: 2 },
  ]),
}));

describe('ModalEditarAsignacionPractica (Componente Modular Refactorizado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la tarjeta con avance proyectado, campos de edición y no debe permitir cambiar periodo académico', () => {
    const mockAsignacion = {
      id: 50,
      estudiante: {
        nombre: 'Juan Pérez',
        identificacion: '1723522403',
        correo: 'juan.perez@uce.edu.ec',
        carrera: 'Ingeniería en Computación',
      },
      convenio: { id: 201 },
      tutor: { id: 101 },
      horasAsignadas: 120,
      horasRequeridas: 240,
      horasAcumuladas: 0,
      asignacion: { periodoAcademicoId: 1, carreraId: 10 },
    };

    render(
      <ModalEditarAsignacionPractica
        asignacion={mockAsignacion}
        onClose={vi.fn()}
        onSave={vi.fn()}
        conveniosIniciales={[{ id: 201, institucion: 'Empresa A', tipo: 'PRIVADA' } as any]}
        tutoresIniciales={[{ id: '101', nombres: 'Carlos', apellidos: 'Mendoza', estudiantesAsignados: 2 } as any]}
      />
    );

    // Diálogo y encabezado
    expect(screen.getByText('Actualizar Asignación')).toBeInTheDocument();
    expect(screen.getAllByText(/Juan Pérez/i).length).toBeGreaterThan(0);

    // Tarjeta visual del estudiante y progreso proyectado (similar a VCS)
    expect(screen.getByText(/Avance proyectado:/i)).toBeInTheDocument();
    expect(screen.getByText(/120h de 240h/i)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/Máximo asignable:/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingeniería en Computación/i)).toBeInTheDocument();

    // Selectores permitidos
    expect(screen.getByText('Convenio Institucional')).toBeInTheDocument();
    expect(screen.getByText('Tutor Académico')).toBeInTheDocument();
    expect(screen.getByText('Horas Asignadas')).toBeInTheDocument();
    expect(screen.getByText(/Máx\. permitido:/i)).toBeInTheDocument();

    // Requisito clave: el periodo académico NO debe poder ser actualizado
    expect(screen.queryByText('Periodo Académico')).not.toBeInTheDocument();
  });

  it('debe mostrar error de validacion y deshabilitar boton guardar si se ingresa un numero invalido o excesivo', () => {
    const mockAsignacion = {
      id: 50,
      estudiante: { nombre: 'Pablo Palacios', identificacion: '1712345678' },
      convenio: { id: 201 },
      tutor: { id: 101 },
      horasAsignadas: 240,
      horasRequeridas: 240,
      horasAcumuladas: 0,
      asignacion: { periodoAcademicoId: 1, carreraId: 10 },
    };

    render(
      <ModalEditarAsignacionPractica
        asignacion={mockAsignacion}
        onClose={vi.fn()}
        onSave={vi.fn()}
        conveniosIniciales={[{ id: 201, institucion: 'Empresa A', tipo: 'PRIVADA' } as any]}
        tutoresIniciales={[{ id: '101', nombres: 'Carlos', apellidos: 'Mendoza', estudiantesAsignados: 2 } as any]}
      />
    );

    const inputHoras = screen.getByLabelText('Horas Asignadas');
    const botonGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });

    // Ingresar número absurdo como en el bug reportado (500000)
    fireEvent.change(inputHoras, { target: { value: '500000' } });
    expect(
      screen.getByText(/El estudiante solo puede recibir hasta 240 horas en esta asignación/i)
    ).toBeInTheDocument();
    expect(botonGuardar).toBeDisabled();

    // Ingresar 0
    fireEvent.change(inputHoras, { target: { value: '0' } });
    expect(
      screen.getByText(/Las horas asignadas deben ser mayores a 0/i)
    ).toBeInTheDocument();
    expect(botonGuardar).toBeDisabled();

    // Ingresar valor válido
    fireEvent.change(inputHoras, { target: { value: '160' } });
    expect(
      screen.queryByText(/El estudiante solo puede recibir hasta/i)
    ).not.toBeInTheDocument();
    expect(botonGuardar).not.toBeDisabled();
  });
});
