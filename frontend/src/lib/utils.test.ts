import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utilidad de clases UI (lib/utils.ts)', () => {
  it('debe combinar clases de Tailwind resolviendo conflictos correctamente', () => {
    const resultado = cn('px-2 py-1', 'bg-red-500', 'bg-blue-500');
    expect(resultado).toBe('px-2 py-1 bg-blue-500');
  });

  it('debe filtrar valores condicionales falsy', () => {
    const resultado = cn('text-sm', false && 'hidden', null, undefined, 'font-bold');
    expect(resultado).toBe('text-sm font-bold');
  });
});
