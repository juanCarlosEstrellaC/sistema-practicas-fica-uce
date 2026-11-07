import { describe, it, expect } from 'vitest';
import { esquemaPeriodoAcademico } from '../periodo-academico.esquema';

describe('esquemaPeriodoAcademico (Validacion Zod)', () => {
  it('debe validar un periodo academico con rango de fechas coherente', () => {
    const periodoValido = {
      nombre: '2025-2026',
      fechaInicio: '2025-10-01',
      fechaFin: '2026-03-31',
      estado: 'ACTIVO' as const,
    };

    const res = esquemaPeriodoAcademico.safeParse(periodoValido);
    expect(res.success).toBe(true);
  });

  it('debe fallar si la fecha fin es anterior a la fecha inicio', () => {
    const periodoInvalido = {
      nombre: '2025-2026',
      fechaInicio: '2026-03-31',
      fechaFin: '2025-10-01',
      estado: 'ACTIVO' as const,
    };

    const res = esquemaPeriodoAcademico.safeParse(periodoInvalido);
    expect(res.success).toBe(false);
    if (!res.success) {
      const error = res.error.errors.find((e) => e.path.includes('fechaFin'));
      expect(error?.message).toContain('posterior');
    }
  });

  it('debe fallar si el formato de fecha no es YYYY-MM-DD', () => {
    const periodoInvalido = {
      nombre: '2025-2026',
      fechaInicio: '01/10/2025',
      fechaFin: '31/03/2026',
      estado: 'ACTIVO' as const,
    };

    const res = esquemaPeriodoAcademico.safeParse(periodoInvalido);
    expect(res.success).toBe(false);
  });
});

