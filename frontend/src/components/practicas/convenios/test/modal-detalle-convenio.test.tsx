import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ModalDetalleConvenio } from '../modal-detalle-convenio';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';

describe('ModalDetalleConvenio (Componente Modular UI)', () => {
  const convenioMock: ConvenioDto = {
    id: 1,
    institucion: 'Corporación Nacional de Telecomunicaciones',
    tipo: 'PUBLICO',
    cuposTotales: 10,
    ocupados: 2,
    estado: 'ACTIVO',
    campoEspecifico: 613,
    direccion: 'Av. Amazonas y Gaspar de Villarroel',
    fechaInicio: '2025-01-01',
    fechaFin: '2030-01-01',
    tutorInstitucional: 'Ing. Carlos Ramos',
    correoTutor: 'carlos.ramos@cnt.gob.ec',
    telefonoTutor: '0991234567',
    urlDocumento: 'https://ejemplo.com/convenio.pdf',
    nombreDocumento: 'convenio_cnt.pdf',
  };

  it('debe renderizar la institución y el badge de estado en el encabezado', () => {
    render(
      <ModalDetalleConvenio
        convenio={convenioMock}
        abierto={true}
        alCerrar={vi.fn()}
      />
    );

    expect(screen.getByText('Corporación Nacional de Telecomunicaciones')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Datos Generales')).toBeInTheDocument();
    expect(screen.getByText('Responsable Institucional')).toBeInTheDocument();
  });

  it('no debe renderizar nada si abierto es false', () => {
    const { container } = render(
      <ModalDetalleConvenio
        convenio={convenioMock}
        abierto={false}
        alCerrar={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
