import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalCancelarAsignacionPractica } from '../estudiantes/modal-cancelar-asignacion-practica';
import { cancelarAsignacionPracticaAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { toast } from 'sonner';

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  cancelarAsignacionPracticaAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalCancelarAsignacionPractica (Componente UI)', () => {
  const asignacionPrueba: any = {
    id: 105,
    estudiante: {
      nombres: 'Ana',
      apellidos: 'Torres',
    },
    institucion: 'Ministerio de Telecomunicaciones',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si abierto es false o no hay asignacion', () => {
    const { container } = render(
      <ModalCancelarAsignacionPractica
        abierto={false}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título de confirmación y los datos de estudiante e institución', () => {
    render(
      <ModalCancelarAsignacionPractica
        abierto={true}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );

    expect(
      screen.getByText('¿Está seguro de cancelar esta práctica?')
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    expect(
      screen.getByText('"Ministerio de Telecomunicaciones"')
    ).toBeInTheDocument();
    expect(screen.getByText('Confirmar Cancelación')).toBeInTheDocument();
  });

  it('debe ejecutar cancelarAsignacionPracticaAccion al confirmar', async () => {
    (cancelarAsignacionPracticaAccion as any).mockResolvedValueOnce({
      exito: true,
      mensaje: 'Práctica cancelada con éxito',
    });

    const alCambiarAbierto = vi.fn();
    const alConfirmar = vi.fn();

    render(
      <ModalCancelarAsignacionPractica
        abierto={true}
        alCambiarAbierto={alCambiarAbierto}
        asignacion={asignacionPrueba}
        alConfirmar={alConfirmar}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Cancelación'));

    await waitFor(() => {
      expect(cancelarAsignacionPracticaAccion).toHaveBeenCalledWith(105);
      expect(toast.success).toHaveBeenCalledWith('Práctica cancelada con éxito');
      expect(alCambiarAbierto).toHaveBeenCalledWith(false);
      expect(alConfirmar).toHaveBeenCalled();
    });
  });

  it('debe mostrar mensaje de error si la accion falla', async () => {
    (cancelarAsignacionPracticaAccion as any).mockResolvedValueOnce({
      exito: false,
      mensaje: 'No se puede cancelar una práctica cuyas horas ya fueron aprobadas',
    });

    render(
      <ModalCancelarAsignacionPractica
        abierto={true}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Cancelación'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'No se puede cancelar una práctica cuyas horas ya fueron aprobadas'
      );
    });
  });
});
