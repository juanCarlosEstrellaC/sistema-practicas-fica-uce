import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { VistaGestionEstudiantes } from '@/components/practicas/estudiantes/vista-gestion-estudiantes';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';

export const metadata: Metadata = {
  title: 'Estudiantes con Asignación - Prácticas Preprofesionales',
  description: 'Gestión y seguimiento de estudiantes asignados a tutor y convenio en prácticas preprofesionales.',
};

interface PaginaEstudiantesProps {
  searchParams: Promise<{
    periodoId?: string;
    page?: string;
    size?: string;
    busqueda?: string;
    carreraId?: string;
    estado?: string;
    fase?: string;
    faseActual?: string;
    sort?: string;
  }>;
}

export default async function PaginaEstudiantes({ searchParams }: PaginaEstudiantesProps) {
  const usuario = await obtenerUsuarioServidor();
  if (usuario?.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/mi-practica');
  }

  const parametros = await searchParams;
  const esSubdecano = usuario?.rol === 'SUBDECANO';
  const esTutor = usuario?.rol === 'TUTOR_ACADEMICO';
  const carreraIdFiltro =
    parametros.carreraId && parametros.carreraId !== 'TODOS'
      ? parseInt(parametros.carreraId, 10)
      : undefined;
  const carreraId = esSubdecano
    ? carreraIdFiltro
    : usuario?.carreraId
      ? Number(usuario.carreraId)
      : undefined;
  const tutorId = esTutor && usuario?.id ? Number(usuario.id) : undefined;

  const pagina = parametros.page ? parseInt(parametros.page, 10) : 0;
  const tamanio = parametros.size ? parseInt(parametros.size, 10) : 10;
  const estado = parametros.estado && parametros.estado !== 'TODOS' ? parametros.estado : undefined;
  const faseParam = parametros.fase || parametros.faseActual;
  const fase = faseParam && faseParam !== 'TODOS' ? faseParam : undefined;

  // 1. Resolver periodo académico en el servidor
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/practicas/estudiantes'
    );

  // 2. Obtener datos de asignaciones y carreras en paralelo
  const [paginaAsignaciones, respuestaCarreras] = periodoAcademicoId
    ? await Promise.all([
        obtenerAsignacionesPracticasAccion({
          carreraId,
          tutorId,
          periodoId: Number(periodoAcademicoId),
          estado,
          fase,
          search: parametros.busqueda,
          page: pagina,
          size: tamanio,
          sort: parametros.sort,
        }),
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
        null,
      ];

  const carreras = (respuestaCarreras?.content || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Estudiantes con Asignación
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte, filtre y gestione las prácticas preprofesionales de los estudiantes para el periodo académico{' '}
          {periodoActual ? `(${periodoActual.nombre})` : ''}.
        </p>
      </div>

      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. El listado de asignaciones se muestra en modo de solo lectura."
        />
      )}

      <VistaGestionEstudiantes
        paginaAsignaciones={paginaAsignaciones as any}
        carreras={carreras}
        esSubdecano={esSubdecano}
        rol={usuario?.rol}
        esInactivo={esInactivo}
      />
    </div>
  );
}
