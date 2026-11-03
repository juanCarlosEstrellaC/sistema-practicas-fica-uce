import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalEliminarAsignacionPractica } from '../modal-eliminar-asignacion-practica';
import * as acciones from '@/lib/acciones/pp/asignacion-practica.acciones';

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  eliminarAsignacionPracticaAccion: vi.fn(),
}));

describe('ModalEliminarAsignacionPractica (Componente UI)', () => {
  const asignacionPrueba = {
    id: 99,
    estudiante: {
      id: 10,
      nombres: 'Esteban',
      apellidos: 'Quito',
    },
    institucion: 'Empresa Electrica Quito',
  };

  it('no debe renderizar nada si abierto es falso', () => {
    const { container } = render(
      <ModalEliminarAsignacionPractica
        abierto={false}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba as any}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('debe renderizar la advertencia con el nombre del estudiante y la institucion', () => {
    render(
      <ModalEliminarAsignacionPractica
        abierto={true}
        alCambiarAbierto={vi.fn()}
        asignacion={asignacionPrueba as any}
      />
    );

    expect(screen.getByText('¿Está seguro de eliminar esta asignación?')).toBeInTheDocument();
    expect(screen.getByText('Esteban Quito')).toBeInTheDocument();
    expect(screen.getByText('"Empresa Electrica Quito"')).toBeInTheDocument();
  });

  it('debe invocar eliminarAsignacionPracticaAccion al confirmar eliminacion', async () => {
    vi.mocked(acciones.eliminarAsignacionPracticaAccion).mockResolvedValue({
      exito: true,
      mensaje: 'Asignacion eliminada con exito',
    });

    const alCambiarAbiertoMock = vi.fn();
    const alEliminadoExitosoMock = vi.fn();

    render(
      <ModalEliminarAsignacionPractica
        abierto={true}
        alCambiarAbierto={alCambiarAbiertoMock}
        asignacion={asignacionPrueba as any}
        alEliminadoExitoso={alEliminadoExitosoMock}
      />
    );

    const botonEliminar = screen.getByRole('button', { name: /eliminar asignación/i });
    fireEvent.click(botonEliminar);

    await waitFor(() => {
      expect(acciones.eliminarAsignacionPracticaAccion).toHaveBeenCalledWith(99);
      expect(alCambiarAbiertoMock).toHaveBeenCalledWith(false);
      expect(alEliminadoExitosoMock).toHaveBeenCalled();
    });
  });
});
