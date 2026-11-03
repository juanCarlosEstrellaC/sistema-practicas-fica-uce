import React from 'react';
import { VistaMatricesSubdecano } from './vista-matrices-subdecano';
import { VistaMatrizCacesCarrera } from './vista-matriz-caces-carrera';
import { normalizarRol } from '@/lib/seguridad/permisos';

export interface CarreraMatrizDto {
  id: number | string;
  nombre?: string;
  codigoCarrera?: string;
  ciudadCarrera?: string;
}

interface VistaGestionMatrizCacesProps {
  rol: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS' | string;
  periodoId: string | number;
  periodoNombre?: string;
  carreraId?: string | number;
  carreraNombre?: string;
  carreraCodigo?: string;
  carreraCiudad?: string;
  codigoIes?: string;
  carreras?: CarreraMatrizDto[];
  esInactivo?: boolean;
}

export function VistaGestionMatrizCaces({
  rol,
  periodoId,
  periodoNombre,
  carreraId,
  carreraNombre,
  carreraCodigo,
  carreraCiudad,
  codigoIes = '1005',
  carreras = [],
  esInactivo = false,
}: VistaGestionMatrizCacesProps) {
  const rolNormalizado = normalizarRol(rol);

  if (rolNormalizado === 'SUBDECANO') {
    return (
      <VistaMatricesSubdecano
        periodoId={periodoId}
        periodoNombre={periodoNombre}
        esInactivo={esInactivo}
      />
    );
  }

  const carreraActual = carreras.find((c) => String(c.id) === String(carreraId));
  const nombreFinal = carreraNombre || carreraActual?.nombre;
  const codigoFinal = carreraCodigo || carreraActual?.codigoCarrera;
  const ciudadFinal = carreraCiudad || carreraActual?.ciudadCarrera || 'Quito';

  return (
    <VistaMatrizCacesCarrera
      key={`${rolNormalizado}-${carreraId || 1}-${periodoId}`}
      rol={rolNormalizado}
      carreraId={carreraId || 1}
      carreraNombre={nombreFinal}
      carreraCodigo={codigoFinal}
      carreraCiudad={ciudadFinal}
      codigoIes={codigoIes}
      periodoId={periodoId}
      periodoNombre={periodoNombre}
      esInactivo={esInactivo}
    />
  );
}
