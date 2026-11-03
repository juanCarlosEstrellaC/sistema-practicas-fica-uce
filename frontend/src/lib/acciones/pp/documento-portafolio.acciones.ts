'use server';

import { revalidatePath } from 'next/cache';
import { DocumentoDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaApi } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';
import {
  esquemaDocumentoPortafolio,
  esquemaRevisionDocumento,
  FormularioDocumentoPortafolio,
  FormularioRevisionDocumento,
} from '@/lib/esquemas/pp/documento-portafolio.esquema';

export async function obtenerDocumentosPorEstudianteAccion(
  estudianteId: number
): Promise<DocumentoDto[]> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/documentos/estudiante/${estudianteId}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) return [];
    const resultado = await respuesta.json();
    return (resultado.data as DocumentoDto[]) || [];
  } catch (error) {
    console.error('Error en obtenerDocumentosPorEstudianteAccion:', error);
    return [];
  }
}

export async function registrarDocumentoPortafolioAccion(
  datos: FormularioDocumentoPortafolio
): Promise<RespuestaApi<DocumentoDto>> {
  const validacion = esquemaDocumentoPortafolio.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos del documento';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/documentos/subir`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        estudianteId: validacion.data.estudianteId,
        tipo: validacion.data.tipo,
        url: validacion.data.urlArchivo,
        nombre: validacion.data.nombreArchivo,
      }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al registrar el documento`,
      };
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas/estudiantes');
    return {
      exito: true,
      mensaje: 'Documento registrado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en registrarDocumentoPortafolioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function revisarDocumentoPortafolioAccion(
  documentoId: number,
  datos: FormularioRevisionDocumento
): Promise<RespuestaApi<DocumentoDto>> {
  const validacion = esquemaRevisionDocumento.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos de revision';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/documentos/${documentoId}/revisar`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify({
        estado: validacion.data.estado,
        observacion: validacion.data.observacion,
      }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al revisar el documento`,
      };
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas/estudiantes');
    return {
      exito: true,
      mensaje: 'Documento revisado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en revisarDocumentoPortafolioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function resubirDocumentoPortafolioAccion(
  documentoId: number,
  datos: { nombreArchivo: string; urlArchivo: string }
): Promise<RespuestaApi<DocumentoDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/documentos/${documentoId}/resubir`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify({
        url: datos.urlArchivo,
        nombre: datos.nombreArchivo,
      }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al resubir el documento`,
      };
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas/estudiantes');
    return {
      exito: true,
      mensaje: 'Documento actualizado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en resubirDocumentoPortafolioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}
