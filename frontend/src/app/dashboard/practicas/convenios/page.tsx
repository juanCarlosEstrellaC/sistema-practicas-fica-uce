import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerConveniosAccion } from '@/lib/acciones/pp/convenio.acciones';
import { obtenerObservacionesAccion } from '@/lib/acciones/pp/observacion.acciones';
import { VistaGestionConvenios } from '@/components/practicas/convenios/vista-gestion-convenios';

export const metadata: Metadata = {
  title: 'Prácticas Preprofesionales - Convenios Institucionales',
  description: 'Gestión y seguimiento de convenios institucionales para prácticas preprofesionales.',
};

interface PaginaConveniosProps {
  searchParams: Promise<{
    busqueda?: string;
    estado?: string;
    page?: string;
    size?: string;
    subtab?: string;
  }>;
}

export default async function PaginaConvenios({ searchParams }: PaginaConveniosProps) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/mi-practica');
  }

  const parametros = await searchParams;
  const pagina = parametros.page ? parseInt(parametros.page, 10) : 0;
  const tamano = parametros.size ? parseInt(parametros.size, 10) : 10;
  const busqueda = parametros.busqueda || undefined;
  const estado = parametros.estado && parametros.estado !== 'TODOS' ? parametros.estado : undefined;

  const esSubdecano = usuario?.rol === 'SUBDECANO';

  const [conveniosIniciales, observacionesIniciales] = await Promise.all([
    obtenerConveniosAccion({
      page: isNaN(pagina) ? 0 : pagina,
      size: isNaN(tamano) ? 10 : tamano,
      search: busqueda,
      estado,
    }),
    parametros.subtab === 'observaciones'
      ? obtenerObservacionesAccion({
          page: 0,
          size: 10,
          remitenteId: !esSubdecano && usuario?.id ? Number(usuario.id) : undefined,
        })
      : Promise.resolve(undefined),
  ]);

  return (
    <div className="space-y-6">
      <VistaGestionConvenios
        rol={usuario?.rol}
        usuarioId={usuario?.id ? String(usuario.id) : '1'}
        conveniosIniciales={conveniosIniciales}
        observacionesIniciales={observacionesIniciales}
      />
    </div>
  );
}
