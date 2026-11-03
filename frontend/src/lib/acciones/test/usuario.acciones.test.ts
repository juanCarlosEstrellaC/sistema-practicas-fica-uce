import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reenviarActivacionUsuarioAccion, actualizarMiPerfilAccion, transferirSubdecanatoAccion } from '../usuario.acciones';

vi.mock('../cliente-servidor', () => ({
  URL_BACKEND: 'http://localhost:8080/api/v1',
  obtenerCabecerasAutenticacion: vi.fn(async () => ({ Authorization: 'Bearer mock-token' })),
  obtenerCabecerasSubidaArchivo: vi.fn(async () => ({ Authorization: 'Bearer mock-token' })),
  obtenerUsuarioServidor: vi.fn(async () => ({ id: 1, correo: 'admin@uce.edu.ec' })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    delete: vi.fn(),
  })),
}));

describe('usuario.acciones - reenviarActivacionUsuarioAccion', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('debe reenviar correo de activacion exitosamente cuando el backend responde 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        exito: true,
        message: 'Correo de activación reenviado exitosamente',
      }),
    });

    const resultado = await reenviarActivacionUsuarioAccion(15);

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toBe('Correo de activación reenviado exitosamente');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/15/reenviar-activacion'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('debe retornar mensaje de error si el backend falla', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        exito: false,
        message: 'Usuario no encontrado',
      }),
    });

    const resultado = await reenviarActivacionUsuarioAccion(999);

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toBe('Usuario no encontrado');
  });

  it('debe capturar errores de conexion de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Fallo de red'));

    const resultado = await reenviarActivacionUsuarioAccion(15);

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toBe('Fallo de red');
  });
});

describe('usuario.acciones - actualizarMiPerfilAccion', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('debe actualizar el perfil enviando PATCH a /usuarios/{id}/perfil y leer resultado.mensaje', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        exito: true,
        mensaje: 'Perfil actualizado exitosamente',
        data: { id: 1, telefono: '0991234567' },
      }),
    });

    const resultado = await actualizarMiPerfilAccion({ telefono: '0991234567' });

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toBe('Perfil actualizado exitosamente');
    expect(resultado.datos?.telefono).toBe('0991234567');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/1/perfil'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ telefono: '0991234567' }),
      })
    );
  });

  it('debe propagar mensaje de error del backend cuando la respuesta no es ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        exito: false,
        mensaje: 'El formato del telefono no es valido',
      }),
    });

    const resultado = await actualizarMiPerfilAccion({ telefono: 'invalid-phone-abc' });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toBe('El formato del telefono no es valido');
  });
});

describe('usuario.acciones - transferirSubdecanatoAccion', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('debe transferir el subdecanato enviando POST a /usuarios/{id}/transferir-subdecanato', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        exito: true,
        mensaje: 'Cargo de Subdecano transferido exitosamente',
        data: { id: 25, rol: 'SUBDECANO' },
      }),
    });

    const resultado = await transferirSubdecanatoAccion(25);

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toBe('Cargo de Subdecano transferido exitosamente');
    expect(resultado.datos?.rol).toBe('SUBDECANO');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/25/transferir-subdecanato'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
