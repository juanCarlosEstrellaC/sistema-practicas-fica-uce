import { describe, it, expect } from 'vitest';
import {
  esquemaSolicitarRestauracion,
  esquemaConfirmarRestauracion,
  esquemaCambiarContrasenia,
} from '../restaurar-contrasenia.esquema';

describe('esquemaSolicitarRestauracion', () => {
  it('debe validar un correo institucional uce.edu.ec valido', () => {
    const res = esquemaSolicitarRestauracion.safeParse({
      correo: 'juan.perez@uce.edu.ec',
    });
    expect(res.success).toBe(true);
  });

  it('debe fallar si no es correo institucional', () => {
    const res = esquemaSolicitarRestauracion.safeParse({
      correo: 'juan.perez@hotmail.com',
    });
    expect(res.success).toBe(false);
  });
});

describe('esquemaConfirmarRestauracion (NIST SP 800-63B)', () => {
  it('debe aceptar token aleatorio seguro de 32 bytes y clave de al menos 8 caracteres', () => {
    const res = esquemaConfirmarRestauracion.safeParse({
      token: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      nuevaContrasenia: 'NuevaClaveRobusta2026',
      confirmarContrasenia: 'NuevaClaveRobusta2026',
    });
    expect(res.success).toBe(true);
  });

  it('debe rechazar si la contrasenia tiene menos de 8 caracteres (regla NIST)', () => {
    const res = esquemaConfirmarRestauracion.safeParse({
      token: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      nuevaContrasenia: 'Corta7',
      confirmarContrasenia: 'Corta7',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const error = res.error.errors.find((e) => e.path.includes('nuevaContrasenia'));
      expect(error?.message).toContain('8 caracteres');
    }
  });

  it('debe rechazar si las contrasenias no coinciden', () => {
    const res = esquemaConfirmarRestauracion.safeParse({
      token: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      nuevaContrasenia: 'ClaveSegura123',
      confirmarContrasenia: 'ClaveDiferente123',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const error = res.error.errors.find((e) => e.path.includes('confirmarContrasenia'));
      expect(error?.message).toContain('no coinciden');
    }
  });
});

describe('esquemaCambiarContrasenia', () => {
  it('debe validar cambio de contrasenia valido', () => {
    const res = esquemaCambiarContrasenia.safeParse({
      contraseniaActual: 'ClaveAnterior123',
      nuevaContrasenia: 'NuevaSuperSegura2026',
      confirmarContrasenia: 'NuevaSuperSegura2026',
    });
    expect(res.success).toBe(true);
  });
});

