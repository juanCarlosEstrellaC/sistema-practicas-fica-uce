import { cookies } from 'next/headers';
import { UsuarioSesion } from '@/lib/tipos/general';

export const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

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
 
export async function obtenerCabecerasSubidaArchivo(): Promise<Record<string, string>> {
  const almacenCookies = await cookies();
  const token = almacenCookies.get('token')?.value;

  const cabeceras: Record<string, string> = {};
  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  return cabeceras;
}

export async function obtenerUsuarioServidor(): Promise<UsuarioSesion | null> {
  const almacenCookies = await cookies();
  const token = almacenCookies.get('token')?.value;
  const usuarioCookie = almacenCookies.get('usuario')?.value;

  if (!token || !usuarioCookie) return null;

  try {
    const partesToken = token.split('.');
    if (partesToken.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(partesToken[1], 'base64url').toString('utf-8'));
    const tiempoActual = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < tiempoActual) {
      return null;
    }

    const usuario = JSON.parse(usuarioCookie) as UsuarioSesion;

    // Verificar que el correo del usuario coincida con el subject del JWT firmado
    if (payload.sub && usuario.correo && payload.sub.toLowerCase() !== usuario.correo.toLowerCase()) {
      return null;
    }

    return usuario;
  } catch {
    return null;
  }
}
