import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';

export default async function PaginaRaizVinculacion() {
  const usuario = await obtenerUsuarioServidor();

  if (!usuario) {
    redirect('/login');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/vinculacion/progreso-general');
  }

  if (usuario.rol === 'TUTOR_ACADEMICO') {
    redirect('/dashboard/vinculacion/asignaciones-existentes');
  }

  redirect('/dashboard/vinculacion/asignaciones-existentes');
}
