import { describe, it, expect } from 'vitest';
import {
  adaptarUrlProxy,
  obtenerUrlPrevisualizacionAvalPp,
  obtenerUrlPrevisualizacionCartaAsignacionPp,
} from './proxy-url';

describe('Utilidades de Proxy URL (lib/utilidades/proxy-url.ts)', () => {
  describe('adaptarUrlProxy', () => {
    it('debe anteponer /api/proxy a rutas relativas de backend', () => {
      expect(adaptarUrlProxy('/asignaciones-practicas/1/carta-asignacion/preview')).toBe(
        '/api/proxy/asignaciones-practicas/1/carta-asignacion/preview'
      );
      expect(adaptarUrlProxy('/reportes-proyectos-vcs/10/preview')).toBe(
        '/api/proxy/reportes-proyectos-vcs/10/preview'
      );
      expect(adaptarUrlProxy('/reportes-proyectos-vcs/10/descargar')).toBe(
        '/api/proxy/reportes-proyectos-vcs/10/descargar'
      );
      expect(adaptarUrlProxy('/archivos_subidos/doc.pdf')).toBe('/api/proxy/archivos_subidos/doc.pdf');
      expect(adaptarUrlProxy('/archivos_subidos/avatars/1_abc.png')).toBe(
        '/api/proxy/archivos_subidos/avatars/1_abc.png'
      );
      expect(adaptarUrlProxy('/usuarios/avatars/1_abc.png')).toBe(
        '/api/proxy/archivos_subidos/avatars/1_abc.png'
      );
    });

    it('debe mantener intactas las rutas que ya inician con /api/proxy', () => {
      expect(adaptarUrlProxy('/api/proxy/archivos/1')).toBe('/api/proxy/archivos/1');
    });

    it('debe retornar cadena vacia si el parametro es null o undefined', () => {
      expect(adaptarUrlProxy(null)).toBe('');
      expect(adaptarUrlProxy(undefined)).toBe('');
    });
  });

  describe('Previsualizaciones Oficiales', () => {
    it('debe generar la URL de aval correctamente', () => {
      expect(obtenerUrlPrevisualizacionAvalPp(12)).toBe('/asignaciones-practicas/12/aval/preview');
    });

    it('debe generar la URL de carta de asignacion correctamente', () => {
      expect(obtenerUrlPrevisualizacionCartaAsignacionPp(55)).toBe('/asignaciones-practicas/55/carta-asignacion/preview');
    });
  });
});
