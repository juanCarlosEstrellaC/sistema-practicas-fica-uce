import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalProcesarObservacion } from '../modal-procesar-observacion';
import { ObservacionDto } from '@/lib/tipos/pp/general-pp';

vi.mock('@/lib/acciones/pp/observacion.acciones', () => ({
  procesarObservacionAccion: vi.fn().mockResolvedValue({ exito: true, mensaje: 'Procesado con exito' }),
}));

describe('ModalProcesarObservacion', () => {
  const observacionMock: ObservacionDto = {
    id: 1,
    remitenteId: 10,
    remitente: {
      id: 10,
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      carreraNombre: 'Sistemas',
    },
    carreraId: 1,
    empresa: 'Google Ecuador - Sede Quito',
    tipo: 'ANULACION',
    descripcion: 'pa q la pases bien Motivo de rechazo: ella brinca y salta',
    estado: 'RECHAZADA',
    fecha: '2026-10-29T10:00:00Z',
    contacto: 'Ing. Supervisor',
    correo: 'contacto@google.com',
  };

  it('debe desglosar la propuesta y el motivo de rechazo en bloques separados', () => {
    render(
      <ModalProcesarObservacion
        observacion={observacionMock}
        abierto={true}
        esSubdecano={true}
        alCerrar={vi.fn()}
      />
    );

    expect(screen.getByText('Observación de Anulación')).toBeInTheDocument();
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
    expect(screen.getByText('pa q la pases bien')).toBeInTheDocument();
    expect(screen.getByText('Motivo del Rechazo Emitido')).toBeInTheDocument();
    expect(screen.getByText('ella brinca y salta')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
  });

  it('no debe renderizar nada si abierto es false', () => {
    const { container } = render(
      <ModalProcesarObservacion
        observacion={observacionMock}
        abierto={false}
        esSubdecano={true}
        alCerrar={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

