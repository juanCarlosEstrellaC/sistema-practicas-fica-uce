import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { headers } from 'next/headers';
import {
  activarCuentaAccion,
  restaurarContraseniaAccion,
  solicitarOlvidoContraseniaAccion,
} from '../autenticacion.acciones';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

describe('Server Actions de Autenticación (NIST SP 800-63B)', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  describe('activarCuentaAccion', () => {
    it('debe activar la cuenta exitosamente con respuesta HTTP 200', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Cuenta activada exitosamente',
        }),
      });

      const resultado = await activarCuentaAccion('token-seguro-123', 'Segura#2026!Abc');

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toBe('Cuenta activada exitosamente');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/activar-cuenta'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'token-seguro-123', nuevaContrasenia: 'Segura#2026!Abc' }),
        })
      );
    });

    it('debe activar la cuenta cuando los datos se envian en FormData (proteccion de logs)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Cuenta activada exitosamente',
        }),
      });

      const formData = new FormData();
      formData.append('token', 'token-formdata-123');
      formData.append('nuevaContrasenia', 'Segura#2026!Abc');

      const resultado = await activarCuentaAccion(formData);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toBe('Cuenta activada exitosamente');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/activar-cuenta'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'token-formdata-123', nuevaContrasenia: 'Segura#2026!Abc' }),
        })
      );
    });

    it('debe retornar mensaje de error si el backend rechaza el token o la clave', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'El enlace de activación ha expirado.',
        }),
      });

      const resultado = await activarCuentaAccion('token-vencido', 'Segura#2026!Abc');

      expect(resultado.exito).toBe(false);
      expect(resultado.mensaje).toBe('El enlace de activación ha expirado.');
    });
  });

  describe('restaurarContraseniaAccion', () => {
    it('debe restaurar la contraseña exitosamente con FormData', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Contraseña actualizada exitosamente',
        }),
      });

      const formData = new FormData();
      formData.append('token', 'token-restaurar-form');
      formData.append('nuevaContrasenia', 'NuevaClave#2026');

      const resultado = await restaurarContraseniaAccion(formData);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toBe('Contraseña actualizada exitosamente');
    });
    it('debe restaurar la contraseña exitosamente', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Contraseña actualizada exitosamente',
        }),
      });

      const resultado = await restaurarContraseniaAccion('token-restaurar', 'NuevaClave#2026');

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toBe('Contraseña actualizada exitosamente');
    });

    it('debe manejar error de conexión', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Fallo de red'));

      const resultado = await restaurarContraseniaAccion('token-restaurar', 'NuevaClave#2026');

      expect(resultado.exito).toBe(false);
      expect(resultado.mensaje).toBe('Fallo de red');
    });
  });

  describe('solicitarOlvidoContraseniaAccion', () => {
    it('debe solicitar enlace de recuperación propagando la IP del cliente', async () => {
      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'cf-connecting-ip': '203.0.113.88',
          'x-forwarded-for': '203.0.113.88, 172.70.0.1',
        })
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Se ha enviado un correo con las instrucciones.',
        }),
      });

      const resultado = await solicitarOlvidoContraseniaAccion('estudiante@uce.edu.ec');

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toBe('Se ha enviado un correo con las instrucciones.');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/olvido-contrasenia'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '203.0.113.88',
            'X-Forwarded-For': '203.0.113.88, 172.70.0.1',
          },
          body: JSON.stringify({ correo: 'estudiante@uce.edu.ec' }),
        })
      );
    });

    it('debe continuar sin fallar si headers() lanza error fuera de contexto HTTP', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('Fuera de contexto HTTP'));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Se ha enviado un correo con las instrucciones.',
        }),
      });

      const resultado = await solicitarOlvidoContraseniaAccion('estudiante@uce.edu.ec');

      expect(resultado.exito).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/olvido-contrasenia'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('debe usar x-real-ip como respaldo de X-Forwarded-For cuando no viene x-forwarded-for', async () => {
      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-real-ip': '198.51.100.44',
        })
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Se ha enviado un correo con las instrucciones.',
        }),
      });

      const resultado = await solicitarOlvidoContraseniaAccion('estudiante@uce.edu.ec');

      expect(resultado.exito).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/olvido-contrasenia'),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '198.51.100.44',
          },
        })
      );
    });
  });
});
