import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { AsignadorMasivoPracticas } from '@/components/practicas/asignaciones/asignador-masivo-practicas';
import {
  obtenerEstudiantesDisponiblesPracticasAccion,
  obtenerTutoresResumenAccion,
} from '@/lib/acciones/pp/asignacion-practica.acciones';
import { obtenerConveniosAccion } from '@/lib/acciones/pp/convenio.acciones';

export const metadata: Metadata = {
  title: 'Asignación de Prácticas Preprofesionales',
  description: 'Asignación masiva de estudiantes a tutores académicos y empresas receptoras en prácticas preprofesionales.',
};

interface PaginaAsignacionesPracticasProps {
  searchParams: Promise<{
    periodoId?: string;
  }>;
}

export default async function PaginaAsignacionesPracticas({ searchParams }: PaginaAsignacionesPracticasProps) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    redirect('/autenticacion/iniciar-sesion');
  }

  if (usuario.rol === 'ESTUDIANTE') {
    redirect('/dashboard/practicas/mi-practica');
  }

  if (usuario.rol !== 'COORDINADOR_PRACTICAS') {
    redirect('/dashboard/practicas/estudiantes');
  }

  const parametros = await searchParams;
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard/practicas/asignaciones'
    );

  const carreraIdNum = usuario.carreraId ? Number(usuario.carreraId) : undefined;

  // Obtención paralela de colecciones en el servidor únicamente cuando el periodo está activo
  const [estudiantes, conveniosPaginados, tutores] = !esInactivo && periodoAcademicoId
    ? await Promise.all([
        obtenerEstudiantesDisponiblesPracticasAccion(carreraIdNum, periodoAcademicoId),
        obtenerConveniosAccion({ estado: 'ACTIVO', size: 100 }),
        obtenerTutoresResumenAccion(carreraIdNum, periodoAcademicoId),
      ])
    : [[], { content: [] }, []];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Asignación de Prácticas Preprofesionales
        </h1>
        <p className="text-sm text-muted-foreground">
          Seleccione los estudiantes disponibles, la empresa receptora con cupos y el tutor académico para completar la asignación.
        </p>
      </div>

      {esInactivo ? (
        <BannerPeriodoInactivo
          nombrePeriodo={periodoActual?.nombre}
          mensaje="El periodo académico seleccionado se encuentra inactivo. Por tanto, este módulo es de solo lectura y no se pueden realizar nuevas asignaciones de prácticas preprofesionales."
        />
      ) : (
        <AsignadorMasivoPracticas
          estudiantes={estudiantes}
          convenios={conveniosPaginados.content}
          tutores={tutores}
          periodoAcademicoId={periodoAcademicoId || 1}
          carreraId={carreraIdNum}
        />
      )}
    </div>
  );
}
