import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Eliminar la cookie de sesion y de usuario
  const almacenCookies = await cookies();
  almacenCookies.delete('token');
  almacenCookies.delete('usuario');
  return NextResponse.json({ success: true });
}
