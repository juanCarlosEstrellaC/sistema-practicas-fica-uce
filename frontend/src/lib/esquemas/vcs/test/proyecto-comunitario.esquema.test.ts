import { describe, it, expect } from 'vitest';
import { esquemaProyectoComunitario } from '../proyecto-comunitario.esquema';

describe('esquemaProyectoComunitario (Zod Validation)', () => {
  it('debe validar exitosamente un proyecto con datos completos y coherentes', () => {
    const datosValidos = {
      nombre: 'Proyecto de Alfabetización Digital',
      descripcion: 'Capacitación tecnológica a comunidades rurales',
      carreraId: 1,
      estado: 'ACTIVO' as const,
      fechaInicio: '2026-04-01',
      fechaFin: '2026-08-30',
    };

    const resultado = esquemaProyectoComunitario.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
  });

  it('debe validar exitosamente cuando las fechas y descripcion son opcionales/vacias', () => {
    const datosMinimos = {
      nombre: 'Proyecto Comunitario de Salud',
      descripcion: '',
      carreraId: 2,
      estado: 'ACTIVO' as const,
      fechaInicio: '',
      fechaFin: '',
    };

    const resultado = esquemaProyectoComunitario.safeParse(datosMinimos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si el nombre tiene menos de 3 caracteres', () => {
    const datosInvalidos = {
      nombre: 'AB',
      carreraId: 1,
      estado: 'ACTIVO' as const,
    };

    const resultado = esquemaProyectoComunitario.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const errorNombre = resultado.error.errors.find((e) => e.path.includes('nombre'));
      expect(errorNombre?.message).toContain('al menos 3 caracteres');
    }
  });

  it('debe fallar si no se selecciona una carrera', () => {
    const datosSinCarrera = {
      nombre: 'Proyecto sin carrera',
      carreraId: 0,
      estado: 'ACTIVO' as const,
    };

    const resultado = esquemaProyectoComunitario.safeParse(datosSinCarrera);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const errorCarrera = resultado.error.errors.find((e) => e.path.includes('carreraId'));
      expect(errorCarrera?.message).toContain('Debe seleccionar una carrera');
    }
  });

  it('debe fallar con regla refine si fechaFin es anterior o igual a fechaInicio', () => {
    const fechasIncoherentes = {
      nombre: 'Proyecto con fechas invertidas',
      carreraId: 1,
      estado: 'ACTIVO' as const,
      fechaInicio: '2026-09-01',
      fechaFin: '2026-08-01',
    };

    const resultado = esquemaProyectoComunitario.safeParse(fechasIncoherentes);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const errorFecha = resultado.error.errors.find((e) => e.path.includes('fechaFin'));
      expect(errorFecha?.message).toContain('debe ser posterior');
    }
  });
});
