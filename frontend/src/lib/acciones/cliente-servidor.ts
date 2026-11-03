import { cookies } from 'next/headers';
import { UsuarioSesion } from '@/lib/tipos/general';

export const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

/**
 * Obtiene las cabeceras HTTP necesarias para peticiones hacia el backend desde el servidor,
 * leyendo la cookie 'token' inyectada en la sesion.
 */
export async function obtenerCabecerasAutenticacion(): Promise<Record<string, string>> {
  const almacenCookies = await cookies();
  const token = almacenCookies.get('token')?.value;

  const cabeceras: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  return cabeceras;
}

/**
 * Obtiene cabeceras de autorización sin Content-Type para peticiones multipart/form-data.
 */
export async function obtenerCabecerasSubidaArchivo(): Promise<Record<string, string>> {
  const almacenCookies = await cookies();
  const token = almacenCookies.get('token')?.value;

  const cabeceras: Record<string, string> = {};
  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  return cabeceras;
}

/**
 * Lee la cookie 'usuario' desde el servidor y retorna el objeto UsuarioSesion,
 * resultado de transformar el JSON almacenado.
 * 
 * Si la cookie no existe o no es un JSON válido, retorna null.
 */
export async function obtenerUsuarioServidor(): Promise<UsuarioSesion | null> {
  const almacenCookies = await cookies();
  const usuarioCookie = almacenCookies.get('usuario')?.value;
  if (!usuarioCookie) return null;
  try {
    return JSON.parse(usuarioCookie) as UsuarioSesion;
  } catch {
    return null;
  }
}
