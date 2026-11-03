import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy de red para Next.js 16 (reemplazo oficial del antiguo middleware.ts).
 * Intercepta peticiones en el borde para verificar autenticación y proteger rutas.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas publicas que no requieren autenticacion
  const esRutaPublica =
    pathname === '/' ||
    pathname.startsWith('/restaurar-contrasenia') ||
    pathname.startsWith('/activar-cuenta');

  // Si no hay token y no es una ruta publica, redirigir al login
  if (!token && !esRutaPublica) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si ya tiene sesion activa e intenta entrar al login, redirigir al dashboard
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)'],
};
