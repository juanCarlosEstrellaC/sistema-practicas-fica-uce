import { describe, it, expect } from 'vitest';
import { desglosarDescripcionObservacion } from './observaciones';

describe('desglosarDescripcionObservacion', () => {
  it('debe separar la descripcion y el motivo de rechazo con saltos de linea', () => {
    const texto = 'pa q la pases bien\n\nMotivo de rechazo: ella brinca y salta';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('pa q la pases bien');
    expect(resultado.motivoRechazo).toBe('ella brinca y salta');
  });

  it('debe separar la descripcion y el motivo de rechazo en una sola linea con espacio simple', () => {
    const texto = 'pa q la pases bien Motivo de rechazo: ella brinca y salta';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('pa q la pases bien');
    expect(resultado.motivoRechazo).toBe('ella brinca y salta');
  });

  it('debe devolver null en motivoRechazo si no existe el patron', () => {
    const texto = 'Propuesta de convenio con Banco Pichincha para practicas de ingenieria';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('Propuesta de convenio con Banco Pichincha para practicas de ingenieria');
    expect(resultado.motivoRechazo).toBeNull();
  });

  it('debe manejar texto que comienza directamente con el motivo de rechazo', () => {
    const texto = 'Motivo de rechazo: No cumple con los requisitos CACES';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('');
    expect(resultado.motivoRechazo).toBe('No cumple con los requisitos CACES');
  });

  it('debe manejar texto vacio, nulo o indefinido', () => {
    expect(desglosarDescripcionObservacion(null)).toEqual({ descripcion: '', motivoRechazo: null });
    expect(desglosarDescripcionObservacion(undefined)).toEqual({ descripcion: '', motivoRechazo: null });
    expect(desglosarDescripcionObservacion('')).toEqual({ descripcion: '', motivoRechazo: null });
    expect(desglosarDescripcionObservacion('   ')).toEqual({ descripcion: '', motivoRechazo: null });
  });

  it('debe manejar motivos de rechazo multilinea', () => {
    const texto = 'Propuesta inicial\n\nMotivo de rechazo: 1. Falta firma\n2. Falta anexo';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('Propuesta inicial');
    expect(resultado.motivoRechazo).toBe('1. Falta firma\n2. Falta anexo');
  });

  it('debe ser insensible a mayusculas o minusculas en la etiqueta', () => {
    const texto = 'Solicitud de convenio\n\nmOtIvo dE rEcHaZo: documento caducado';
    const resultado = desglosarDescripcionObservacion(texto);

    expect(resultado.descripcion).toBe('Solicitud de convenio');
    expect(resultado.motivoRechazo).toBe('documento caducado');
  });
});
