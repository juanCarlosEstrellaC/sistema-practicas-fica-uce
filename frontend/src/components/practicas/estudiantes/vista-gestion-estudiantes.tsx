'use client';

import { FiltrosEstudiantes } from './filtros-estudiantes';
import { TablaEstudiantes } from './tabla-estudiantes';
import { AsignacionPracticaDetalleDto, CarreraDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada } from '@/lib/tipos/general';

export interface VistaGestionEstudiantesProps {
  paginaAsignaciones: RespuestaPaginada<AsignacionPracticaDetalleDto>;
  carreras?: CarreraDto[];
  esSubdecano?: boolean;
  rol?: string;
  esInactivo?: boolean;
  alSeleccionarEstudiante?: (id: string) => void;
  alEditarAsignacion?: (id: string) => void;
  alEliminarAsignacion?: (id: string) => void;
}

export function VistaGestionEstudiantes({
  paginaAsignaciones,
  carreras = [],
  esSubdecano = false,
  rol = 'DIRECTOR_CARRERA',
  esInactivo = false,
  alSeleccionarEstudiante,
  alEditarAsignacion,
  alEliminarAsignacion,
}: VistaGestionEstudiantesProps) {
  return (
    <div className="space-y-5">
      <FiltrosEstudiantes
        esSubdecano={esSubdecano}
        carreras={carreras}
      />

      <TablaEstudiantes
        paginaAsignaciones={paginaAsignaciones}
        rol={rol}
        esInactivo={esInactivo}
        alSeleccionarEstudiante={alSeleccionarEstudiante}
        alEditarAsignacion={alEditarAsignacion}
        alEliminarAsignacion={alEliminarAsignacion}
      />
    </div>
  );
}
