import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { VistaGestionMatrizCaces } from '@/components/practicas/matriz-caces/vista-gestion-matriz-caces';

export const metadata: Metadata = {
  title: 'Matriz CACES - Prácticas Preprofesionales',
  description: 'Gestión y control de matrices CACES para acreditación en la FICA UCE.',
};

interface PaginaMatrizCacesProps {
  searchParams: Promise<{
    periodoId?: string;
  }>;
}

export default async function PaginaMatrizCaces({ searchParams }: PaginaMatrizCacesProps) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/mi-practica');
  }

  const parametros = await searchParams;
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/practicas/matriz-caces'
    );

  const idPeriodo = periodoAcademicoId ? String(periodoAcademicoId) : '1';
  const idCarrera = usuario.carreraId ? String(usuario.carreraId) : '1';

  // Si no es subdecano, obtener carreras para determinar el nombre y código de la carrera
  const respuestaCarreras = usuario.rol !== 'SUBDECANO'
    ? await obtenerCarrerasAccion(0, 100)
    : null;
  const listaCarreras = (respuestaCarreras?.content || []) as any[];
  const carreraActual = listaCarreras.find((c: any) => String(c.id) === String(idCarrera));

  return (
    <div className="space-y-6">
      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. Por tanto, este módulo se muestra en modo de consulta."
        />
      )}

      <VistaGestionMatrizCaces
        rol={usuario.rol as any}
        periodoId={idPeriodo}
        periodoNombre={periodoActual?.nombre}
        carreraId={idCarrera}
        carreraNombre={carreraActual?.nombre}
        carreraCodigo={carreraActual?.codigoCarrera}
        carreraCiudad={carreraActual?.ciudadCarrera || 'Quito'}
        codigoIes="1005"
        carreras={listaCarreras}
        esInactivo={esInactivo}
      />
    </div>
  );
}
