import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { FiltrosAsignacionesVcs } from '@/components/vinculacion/filtros-asignaciones-vcs';
import { TablaAsignacionesVcs } from '@/components/vinculacion/tabla-asignaciones-vcs';
import {
  obtenerAsignacionesProyectosComunitariosAccion,
  obtenerProyectosDisponiblesAccion,
} from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { EstadoAsignacionVcs, FaseActualAsignacion } from '@/lib/tipos/vcs/asignacion-proyecto';

export const metadata: Metadata = {
  title: 'Asignaciones Existentes - Vinculación',
  description: 'Gestión y seguimiento de asignaciones a proyectos comunitarios de vinculación.',
};

interface PaginaAsignacionesExistentesProps {
  searchParams: Promise<{
    periodoId?: string;
    page?: string;
    size?: string;
    busqueda?: string;
    carreraId?: string;
    proyectoId?: string;
    estado?: string;
    faseActual?: string;
    sort?: string;
  }>;
}

export default async function PaginaAsignacionesExistentes({ searchParams }: PaginaAsignacionesExistentesProps) {
  const usuario = await obtenerUsuarioServidor();
  if (usuario?.rol === 'ESTUDIANTE') {
    redirect('/dashboard/vinculacion/mi-proyecto');
  }

  const parametros = await searchParams;
  const esSubdecano = usuario?.rol === 'SUBDECANO';
  const esTutor = usuario?.rol === 'TUTOR_ACADEMICO';
  const carreraIdFiltro = parametros.carreraId && parametros.carreraId !== 'TODOS' ? parseInt(parametros.carreraId, 10) : undefined;
  const carreraId = esSubdecano ? carreraIdFiltro : esTutor ? undefined : (usuario?.carreraId ? Number(usuario.carreraId) : undefined);
  const tutorId = esTutor ? (usuario?.id ? Number(usuario.id) : undefined) : undefined;

  const pagina = parametros.page ? parseInt(parametros.page, 10) : 0;
  const tamanio = parametros.size ? parseInt(parametros.size, 10) : 10;
  const proyectoId = parametros.proyectoId && parametros.proyectoId !== 'TODOS' ? parseInt(parametros.proyectoId, 10) : undefined;
  const estado = parametros.estado && parametros.estado !== 'TODOS' ? (parametros.estado as EstadoAsignacionVcs) : undefined;
  const faseActual = parametros.faseActual && parametros.faseActual !== 'TODOS' ? (parametros.faseActual as FaseActualAsignacion) : undefined;
  
  // 1. Obtener periodo académico resuelto
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/vinculacion/asignaciones-existentes'
    );
    
  // 2. Traer datos de asignaciones, proyectos y carreras (si es subdecano) en paralelo
  const [paginaAsignaciones, proyectos, respuestaCarreras] = periodoAcademicoId
    ? await Promise.all([
        obtenerAsignacionesProyectosComunitariosAccion({
          carreraId,
          tutorId,
          periodoAcademicoId,
          proyectoId,
          estado,
          faseActual,
          busqueda: parametros.busqueda,
          page: pagina,
          size: tamanio,
          sort: parametros.sort,
        }),
        obtenerProyectosDisponiblesAccion(carreraId, periodoAcademicoId),
        esSubdecano ? obtenerCarrerasAccion(0, 100) : Promise.resolve(null),
      ])
    : [
        {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: tamanio,
          first: true,
          last: true,
          empty: true,
        },
        [],
        null,
      ];

  const carreras = respuestaCarreras?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Asignaciones de Proyectos Comunitarios
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte, filtre y gestione las asignaciones de estudiantes a proyectos comunitarios para el periodo académico {periodoActual ? `(${periodoActual.nombre})` : ''}.
        </p>
      </div>

      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. El listado de asignaciones se muestra en modo de solo lectura."
        />
      )}

      <FiltrosAsignacionesVcs proyectos={proyectos} carreras={carreras} />

      <TablaAsignacionesVcs
        paginaAsignaciones={paginaAsignaciones}
        proyectos={proyectos}
        esInactivo={esInactivo}
      />
    </div>
  );
}