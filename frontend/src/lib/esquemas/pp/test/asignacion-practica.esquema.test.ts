import { describe, it, expect } from 'vitest';
import {
  esquemaAsignacionPractica,
  esquemaAsignacionMasivaPractica,
  esquemaActualizarAsignacionPractica,
} from '../asignacion-practica.esquema';

describe('esquemaAsignacionPractica (Validacion Zod)', () => {
  it('debe validar exitosamente una asignacion con datos correctos', () => {
    const datosValidos = {
      estudianteId: 10,
      convenioId: 3,
      tutorAcademicoId: 5,
      periodoAcademicoId: 2,
      horasAsignadas: 160,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-07-31',
      semestre: 6,
    };

    const resultado = esquemaAsignacionPractica.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si las horas asignadas son 0 o negativas', () => {
    const datosInvalidos = {
      estudianteId: 10,
      convenioId: 3,
      periodoAcademicoId: 2,
      horasAsignadas: 0,
    };

    const resultado = esquemaAsignacionPractica.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('horasAsignadas'));
      expect(error?.message).toContain('mayores a 0');
    }
  });

  it('debe fallar si las horas asignadas tienen decimales', () => {
    const datosInvalidos = {
      estudianteId: 10,
      convenioId: 3,
      periodoAcademicoId: 2,
      horasAsignadas: 120.5,
    };

    const resultado = esquemaAsignacionPractica.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('horasAsignadas'));
      expect(error?.message).toContain('numero entero');
    }
  });

  it('debe validar asignacion masiva con al menos un estudiante', () => {
    const datosMasivos = {
      estudianteIds: [1, 2, 3],
      convenioId: 4,
      periodoAcademicoId: 1,
      horasAsignadas: 240,
    };

    const resultado = esquemaAsignacionMasivaPractica.safeParse(datosMasivos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar asignacion masiva si la lista de estudiantes esta vacia', () => {
    const datosMasivosVacios = {
      estudianteIds: [],
      convenioId: 4,
      periodoAcademicoId: 1,
      horasAsignadas: 240,
    };

    const resultado = esquemaAsignacionMasivaPractica.safeParse(datosMasivosVacios);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('estudianteIds'));
      expect(error?.message).toContain('al menos un estudiante');
    }
  });

  it('debe fallar asignacion masiva si las horas tienen decimales', () => {
    const datosMasivosInvalidos = {
      estudianteIds: [1],
      convenioId: 4,
      periodoAcademicoId: 1,
      horasAsignadas: 240.75,
    };

    const resultado = esquemaAsignacionMasivaPractica.safeParse(datosMasivosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('horasAsignadas'));
      expect(error?.message).toContain('numero entero');
    }
  });

  it('debe validar correctamente esquemaActualizarAsignacionPractica', () => {
    const datosValidos = {
      convenioId: 10,
      tutorId: 2,
      periodoAcademicoId: 1,
      horas: 180,
    };

    const resultado = esquemaActualizarAsignacionPractica.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar esquemaActualizarAsignacionPractica si horas es decimal o menor o igual a 0', () => {
    const decimal = esquemaActualizarAsignacionPractica.safeParse({
      convenioId: 10,
      periodoAcademicoId: 1,
      horas: 160.5,
    });
    expect(decimal.success).toBe(false);

    const cero = esquemaActualizarAsignacionPractica.safeParse({
      convenioId: 10,
      periodoAcademicoId: 1,
      horas: 0,
    });
    expect(cero.success).toBe(false);
  });

  it('debe fallar esquemaActualizarAsignacionPractica si horas supera el limite maximo permitido', () => {
    const excesivo = esquemaActualizarAsignacionPractica.safeParse({
      convenioId: 10,
      periodoAcademicoId: 1,
      horas: 500000,
    });
    expect(excesivo.success).toBe(false);
    if (!excesivo.success) {
      const error = excesivo.error.errors.find((e) => e.path.includes('horas'));
      expect(error?.message).toContain('500 horas');
    }
  });
});
