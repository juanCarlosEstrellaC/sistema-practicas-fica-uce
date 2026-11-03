import { manejarErrorFetch } from '../utilidades/cliente-http';
import { API_URL } from './configuracion';

/**
 * Realiza el inicio de sesion en el backend.
 * @param correo Correo electronico del usuario.
 * @param contrasenia Contrasenia del usuario.
 * @returns Promesa con la respuesta del backend.
 */
export async function login(correo: string, contrasenia: string): Promise<any> {
  const respuesta = await fetch(`/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      correo,
      clave: contrasenia
    })
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al iniciar sesion');
  }

  return respuesta.json();
}

/**
 * Cierra la sesión eliminando la cookie en el servidor.
 */
export async function logout(): Promise<void> {
  await fetch(`/api/auth/logout`, { method: 'POST' });
}

export async function solicitarOlvidoContrasenia(correo: string): Promise<any> {
  const respuesta = await fetch(`${API_URL}/auth/olvido-contrasenia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo })
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al solicitar recuperación');
  }
  return respuesta.json();
}

export async function restaurarContrasenia(token: string, nuevaContrasenia: string): Promise<any> {
  const respuesta = await fetch(`${API_URL}/auth/restaurar-contrasenia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, nuevaContrasenia })
  });

  if (!respuesta.ok) {
    await manejarErrorFetch(respuesta, 'Error al restablecer contraseña');
  }
  return respuesta.json();
}
