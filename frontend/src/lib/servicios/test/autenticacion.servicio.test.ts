import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login, logout } from '../autenticacion.servicio';

describe('Servicio de Autenticación Frontend (login y logout)', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('debe iniciar sesion exitosamente enviando credenciales', async () => {
    const respuestaMock = {
      token: 'jwt-token-123',
      usuario: { id: 1, correo: 'usuario@uce.edu.ec', nombres: 'Carlos' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => respuestaMock,
    });

    const resultado = await login('usuario@uce.edu.ec', 'ClaveSegura@2026');

    expect(resultado).toEqual(respuestaMock);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          correo: 'usuario@uce.edu.ec',
          clave: 'ClaveSegura@2026',
        }),
      })
    );
  });

  it('debe lanzar error cuando las credenciales son incorrectas', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Correo o contraseña incorrectos.' }),
    });

    await expect(login('usuario@uce.edu.ec', 'clave_incorrecta')).rejects.toThrow();
  });

  it('debe invocar endpoint de logout', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    await logout();

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });
});
