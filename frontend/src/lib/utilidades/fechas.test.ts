import { describe, it, expect } from 'vitest';
import { formatearFecha, formatearFechaCorta, validarFechas, extraerFechaIso } from './fechas';

describe('Utilidades de Fechas (lib/utilidades/fechas.ts)', () => {
  describe('formatearFecha', () => {
    it('debe retornar cadena vacia si la fecha es null o undefined', () => {
      expect(formatearFecha(null)).toBe('');
      expect(formatearFecha(undefined)).toBe('');
    });

    it('debe formatear una fecha valida correctamente', () => {
      const resultado = formatearFecha('2026-05-15T10:30:00Z', false);
      expect(resultado).toBeDefined();
      expect(resultado.length).toBeGreaterThan(0);
    });
  });

  describe('formatearFechaCorta', () => {
    it('debe formatear correctamente una fecha YYYY-MM-DD a DD/MM/YYYY', () => {
      const resultado = formatearFechaCorta('2026-05-15');
      expect(resultado).toBe('15/05/2026');
    });

    it('debe retornar "No definida" si la fecha es null o undefined', () => {
      expect(formatearFechaCorta(null)).toBe('No definida');
      expect(formatearFechaCorta(undefined)).toBe('No definida');
    });
  });

  describe('validarFechas', () => {
    it('debe retornar null cuando el rango de fechas es valido', () => {
      const error = validarFechas('2026-01-01', '2026-06-01');
      expect(error).toBeNull();
    });

    it('debe retornar mensaje de error cuando fechaFin es menor o igual a fechaInicio', () => {
      const error = validarFechas('2026-06-01', '2026-01-01');
      expect(error).toContain('estrictamente posterior');
    });
  });

  describe('extraerFechaIso', () => {
    it('debe extraer solo la porcion YYYY-MM-DD de un ISO string', () => {
      expect(extraerFechaIso('2026-10-15T10:00:00Z')).toBe('2026-10-15');
      expect(extraerFechaIso('2026-10-15 15:30:00')).toBe('2026-10-15');
    });

    it('debe retornar undefined para valores no definidos', () => {
      expect(extraerFechaIso(undefined)).toBeUndefined();
      expect(extraerFechaIso(null)).toBeUndefined();
    });
  });
});
