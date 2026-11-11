import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

const mockSetCookie = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: (...args: unknown[]) => mockSetCookie(...args),
  }),
}));

describe('Ruta API /api/auth/login', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('debe reenviar CF-Connecting-IP y X-Forwarded-For hacia el backend', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          token: 'jwt-prueba',
          usuario: { id: 1, correo: 'aperez@uce.edu.ec', rol: 'SUBDECANO' },
        },
      }),
    });

    const peticion = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.45',
        'x-forwarded-for': '203.0.113.45, 172.70.0.1',
      },
      body: JSON.stringify({ correo: 'aperez@uce.edu.ec', clave: '123456' }),
    });

    const respuesta = await POST(peticion);
    const cuerpo = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(cuerpo.exito).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '203.0.113.45',
          'X-Forwarded-For': '203.0.113.45, 172.70.0.1',
        },
      })
    );
    expect(mockSetCookie).toHaveBeenCalledTimes(2);
  });

  it('debe usar x-real-ip como X-Forwarded-For cuando no existe x-forwarded-for', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ mensaje: 'Credenciales invalidas' }),
    });

    const peticion = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '198.51.100.22',
      },
      body: JSON.stringify({ correo: 'aperez@uce.edu.ec', clave: 'mal' }),
    });

    const respuesta = await POST(peticion);

    expect(respuesta.status).toBe(401);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.22',
        },
      })
    );
    expect(mockSetCookie).not.toHaveBeenCalled();
  });
});
