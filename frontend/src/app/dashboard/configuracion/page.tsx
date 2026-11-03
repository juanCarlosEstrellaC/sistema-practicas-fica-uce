import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { VistaConfiguracion } from '@/components/configuracion/vista-configuracion';

export const metadata: Metadata = {
  title: 'Configuración de Perfil - FICA UCE',
  description: 'Administración de perfil personal, seguridad y preferencias del sistema en la Universidad Central del Ecuador.',
};

export default async function PaginaConfiguracion() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  return <VistaConfiguracion usuario={usuario} />;
}
