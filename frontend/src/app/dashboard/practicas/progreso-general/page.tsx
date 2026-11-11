import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { obtenerUsuarioPorIdAccion } from '@/lib/acciones/usuario.acciones';
import { obtenerCarreraPorIdAccion } from '@/lib/acciones/carrera.acciones';
import { VistaProgresoGeneralPp } from '@/components/practicas/estudiante/vista-progreso-general-pp';

export const metadata: Metadata = {
  title: 'Progreso General - Prácticas Preprofesionales',
  description: 'Resumen global del avance de horas reglamentarias e historial de prácticas preprofesionales.',
};

export default async function PaginaProgresoGeneralPp() {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;
  const carreraId = usuario?.carreraId ? Number(usuario.carreraId) : undefined;

  const [resAsignaciones, usuarioActualizado, carrera] = await Promise.all([
    obtenerAsignacionesPracticasAccion({
      estudianteId,
      requiereCarta: true,
      page: 0,
      size: 100,
    }),
    estudianteId ? obtenerUsuarioPorIdAccion(estudianteId) : Promise.resolve(null),
    carreraId ? obtenerCarreraPorIdAccion(carreraId) : Promise.resolve(null),
  ]);

  const asignaciones = (resAsignaciones.content || []).filter(
    (asig) => asig.cartaAsignacionEnviada !== false
  );

  const horasRequeridas =
    usuarioActualizado?.horasRequeridas ||
    carrera?.horasPractica ||
    usuario?.horasRequeridas ||
    240;
  const horasAcumuladas =
    usuarioActualizado?.horasAcumuladas ??
    usuario?.horasAcumuladas ??
    0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Progreso General en Prácticas Preprofesionales
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte el acumulado total de horas reglamentarias y el historial de sus periodos de prácticas preprofesionales.
        </p>
      </div>

      <VistaProgresoGeneralPp
        asignaciones={asignaciones}
        horasRequeridas={horasRequeridas}
        horasAcumuladas={horasAcumuladas}
      />
    </div>
  );
}
