import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { obtenerProyectosComunitariosAccion } from '@/lib/acciones/vcs/proyecto-comunitario.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { FiltrosProyectos } from '@/components/vinculacion/filtros-proyectos';
import { TablaProyectos } from '@/components/vinculacion/tabla-proyectos';
import { EstadoProyectoComunitario } from '@/lib/tipos/vcs/proyecto-comunitario';

export const metadata: Metadata = {
  title: 'Vinculación con la Sociedad - Proyectos Comunitarios',
  description: 'Gestión y administración de proyectos comunitarios de vinculación con la sociedad.',
};

interface PaginaVinculacionProps {
  searchParams: Promise<{
    periodoId?: string;
    busqueda?: string;
    carreraId?: string;
    estado?: string;
    page?: string;
    size?: string;
    sort?: string;
  }>;
}

export default async function PaginaVinculacionProyectos({ searchParams }: PaginaVinculacionProps) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/vinculacion/mi-proyecto');
  }
  const params = await searchParams;

  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      params.periodoId,
      '/dashboard/vinculacion/proyectos-comunitarios'
    );

  const esSubdecano = usuario?.rol === 'SUBDECANO';
  const esTutor = usuario?.rol === 'TUTOR_ACADEMICO';
  const paginaActual = params.page ? parseInt(params.page, 10) : 0;
  const tamanioPagina = params.size ? parseInt(params.size, 10) : 10;

  const carreraIdFiltro = esSubdecano
    ? (params.carreraId && params.carreraId !== 'TODOS' ? parseInt(params.carreraId, 10) : undefined)
    : esTutor ? undefined : (usuario?.carreraId ? Number(usuario.carreraId) : undefined);

  const tutorIdFiltro = esTutor ? (usuario?.id ? Number(usuario.id) : undefined) : undefined;

  const estado = params.estado && params.estado !== 'TODOS' ? (params.estado as EstadoProyectoComunitario) : undefined;
  const busqueda = params.busqueda || undefined;
  const sort = params.sort || undefined;

  // Fetching paralelo de las peticiones al backend.
  const [paginaProyectos, respuestaCarreras] = await Promise.all([
    obtenerProyectosComunitariosAccion({
      page: isNaN(paginaActual) ? 0 : paginaActual,
      size: isNaN(tamanioPagina) ? 10 : tamanioPagina,
      carreraId: carreraIdFiltro,
      tutorId: tutorIdFiltro,
      estado,
      periodoId: periodoAcademicoId,
      busqueda,
      sort,
    }),
    esSubdecano ? obtenerCarrerasAccion(0, 100) : Promise.resolve(null),
  ]);

  const listaCarreras = respuestaCarreras?.content || [];

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col gap-1">
        <h4 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground">
          Gestión de Proyectos Comunitarios
        </h4>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Aquí podrá gestionar los proyectos comunitarios de vinculación con la sociedad y sus informes del periodo {periodoActual ? `(${periodoActual.nombre})` : ''}.
        </p>
      </div>

      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. El inicio de proyectos y la carga o revisión de informes del periodo están deshabilitados (modo de solo lectura)."
        />
      )}

      {/* Filtros Paginados por URL */}
      <FiltrosProyectos carreras={listaCarreras} />

      {/* Tabla con Paginación y Modales */}
      <TablaProyectos
        paginaProyectos={paginaProyectos}
        carreras={listaCarreras}
        periodoId={periodoAcademicoId}
        nombrePeriodo={periodoActual?.nombre}
        esPeriodoInactivo={esInactivo}
      />
    </div>
  );
}
