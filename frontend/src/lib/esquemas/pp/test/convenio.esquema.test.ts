import { describe, it, expect } from 'vitest';
import { esquemaConvenio } from '../convenio.esquema';

describe('esquemaConvenio (Validacion Zod)', () => {
  it('debe validar un convenio con datos completos y validos', () => {
    const datosValidos = {
      institucion: 'Empresa Publica de Telecomunicaciones',
      tipo: 'PUBLICO' as const,
      campoEspecifico: 1234,
      tutorInstitucional: 'Ing. Carlos Perez',
      correoTutor: 'cperez@empresa.gob.ec',
      telefonoTutor: '0991234567',
      direccion: 'Av. Amazonas y Naciones Unidas',
      cuposTotales: 10,
      estado: 'ACTIVO' as const,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si la institucion tiene menos de 3 caracteres', () => {
    const datosInvalidos = {
      institucion: 'EP',
      tipo: 'PUBLICO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Carlos',
      correoTutor: 'carlos@empresa.com',
      direccion: 'Quito Centro',
      cuposTotales: 5,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('institucion'));
      expect(error?.message).toContain('al menos 3 caracteres');
    }
  });

  it('debe fallar si el correo del tutor es invalido', () => {
    const datosInvalidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'correo-no-valido',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: 3,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('correoTutor'));
      expect(error?.message).toContain('correo electronico valido');
    }
  });

  it('debe permitir registrar convenios con 0 cupos totales (mayor o igual a 0)', () => {
    const datosValidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'maria@tech.com',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: 0,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.cuposTotales).toBe(0);
    }
  });

  it('debe fallar si los cupos son menores a 0 (negativos)', () => {
    const datosInvalidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'maria@tech.com',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: -1,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('cuposTotales'));
      expect(error?.message).toContain('mayores o iguales a 0');
    }
  });

  it('debe fallar si los cupos tienen decimales (solo enteros)', () => {
    const datosInvalidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'maria@tech.com',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: 502.3,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('cuposTotales'));
      expect(error?.message).toContain('deben ser un numero entero');
    }
  });

  it('debe fallar si los cupos estan vacios', () => {
    const datosInvalidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'maria@tech.com',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: '',
      fechaInicio: '2026-05-01',
      fechaFin: '2026-10-31',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('cuposTotales'));
      expect(error?.message).toContain('obligatorios');
    }
  });

  it('debe fallar con regla refine si la fechaFin es anterior a fechaInicio', () => {
    const datosInvalidos = {
      institucion: 'Empresa Privada Tech',
      tipo: 'PRIVADO' as const,
      campoEspecifico: 1,
      tutorInstitucional: 'Ing. Maria',
      correoTutor: 'maria@tech.com',
      direccion: 'Av. 6 de Diciembre',
      cuposTotales: 5,
      fechaInicio: '2026-10-31',
      fechaFin: '2026-05-01',
    };

    const resultado = esquemaConvenio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('fechaFin'));
      expect(error?.message).toContain('debe ser posterior');
    }
  });
});
