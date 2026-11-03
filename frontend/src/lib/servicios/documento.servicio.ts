import { API_URL } from './configuracion';
import { DocumentoDto } from '../tipos/pp/general-pp';
import { manejarErrorFetch } from '../utilidades/cliente-http';

export const TAMANIO_MAXIMO_ARCHIVO_MB = 10;
export const TAMANIO_MAXIMO_ARCHIVO_BYTES = TAMANIO_MAXIMO_ARCHIVO_MB * 1024 * 1024;

/**
 * Valida que un archivo no supere el tamaño máximo permitido.
 * @param archivo Archivo a validar.
 * @param maxMb Tamaño máximo en megabytes (por defecto 10).
 */
export function validarTamanioArchivo(archivo: File, maxMb: number = TAMANIO_MAXIMO_ARCHIVO_MB): boolean {
  if (archivo.size > maxMb * 1024 * 1024) {
    throw new Error(`El archivo "${archivo.name}" supera el tamaño máximo permitido de ${maxMb} MB.`);
  }
  return true;
}

export const CARPETAS_ARCHIVOS = {
  // Segmento Prácticas Preprofesionales (PP)
  PRACTICAS_MATRICES_CACES: 'practicas/matrices_caces',
  PRACTICAS_CARTAS_ASIGNACION: 'practicas/cartas_asignacion',
  PRACTICAS_AVALES: 'practicas/avales',
  PRACTICAS_CONVENIOS: 'practicas/convenios',
  PRACTICAS_PORTAFOLIOS: 'practicas/portafolios',

  // Segmento Vinculación con la Sociedad (VCS)
  VINCULACION: 'vinculacion',

  // Segmento General / Sistema
  GENERAL_AVATARES: 'general/avatars',
  GENERAL_PLANTILLAS: 'general/plantillas',
  GENERAL_OTROS: 'general/otros',

  // Mapeos por defecto directos
  MATRICES_CACES: 'practicas/matrices_caces',
  CARTAS_ASIGNACION: 'practicas/cartas_asignacion',
  AVALES: 'practicas/avales',
  CONVENIOS: 'practicas/convenios',
  PORTAFOLIOS: 'practicas/portafolios',
  AVATARES: 'general/avatars',
  OTROS: 'general/otros',
} as const;

export type TipoCarpetaArchivo = (typeof CARPETAS_ARCHIVOS)[keyof typeof CARPETAS_ARCHIVOS];

/**
 * Sube un archivo fisico al servidor y retorna su URL publica.
 * @param archivo Archivo a subir.
 * @param carpeta Nombre de la subcarpeta o categoria opcional.
 * @returns Promesa con la URL del archivo subido.
 */
export async function subirArchivo(archivo: File, carpeta?: string): Promise<string> {
  validarTamanioArchivo(archivo, TAMANIO_MAXIMO_ARCHIVO_MB);

  const formData = new FormData();
  formData.append('archivo', archivo);
  if (carpeta && carpeta.trim()) {
    formData.append('carpeta', carpeta.trim());
  }

  const respuesta = await fetch(`${API_URL}/archivos/subir`, {
    method: 'POST',
    body: formData,
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al subir el archivo');
  }

  const data = await respuesta.json();
  return data.data;
}

/**
 * Obtiene los documentos asociados a un estudiante específico.
 * @param estudianteId Identificador del estudiante.
 * @returns Promesa con el listado de DocumentoDto.
 */
export async function obtenerDocumentosEstudiante(estudianteId: string): Promise<DocumentoDto[]> {
  const respuesta = await fetch(`${API_URL}/documentos/estudiante/${estudianteId}?t=${new Date().getTime()}`, {
    cache: 'no-store'
  });
  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al obtener documentos del estudiante');
  }
  const data = await respuesta.json();
  return Array.isArray(data.data) ? data.data : (data.data?.content || []);
}

/**
 * Obtiene todos los documentos de manera paginada.
 * @param page Número de página
 * @param size Cantidad por página
 * @returns Promesa con el resultado paginado
 */
export async function obtenerDocumentos(page: number = 0, size: number = 10): Promise<{ content: DocumentoDto[], totalElements: number, totalPages: number }> {
  const respuesta = await fetch(`${API_URL}/documentos?page=${page}&size=${size}&t=${new Date().getTime()}`, {
    cache: 'no-store'
  });
  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al obtener documentos');
  }
  const data = await respuesta.json();
  return {
    content: data.data?.content || (Array.isArray(data.data) ? data.data : []),
    totalElements: data.data?.totalElements || 0,
    totalPages: data.data?.totalPages || 0
  };
}

/**
 * Revisa (aprueba o rechaza) un documento.
 * @param id ID del documento
 * @param estado Estado a asignar (APROBADO, RECHAZADO, PENDIENTE_REVISION)
 * @param observacion Motivo si es rechazado
 */
export async function revisarDocumento(id: string | number, estado: string, observacion?: string): Promise<DocumentoDto> {
  const respuesta = await fetch(`${API_URL}/documentos/${id}/revisar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, observacion })
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al revisar el documento');
  }

  const data = await respuesta.json();
  return data.data;
}

/**
 * Resube un documento previamente rechazado.
 * @param id ID del documento
 * @param url Nueva URL del documento
 * @param nombre Nuevo nombre del documento
 */
export async function resubirDocumento(id: string | number, url: string, nombre: string): Promise<DocumentoDto> {
  const respuesta = await fetch(`${API_URL}/documentos/${id}/resubir`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, nombre }),
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al resubir el documento');
  }

  const data = await respuesta.json();
  return data.data;
}

export async function subirDocumentoApi(estudianteId: string | number, tipo: string, url: string, nombre: string): Promise<DocumentoDto> {
  const respuesta = await fetch(`${API_URL}/documentos/subir`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estudianteId, tipo, url, nombre }),
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al subir el documento');
  }

  const data = await respuesta.json();
  return data.data;
}
