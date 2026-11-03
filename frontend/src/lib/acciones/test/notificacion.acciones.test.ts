import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  obtenerNotificacionesAccion,
  marcarNotificacionLeidaAccion,
  marcarTodasNotificacionesLeidasAccion,
  crearNotificacionAccion,
} from '../notificacion.acciones';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'token-jwt-prueba' }),
  }),
}));

describe('Server Actions de Notificaciones', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  describe('obtenerNotificacionesAccion', () => {
    it('debe retornar lista de notificaciones cuando la peticion es exitosa', async () => {
      const notificacionesSimuladas = [
        { id: 1, titulo: 'Notificacion 1', mensaje: 'Mensaje 1', leida: false },
        { id: 2, titulo: 'Notificacion 2', mensaje: 'Mensaje 2', leida: true },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            content: notificacionesSimuladas,
          },
        }),
      });

      const resultado = await obtenerNotificacionesAccion('1');
      expect(resultado).toEqual(notificacionesSimuladas);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notificaciones/usuario/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-jwt-prueba',
          }),
        })
      );
    });

    it('debe retornar arreglo vacio y no lanzar error si el backend responde 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const resultado = await obtenerNotificacionesAccion('9999');
      expect(resultado).toEqual([]);
    });

    it('debe retornar arreglo vacio si usuarioId no esta definido', async () => {
      const resultado = await obtenerNotificacionesAccion('');
      expect(resultado).toEqual([]);
    });

    it('debe manejar errores de conexion retornando arreglo vacio', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const resultado = await obtenerNotificacionesAccion('1');
      expect(resultado).toEqual([]);
    });
  });

  describe('marcarNotificacionLeidaAccion', () => {
    it('debe retornar true cuando la operacion es exitosa', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const resultado = await marcarNotificacionLeidaAccion('1');
      expect(resultado).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notificaciones/1/leer'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('debe retornar false si el id esta vacio', async () => {
      const resultado = await marcarNotificacionLeidaAccion('');
      expect(resultado).toBe(false);
    });
  });

  describe('marcarTodasNotificacionesLeidasAccion', () => {
    it('debe retornar true cuando la llamada es exitosa', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const resultado = await marcarTodasNotificacionesLeidasAccion('1');
      expect(resultado).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notificaciones/usuario/1/leer-todas'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('crearNotificacionAccion', () => {
    it('debe enviar la notificacion correctamente', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const dto = {
        usuarioId: 1,
        titulo: 'Alerta',
        mensaje: 'Aviso importante',
        tipo: 'INFORMACION',
      };

      const resultado = await crearNotificacionAccion(dto);
      expect(resultado).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notificaciones'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dto),
        })
      );
    });
  });
});
