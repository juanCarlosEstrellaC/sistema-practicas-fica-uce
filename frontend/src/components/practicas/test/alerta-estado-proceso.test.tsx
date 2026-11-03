import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AlertaEstadoProceso } from '../estudiantes/alerta-estado-proceso';

describe('AlertaEstadoProceso (Personalización por Rol y Fase)', () => {
  it('debe renderizar alerta informativa de culminación cuando el estado es APROBADO o COMPLETADO', () => {
    render(
      <AlertaEstadoProceso fase="FINALIZACION" estado="COMPLETADO" />
    );
    expect(screen.getByText('Prácticas preprofesionales culminadas')).toBeInTheDocument();
    expect(screen.getByText('Proceso completado')).toBeInTheDocument();
  });

  it('debe mostrar mensaje destructivo si el estado es CANCELADO o REPROBADO', () => {
    render(<AlertaEstadoProceso fase="DESARROLLO" estado="CANCELADO" />);
    expect(screen.getByText('Prácticas canceladas')).toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Director de Carrera cuando falta enviar la carta de asignación', () => {
    render(
      <AlertaEstadoProceso
        fase="ASIGNACION"
        estado="EN_CURSO"
        tieneCarta={false}
        rol="DIRECTOR_CARRERA"
      />
    );
    expect(screen.getByText('Carta de Asignación pendiente')).toBeInTheDocument();
    expect(
      screen.getByText('Esperando emisión y envío por su parte de la carta de asignación para formalizar el inicio de la práctica.')
    ).toBeInTheDocument();
    expect(screen.getByText('Acción requerida')).toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Tutor Académico cuando falta la carta de asignación de la Dirección de Carrera', () => {
    render(
      <AlertaEstadoProceso
        fase="ASIGNACION"
        estado="EN_CURSO"
        tieneCarta={false}
        rol="TUTOR_ACADEMICO"
      />
    );
    expect(
      screen.getByText('Esperando que la Dirección de Carrera emita y remita la carta de asignación al tutor institucional.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Acción requerida por usted')).not.toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Tutor Académico cuando la carta está emitida y debe realizar la reunión', () => {
    render(
      <AlertaEstadoProceso
        fase="ASIGNACION"
        estado="EN_CURSO"
        tieneCarta={true}
        rol="TUTOR_ACADEMICO"
      />
    );
    expect(screen.getByText('Carta de Asignación emitida')).toBeInTheDocument();
    expect(
      screen.getByText('La carta ha sido entregada. Por favor, realice la reunión inicial de coordinación y confirme el inicio de desarrollo.')
    ).toBeInTheDocument();
    expect(screen.getByText('Acción requerida')).toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Director de Carrera cuando la carta ya fue enviada y espera reunión del TA', () => {
    render(
      <AlertaEstadoProceso
        fase="ASIGNACION"
        estado="EN_CURSO"
        tieneCarta={true}
        rol="DIRECTOR_CARRERA"
      />
    );
    expect(screen.getByText('Carta de Asignación remitida')).toBeInTheDocument();
    expect(
      screen.getByText('Ha enviado la carta exitosamente. Esperando que el Tutor Académico realice la reunión inicial y dé inicio al desarrollo.')
    ).toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Coordinador en FINALIZACION cuando falta validar el portafolio', () => {
    render(
      <AlertaEstadoProceso
        fase="FINALIZACION"
        estado="EN_CURSO"
        validadoCpp={false}
        rol="COORDINADOR_PRACTICAS"
      />
    );
    expect(screen.getByText('Documentos de cierre entregados')).toBeInTheDocument();
    expect(
      screen.getByText('Los documentos de finalización están listos. Esperando revisión y validación por su parte para dar paso al aval de Subdecanato.')
    ).toBeInTheDocument();
    expect(screen.getByText('Acción requerida')).toBeInTheDocument();
  });

  it('debe personalizar el mensaje para el Subdecano en FINALIZACION cuando está validado por CPP y falta su aval', () => {
    render(
      <AlertaEstadoProceso
        fase="FINALIZACION"
        estado="EN_CURSO"
        validadoCpp={true}
        rol="SUBDECANO"
      />
    );
    expect(screen.getByText('Portafolio validado por Coordinación')).toBeInTheDocument();
    expect(
      screen.getByText('Portafolio verificado. Esperando generación, firma y emisión por su parte del Aval de Culminación de Prácticas.')
    ).toBeInTheDocument();
    expect(screen.getByText('Acción requerida')).toBeInTheDocument();
  });

  it('debe mostrar mensaje neutral cuando no se especifica rol', () => {
    render(
      <AlertaEstadoProceso
        fase="FINALIZACION"
        estado="EN_CURSO"
        validadoCpp={false}
      />
    );
    expect(
      screen.getByText('Esperando la revisión y validación de documentos por parte del Coordinador de Prácticas.')
    ).toBeInTheDocument();
  });
});
