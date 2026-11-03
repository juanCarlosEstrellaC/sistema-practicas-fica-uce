import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';

export default async function PaginaRaizPracticas() {
  const usuario = await obtenerUsuarioServidor();

  if (!usuario) {
    redirect('/');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/progreso-general');
  }

  redirect('/dashboard');
}
