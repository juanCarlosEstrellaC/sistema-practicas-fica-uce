import { Metadata } from 'next';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { TablaTutoresVcs } from '@/components/vinculacion/tabla-tutores-vcs';
import { FiltrosTutoresVcs } from '@/components/vinculacion/filtros-tutores-vcs';
import {
  obtenerTutoresDisponiblesAccion,
  obtenerProyectosDisponiblesAccion,
} from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';

export const metadata: Metadata = {
  title: 'Carga Académica de Tutores - Vinculación',
  description: 'Seguimiento y carga académica de proyectos comunitarios asociados por cada tutor.',
};

interface PaginaTutoresVinculacionProps {
  searchParams: Promise<{
    periodoId?: string;
    busqueda?: string;
    carreraId?: string;
    proyectoId?: string;
    conAsignaciones?: string;
  }>;
}

export default async function PaginaTutoresVinculacion({
  searchParams,
}: PaginaTutoresVinculacionProps) {
  const usuario = await obtenerUsuarioServidor();
  const parametros = await searchParams;

  const esSubdecano = usuario?.rol === 'SUBDECANO';
  const carreraIdFiltro = esSubdecano
    ? (parametros.carreraId && parametros.carreraId !== 'TODOS' ? Number(parametros.carreraId) : undefined)
    : (usuario?.carreraId ? Number(usuario.carreraId) : undefined);

  // 1. Obtener periodo académico resuelto
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/vinculacion/tutores'
    );

  const proyectoId =
    parametros.proyectoId && parametros.proyectoId !== 'TODOS'
      ? Number(parametros.proyectoId)
      : undefined;

  const conAsignaciones =
    parametros.conAsignaciones && parametros.conAsignaciones !== 'TODOS'
      ? parametros.conAsignaciones
      : undefined;

  // 2. Traer tutores, proyectos disponibles y carreras en paralelo
  const [tutores, proyectos, respuestaCarreras] =
    periodoAcademicoId
      ? await Promise.all([
          obtenerTutoresDisponiblesAccion(
            carreraIdFiltro,
            periodoAcademicoId,
            parametros.busqueda,
            proyectoId,
            conAsignaciones
          ),
          obtenerProyectosDisponiblesAccion(carreraIdFiltro, periodoAcademicoId),
          esSubdecano ? obtenerCarrerasAccion(0, 100) : Promise.resolve(null),
        ])
      : [[], [], null];

  const carreras = respuestaCarreras?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Carga Académica de Tutores
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte los proyectos comunitarios asociados y el número de asignaciones activas por tutor para el periodo {periodoActual ? `(${periodoActual.nombre})` : ''}.
        </p>
      </div>

      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. La información de carga académica se presenta en modo de solo lectura."
        />
      )}

      {/* Barra de Filtros Unificada */}
      <FiltrosTutoresVcs proyectos={proyectos} carreras={carreras} />

      {/* Tabla de Tutores */}
      <TablaTutoresVcs tutores={tutores} proyectos={proyectos} esInactivo={esInactivo} />
    </div>
  );
}
