import { describe, it, expect, vi } from 'vitest';
import {
  validarTamanioArchivo,
  subirArchivo,
  TAMANIO_MAXIMO_ARCHIVO_MB,
  TAMANIO_MAXIMO_ARCHIVO_BYTES,
} from './documento.servicio';

describe('Validación de tamaño de archivos (documento.servicio)', () => {
  it('debe definir el límite de tamaño en 10 MB', () => {
    expect(TAMANIO_MAXIMO_ARCHIVO_MB).toBe(10);
    expect(TAMANIO_MAXIMO_ARCHIVO_BYTES).toBe(10 * 1024 * 1024);
  });

  it('debe aceptar un archivo menor a 10 MB (ej. 5 MB)', () => {
    const archivoValido = new File(['a'.repeat(1024)], 'documento_5mb.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(archivoValido, 'size', { value: 5 * 1024 * 1024 });

    expect(validarTamanioArchivo(archivoValido, 10)).toBe(true);
  });

  it('debe aceptar un archivo de exactamente 10 MB', () => {
    const archivoExacto = new File(['a'.repeat(1024)], 'documento_exacto.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(archivoExacto, 'size', { value: 10 * 1024 * 1024 });

    expect(validarTamanioArchivo(archivoExacto, 10)).toBe(true);
  });

  it('debe rechazar y lanzar error para un archivo mayor a 10 MB (ej. 11 MB)', () => {
    const archivoPesado = new File(['a'.repeat(1024)], 'documento_pesado.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(archivoPesado, 'size', { value: 11 * 1024 * 1024 });

    expect(() => validarTamanioArchivo(archivoPesado, 10)).toThrow(
      'El archivo "documento_pesado.pdf" supera el tamaño máximo permitido de 10 MB.'
    );
  });

  it('debe abortar la subida en subirArchivo sin realizar fetch si el archivo supera los 10 MB', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const archivoExcedido = new File(['a'.repeat(1024)], 'informe_grande.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(archivoExcedido, 'size', { value: 15 * 1024 * 1024 });

    await expect(subirArchivo(archivoExcedido)).rejects.toThrow(
      'El archivo "informe_grande.pdf" supera el tamaño máximo permitido de 10 MB.'
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('debe enviar la subcarpeta en FormData si se proporciona', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ exito: true, data: '/archivos_subidos/matrices_caces/matriz.ods' }),
    } as any);

    const archivo = new File(['dummy'], 'matriz.ods', { type: 'application/vnd.oasis.opendocument.spreadsheet' });
    const url = await subirArchivo(archivo, 'matrices_caces');

    expect(url).toBe('/archivos_subidos/matrices_caces/matriz.ods');
    expect(fetchSpy).toHaveBeenCalled();
    const llamado = fetchSpy.mock.calls[0];
    const formData = llamado[1]?.body as FormData;
    expect(formData.get('carpeta')).toBe('matrices_caces');
    fetchSpy.mockRestore();
  });
});
