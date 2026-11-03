import { describe, it, expect } from 'vitest';
import { formatearNombreCorto, obtenerIniciales } from './formato-texto';

describe('Utilidades de Formato de Texto (lib/utilidades/formato-texto.ts)', () => {
  it('debe limpiar titulos y devolver nombre corto con primer nombre y apellido', () => {
    expect(formatearNombreCorto('Ing. Jaime Salvador, MSc.')).toBe('Jaime Salvador');
    expect(formatearNombreCorto('Dr. Sandra Mendoza')).toBe('Sandra Mendoza');
    expect(formatearNombreCorto('Juan Pablo Perez Lopez')).toBe('Juan Perez');
  });

  it('debe manejar cadenas vacias de forma segura', () => {
    expect(formatearNombreCorto('')).toBe('');
  });

  it('debe extraer las iniciales correctamente tanto con nombre completo como con nombre y apellido separados', () => {
    expect(obtenerIniciales('Juan Perez')).toBe('JP');
    expect(obtenerIniciales('Ing. Carlos Ramos')).toBe('CR');
    expect(obtenerIniciales('Andres', 'Barrera')).toBe('AB');
    expect(obtenerIniciales('Juan Carlos', 'Estrella Cruz')).toBe('JE');
    expect(obtenerIniciales('', '')).toBe('U');
    expect(obtenerIniciales(null, null)).toBe('U');
  });
});
