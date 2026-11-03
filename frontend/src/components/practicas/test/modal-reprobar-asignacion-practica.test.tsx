import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalReprobarAsignacionPractica } from '../estudiantes/modal-reprobar-asignacion-practica';
import { reprobarAsignacionPracticaAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { toast } from 'sonner';

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  reprobarAsignacionPracticaAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalReprobarAsignacionPractica (Componente UI)', () => {
  const asignacionPrueba: any = {
    id: 205,
    estudiante: {
      nombres: 'Pedro',
      apellidos: 'Ramirez',
    },
    institucion: 'Corporación Nacional de Telecomunicaciones',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si abierto es false o no hay asignacion', () => {
    const { container } = render(
      <ModalReprobarAsignacionPractica
        abierto={false}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título de confirmación y los datos de estudiante e institución', () => {
    render(
      <ModalReprobarAsignacionPractica
        abierto={true}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );

    expect(
      screen.getByText('¿Está seguro de reprobar esta práctica?')
    ).toBeInTheDocument();
    expect(screen.getByText('Pedro Ramirez')).toBeInTheDocument();
    expect(
      screen.getByText('"Corporación Nacional de Telecomunicaciones"')
    ).toBeInTheDocument();
    expect(screen.getByText('Confirmar Reprobación')).toBeInTheDocument();
  });

  it('debe ejecutar reprobarAsignacionPracticaAccion al confirmar', async () => {
    (reprobarAsignacionPracticaAccion as any).mockResolvedValueOnce({
      exito: true,
      mensaje: 'Práctica reprobada con éxito',
    });

    const alCambiarAbierto = vi.fn();
    const alConfirmar = vi.fn();

    render(
      <ModalReprobarAsignacionPractica
        abierto={true}
        alCambiarAbierto={alCambiarAbierto}
        asignacion={asignacionPrueba}
        alConfirmar={alConfirmar}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Reprobación'));

    await waitFor(() => {
      expect(reprobarAsignacionPracticaAccion).toHaveBeenCalledWith(205);
      expect(toast.success).toHaveBeenCalledWith('Práctica reprobada con éxito');
      expect(alCambiarAbierto).toHaveBeenCalledWith(false);
      expect(alConfirmar).toHaveBeenCalled();
    });
  });

  it('debe mostrar mensaje de error si la accion falla', async () => {
    (reprobarAsignacionPracticaAccion as any).mockResolvedValueOnce({
      exito: false,
      mensaje: 'Solo se pueden reprobar prácticas que se encuentren en curso',
    });

    render(
      <ModalReprobarAsignacionPractica
        abierto={true}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Reprobación'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Solo se pueden reprobar prácticas que se encuentren en curso'
      );
    });
  });
});
