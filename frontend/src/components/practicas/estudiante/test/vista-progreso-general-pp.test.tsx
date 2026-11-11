import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaProgresoGeneralPp } from '../vista-progreso-general-pp';
import { AsignacionDto } from '@/lib/tipos/pp/general-pp';

describe('VistaProgresoGeneralPp - Validacion de horas tras emision de Aval', () => {
  const asignacionBase: AsignacionDto = {
    id: '100',
    convenioId: 'c-1',
    estudiante: {
      id: '10',
      nombres: 'Juan',
      apellidos: 'Pérez',
      identificacion: '1712345678',
      tipoIdentificacion: 'CEDULA',
      correo: 'estudiante@uce.edu.ec',
      telefono: '0999999999',
      carreraNombre: 'Computación',
      carreraId: 1,
      urlAvatar: '',
    },
    institucion: 'Google Ecuador - Sede Quito',
    fase: 'FINALIZACION',
    estado: 'EN_CURSO',
    horasAsignadas: 240,
    horasCompletadas: 240,
    validadoCpp: true,
    semestre: 8,
    fechaInicio: '2026-05-01',
    fechaFin: '2026-08-30',
    tutorInstitucional: 'David Ortiz',
    reunionRealizada: true,
    periodoAcademicoId: '1',
  };

  it('debe mostrar 0 horas validadas mientras la asignacion siga EN_CURSO sin Aval de Subdecanato', () => {
    render(
      <VistaProgresoGeneralPp
        asignaciones={[asignacionBase]}
        horasRequeridas={240}
        horasAcumuladas={0}
      />
    );

    expect(screen.getAllByText('0 horas').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('0% (0 / 240 h)')).toBeInTheDocument();
    expect(screen.getByText('0 / 240 horas')).toBeInTheDocument();
  });

  it('debe contabilizar 240 horas validadas y 0 horas en curso cuando la asignacion esta APROBADA con Aval', () => {
    const asignacionAprobada: AsignacionDto = {
      ...asignacionBase,
      estado: 'APROBADO',
      horasCompletadas: 240,
    };

    render(
      <VistaProgresoGeneralPp
        asignaciones={[asignacionAprobada]}
        horasRequeridas={240}
        horasAcumuladas={0}
      />
    );

    expect(screen.getByText('100% (240 / 240 h)')).toBeInTheDocument();
    expect(screen.getByText('240 / 240 horas')).toBeInTheDocument();
    expect(screen.getAllByText('0 horas').length).toBeGreaterThanOrEqual(2);
  });
});

