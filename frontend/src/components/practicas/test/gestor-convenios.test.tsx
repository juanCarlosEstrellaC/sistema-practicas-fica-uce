import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaGestionConvenios } from '@/components/practicas/convenios/vista-gestion-convenios';

// Mocks de hooks y navegación
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'subtab' ? 'actuales' : null),
    toString: () => '',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/dashboard/practicas/convenios',
}));

vi.mock('@/lib/acciones/pp/convenio.acciones', () => ({
  obtenerConveniosAccion: vi.fn().mockResolvedValue({
    content: [
      {
        id: '1',
        institucion: 'Empresa Pública de Telecomunicaciones',
        tipo: 'PUBLICO',
        campoEspecifico: 1,
        fechaInicio: '2025-01-01',
        fechaFin: '2026-12-31',
        estado: 'ACTIVO',
        tutorInstitucional: 'Ing. Roberto Andrade',
        correoTutor: 'roberto.andrade@empresa.ec',
        telefonoTutor: '0991234567',
        direccion: 'Av. Amazonas y Colón',
        cuposTotales: 10,
        ocupados: 4,
        documentoUrl: null,
        nombreDocumento: null,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: false,
  }),
  crearConvenioAccion: vi.fn(),
  actualizarConvenioAccion: vi.fn(),
  eliminarConvenioAccion: vi.fn(),
}));

vi.mock('@/lib/acciones/pp/observacion.acciones', () => ({
  obtenerObservacionesAccion: vi.fn().mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  }),
  crearObservacionAccion: vi.fn(),
  procesarObservacionAccion: vi.fn(),
}));

describe('VistaGestionConvenios (Modularizado y Refactorizado con Server Actions)', () => {
  it('debe renderizar el título de convenios y la institución en la tabla', async () => {
    render(<VistaGestionConvenios rol="SUBDECANO" usuarioId="1" />);

    expect(screen.getByText('Listado de Convenios Institucionales')).toBeInTheDocument();
    const elementosInstitucion = await screen.findAllByText('Empresa Pública de Telecomunicaciones');
    expect(elementosInstitucion.length).toBeGreaterThan(0);
    const elementosTutor = await screen.findAllByText('Ing. Roberto Andrade');
    expect(elementosTutor.length).toBeGreaterThan(0);
  });

  it('debe mostrar el botón de Nuevo Convenio para el rol de SUBDECANO', async () => {
    render(<VistaGestionConvenios rol="SUBDECANO" usuarioId="1" />);

    expect(await screen.findByText('Nuevo Convenio')).toBeInTheDocument();
  });

  it('debe mostrar el botón de Sugerir nuevo convenio para roles que no son SUBDECANO', async () => {
    render(<VistaGestionConvenios rol="DIRECTOR_CARRERA" usuarioId="2" />);

    expect(await screen.findByText('Sugerir nuevo convenio')).toBeInTheDocument();
  });
});
