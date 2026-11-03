import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { VistaProgresoGeneralPp } from '@/components/practicas/estudiante/vista-progreso-general-pp';

export const metadata: Metadata = {
  title: 'Progreso General - Prácticas Preprofesionales',
  description: 'Resumen global del avance de horas reglamentarias e historial de prácticas preprofesionales.',
};

export default async function PaginaProgresoGeneralPp() {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;

  const resAsignaciones = await obtenerAsignacionesPracticasAccion({
    estudianteId,
    page: 0,
    size: 100,
  });
  const asignaciones = resAsignaciones.content || [];

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
        horasRequeridas={usuario?.horasRequeridas || 240}
        horasAcumuladas={usuario?.horasAcumuladas || 0}
      />
    </div>
  );
}
