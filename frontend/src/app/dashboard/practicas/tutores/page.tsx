import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { GestorTutoresPracticas } from '@/components/practicas/tutores/gestor-tutores-practicas';
import { obtenerTutoresResumenAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones';

export const metadata: Metadata = {
  title: 'Tutores Académicos - Prácticas Preprofesionales',
  description: 'Supervisión y control de tutores académicos y estudiantes asignados en la FICA UCE.',
};

interface PaginaTutoresPracticasProps {
  searchParams: Promise<{
    periodoId?: string;
    busqueda?: string;
    carreraId?: string;
    conAsignaciones?: string;
  }>;
}

export default async function PaginaTutoresPracticas({ searchParams }: PaginaTutoresPracticasProps) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/mi-practica');
  }

  const parametros = await searchParams;
  const esSubdecano = usuario.rol === 'SUBDECANO';

  const carreraIdFiltro = esSubdecano
    ? parametros.carreraId && parametros.carreraId !== 'TODOS'
      ? Number(parametros.carreraId)
      : undefined
    : usuario.carreraId
      ? Number(usuario.carreraId)
      : undefined;

  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/practicas/tutores'
    );

  const periodoId = periodoAcademicoId ? Number(periodoAcademicoId) : undefined;

  // Cargar tutores y catálogo de carreras concurrentemente
  const [tutores, respuestaCarreras] = await Promise.all([
    periodoId
      ? obtenerTutoresResumenAccion(carreraIdFiltro, periodoId, parametros.busqueda)
      : Promise.resolve([]),
    esSubdecano ? obtenerCarrerasAccion(0, 100) : Promise.resolve(null),
  ]);

  const carreras = respuestaCarreras?.content || [];

  // Filtrado por carga de asignaciones si está activo
  let tutoresProcesados = tutores;
  if (parametros.conAsignaciones === 'CON_ASIGNACIONES') {
    tutoresProcesados = tutoresProcesados.filter(
      (tutor) => (tutor.estudiantes?.length || 0) > 0
    );
  } else if (parametros.conAsignaciones === 'SIN_ASIGNACIONES') {
    tutoresProcesados = tutoresProcesados.filter(
      (tutor) => (tutor.estudiantes?.length || 0) === 0
    );
  }

  const nombreCarrera = esSubdecano
    ? carreraIdFiltro
      ? carreras.find((c) => String(c.id) === String(carreraIdFiltro))?.nombre || 'Facultad de Ingeniería y Ciencias Aplicadas'
      : 'Todas las carreras'
    : usuario.carreraNombre || 'Facultad de Ingeniería y Ciencias Aplicadas';

  return (
    <div className="space-y-6">
      {esInactivo && (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. Por tanto, este módulo se muestra en modo de consulta."
        />
      )}

      <GestorTutoresPracticas
        carreraId={carreraIdFiltro}
        periodoId={periodoId}
        esInactivo={esInactivo}
        tutoresIniciales={tutoresProcesados}
        carreraNombre={nombreCarrera}
        esSubdecano={esSubdecano}
        carreras={carreras}
      />
    </div>
  );
}
