'use server';

import { cookies } from 'next/headers';
import { URL_BACKEND } from './cliente-servidor';

export async function solicitarOlvidoContraseniaAccion(
  correo: string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/auth/olvido-contrasenia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || resultado?.message || 'Error al procesar la solicitud de recuperación',
      };
    }

    return {
      exito: true,
      mensaje: resultado?.mensaje || resultado?.message || 'Se ha enviado un correo con las instrucciones.',
    };
  } catch (error: any) {
    console.error('Error en solicitarOlvidoContraseniaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error al procesar la solicitud',
    };
  }
}

export async function restaurarContraseniaAccion(
  tokenOFormData: string | FormData,
  nuevaContraseniaPosible?: string
): Promise<{ exito: boolean; mensaje: string }> {
  let token = '';
  let nuevaContrasenia = '';

  if (typeof tokenOFormData === 'object' && tokenOFormData !== null && 'get' in tokenOFormData) {
    token = (tokenOFormData.get('token') as string) || '';
    nuevaContrasenia = (tokenOFormData.get('nuevaContrasenia') as string) || '';
  } else {
    token = String(tokenOFormData || '');
    nuevaContrasenia = String(nuevaContraseniaPosible || '');
  }

  try {
    const respuesta = await fetch(`${URL_BACKEND}/auth/restaurar-contrasenia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nuevaContrasenia }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || resultado?.message || 'Error al restablecer la contraseña',
      };
    }

    try {
      const almacenCookies = await cookies();
      almacenCookies.delete('token');
      almacenCookies.delete('usuario');
    } catch {
      // Ignorar si se ejecuta fuera de contexto HTTP (ej. tests unitarios)
    }

    return {
      exito: true,
      mensaje: resultado?.mensaje || resultado?.message || 'Contraseña actualizada exitosamente',
    };
  } catch (error: any) {
    console.error('Error en restaurarContraseniaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error al procesar la solicitud',
    };
  }
}

export async function activarCuentaAccion(
  tokenOFormData: string | FormData,
  nuevaContraseniaPosible?: string
): Promise<{ exito: boolean; mensaje: string }> {
  let token = '';
  let nuevaContrasenia = '';

  if (typeof tokenOFormData === 'object' && tokenOFormData !== null && 'get' in tokenOFormData) {
    token = (tokenOFormData.get('token') as string) || '';
    nuevaContrasenia = (tokenOFormData.get('nuevaContrasenia') as string) || '';
  } else {
    token = String(tokenOFormData || '');
    nuevaContrasenia = String(nuevaContraseniaPosible || '');
  }

  try {
    const respuesta = await fetch(`${URL_BACKEND}/auth/activar-cuenta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nuevaContrasenia }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || resultado?.message || 'Error al activar la cuenta',
      };
    }

    try {
      const almacenCookies = await cookies();
      almacenCookies.delete('token');
      almacenCookies.delete('usuario');
    } catch {
      // Ignorar si se ejecuta fuera de contexto HTTP (ej. tests unitarios)
    }

    return {
      exito: true,
      mensaje: resultado?.mensaje || resultado?.message || 'Cuenta activada exitosamente',
    };
  } catch (error: any) {
    console.error('Error en activarCuentaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error al procesar la solicitud',
    };
  }
}
