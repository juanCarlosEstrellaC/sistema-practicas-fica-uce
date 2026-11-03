import { AlertaEstadoProceso, type AlertaEstadoProcesoProps } from './practicas/estudiantes/alerta-estado-proceso';

export interface EstadoProcesoInfoProps {
  fase: string;
  estado: string;
  validadoCPP?: boolean;
  validadoCpp?: boolean;
  tieneCarta?: boolean;
  estudianteNombre?: string;
  rol?: string;
}

export function EstadoProcesoInfo({
  fase,
  estado,
  validadoCPP,
  validadoCpp,
  tieneCarta,
  estudianteNombre,
  rol,
}: EstadoProcesoInfoProps) {
  return (
    <AlertaEstadoProceso
      fase={fase}
      estado={estado}
      validadoCpp={validadoCpp ?? validadoCPP}
      tieneCarta={tieneCarta}
      estudianteNombre={estudianteNombre}
      rol={rol}
    />
  );
}

export { AlertaEstadoProceso };
