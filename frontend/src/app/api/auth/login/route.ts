import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const cabecerasBackend: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Preservar la IP real del cliente tras Cloudflare Tunnel / proxy reverso para el rate limit
    const ipCloudflare = peticion.headers.get('cf-connecting-ip');
    const ipReenviada = peticion.headers.get('x-forwarded-for');
    const ipReal = peticion.headers.get('x-real-ip');

    if (ipCloudflare) {
      cabecerasBackend['CF-Connecting-IP'] = ipCloudflare;
    }
    if (ipReenviada) {
      cabecerasBackend['X-Forwarded-For'] = ipReenviada;
    } else if (ipReal) {
      cabecerasBackend['X-Forwarded-For'] = ipReal;
    }

    const respuesta = await fetch(`${URL_BACKEND}/auth/login`, {
      method: 'POST',
      headers: cabecerasBackend,
      body: JSON.stringify(cuerpo),
    });

    if (!respuesta.ok) {
      const textoError = await respuesta.text();
      let errorData;
      try {
        errorData = JSON.parse(textoError);
      } catch (e) {
        errorData = { error: textoError || 'Credenciales invalidas' };
      }
      return NextResponse.json(errorData, { status: respuesta.status });
    }

    const resultado = await respuesta.json();
    const infoAuth = resultado.data || resultado;
    const token = infoAuth.token;
    const usuario = infoAuth.usuario;

    // Configurar cookie HTTP-Only segura
    const almacenCookies = await cookies();
    almacenCookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    // Guardar cookie con los datos del usuario en sesión
    almacenCookies.set({
      name: 'usuario',
      value: JSON.stringify(usuario),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    // Retornar solo la info publica, no el token
    return NextResponse.json({
      exito: true,
      data: usuario,
    });

  } catch (error) {
    console.error('Error en el login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
