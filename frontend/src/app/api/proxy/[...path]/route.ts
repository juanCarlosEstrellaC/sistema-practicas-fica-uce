import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

async function manejarProxy(peticion: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const parametros = await params;
  const rutaBackend = Array.isArray(parametros?.path) ? parametros.path.join('/') : '';
  
  const almacenCookies = await cookies();
  const token = almacenCookies.get('token')?.value;

  const cabeceras = new Headers(peticion.headers);
  cabeceras.delete('host'); // Prevenir errores de host mismatch
  cabeceras.delete('cookie'); // Limpiar cookies originales
  
  if (token) {
    cabeceras.set('Authorization', `Bearer ${token}`);
  }

  // Evitar enviar el cuerpo en GET o HEAD
  const opciones: RequestInit & { duplex?: 'half' } = {
    method: peticion.method,
    headers: cabeceras,
    redirect: 'manual',
    duplex: 'half'
  };

  if (peticion.method !== 'GET' && peticion.method !== 'HEAD') {
    opciones.body = peticion.body;
  }

  try {
    const respuestaBackend = await fetch(`${URL_BACKEND}/${rutaBackend}${peticion.nextUrl.search}`, opciones);

    // Propagar la respuesta tal cual (sirve para JSON y para Archivos/Blobs)
    const cabecerasRespuesta = new Headers(respuestaBackend.headers);
    cabecerasRespuesta.delete('content-encoding'); // Dejar que Next.js maneje la compresion

    const tipoContenido = cabecerasRespuesta.get('content-type') || '';
    const esArchivoSubido = rutaBackend.startsWith('archivos_subidos') || rutaBackend.startsWith('archivos/');

    if (esArchivoSubido) {
      // Mitigacion Stored XSS y sniffeo de tipos MIME en archivos servidos por proxy
      cabecerasRespuesta.set('X-Content-Type-Options', 'nosniff');

      if (tipoContenido.includes('application/pdf')) {
        cabecerasRespuesta.delete('x-frame-options');
        cabecerasRespuesta.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox allow-forms allow-scripts;");
      } else if (tipoContenido.startsWith('image/')) {
        cabecerasRespuesta.delete('x-frame-options');
        cabecerasRespuesta.set('Content-Security-Policy', "default-src 'none'; sandbox;");
      } else {
        // Forzar descarga para formatos no previsualizables con seguridad en el navegador
        cabecerasRespuesta.set('Content-Disposition', 'attachment');
        cabecerasRespuesta.set('Content-Security-Policy', "default-src 'none'; sandbox;");
      }
    } else {
      cabecerasRespuesta.delete('x-frame-options'); // Eliminar para permitir iframe (evita 'refused to connect')
    }
    
    return new NextResponse(respuestaBackend.body, {
      status: respuestaBackend.status,
      statusText: respuestaBackend.statusText,
      headers: cabecerasRespuesta,
    });
  } catch (error: any) {
    // Si la conexión fue cerrada por el otro extremo (común en streams SSE o abortos de cliente), no saturar logs
    if (error?.code === 'UND_ERR_SOCKET' || error?.message?.includes('terminated')) {
      return new NextResponse(null, { status: 499 });
    }
    console.error('Error en el proxy:', error);
    return NextResponse.json({ error: 'Error de red hacia el servidor backend' }, { status: 502 });
  }
}

export const GET = manejarProxy;
export const POST = manejarProxy;
export const PUT = manejarProxy;
export const PATCH = manejarProxy;
export const DELETE = manejarProxy;
