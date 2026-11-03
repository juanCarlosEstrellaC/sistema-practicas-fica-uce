import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TablaObservacionesConvenio } from '../tabla-observaciones-convenio';
import { ObservacionDto } from '@/lib/tipos/pp/general-pp';

// Mock de Next Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/dashboard/practicas/convenios',
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock de acciones
vi.mock('@/lib/acciones/pp/observacion.acciones', () => ({
  procesarObservacionAccion: vi.fn().mockResolvedValue({ exito: true, mensaje: 'Procesado con exito' }),
  obtenerObservacionPorIdAccion: vi.fn().mockResolvedValue(null),
}));

describe('TablaObservacionesConvenio', () => {
  const observacionesPrueba: ObservacionDto[] = [
    {
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
    },
    {
      id: 2,
      remitenteId: 11,
      remitente: {
        id: 11,
        nombres: 'Ana',
        apellidos: 'Torres',
        carreraNombre: 'Computacion',
      },
      carreraId: 1,
      empresa: 'Banco Pichincha',
      tipo: 'NUEVA',
      descripcion: 'Solicitud de convenio para practicas preprofesionales',
      estado: 'PENDIENTE',
      fecha: '2026-10-28T14:30:00Z',
    },
  ];

  const propsBase = {
    observaciones: observacionesPrueba,
    totalPaginas: 1,
    totalElementos: 2,
    paginaActual: 0,
    elementosPorPagina: 10,
    esSubdecano: true,
    filtroTexto: '',
    filtroTipo: 'all',
    filtroEstado: 'all',
    onCambioFiltroTexto: vi.fn(),
    onCambioFiltroTipo: vi.fn(),
    onCambioFiltroEstado: vi.fn(),
    onCambioPagina: vi.fn(),
    onCambioElementosPorPagina: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe desglosar y presentar por separado la propuesta y el motivo de rechazo en la tabla', () => {
    render(<TablaObservacionesConvenio {...propsBase} />);

    // Verifica que la empresa este presente
    expect(screen.getAllByText('Google Ecuador - Sede Quito').length).toBeGreaterThan(0);

    // Verifica que la justificacion original este separada y visible
    expect(screen.getAllByText('pa q la pases bien').length).toBeGreaterThan(0);

    // Verifica que la etiqueta y el texto de rechazo esten presentes y formateados
    expect(screen.getAllByText('Motivo de rechazo:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ella brinca y salta').length).toBeGreaterThan(0);
  });

  it('debe renderizar correctamente los badges de estado para cada registro', () => {
    render(<TablaObservacionesConvenio {...propsBase} />);

    expect(screen.getAllByText('Rechazada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
  });

  it('debe renderizar los datos del remitente cuando esSubdecano es true', () => {
    render(<TablaObservacionesConvenio {...propsBase} esSubdecano={true} />);

    expect(screen.getAllByText('Carlos Mendoza').length).toBeGreaterThan(0);
  });

  it('debe renderizar la accion de Ver en la tabla', () => {
    render(<TablaObservacionesConvenio {...propsBase} />);

    const botonesVer = screen.getAllByRole('button', { name: /ver/i });
    expect(botonesVer.length).toBeGreaterThan(0);
  });
});
