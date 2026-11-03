'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { EvidenciaVcs } from '@/lib/tipos/vcs/evidencia-vcs';
import {
  AsignacionProyectoComunitarioDto,
  FaseActualAsignacion,
} from '@/lib/tipos/vcs/asignacion-proyecto';
import { obtenerEvidenciasPorAsignacionAccion } from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { EsqueletoDocumentosPortafolio } from '@/components/esqueletos/esqueleto-portafolio-estudiante';
import { cn } from '@/lib/utils';
import {
  DocumentoPortafolioVcsItem,
  generarConfiguracionPortafolioVcs,
} from './tipos-portafolio-vcs';
import { TarjetaDocumentoPortafolioVcs } from './tarjeta-documento-portafolio-vcs';
import { ModalDetalleDocumentoVcs } from './modal-detalle-documento-vcs';

export interface PropiedadesPortafolioVcs {
  asignacionId: number | string;
  asignacion?: Partial<AsignacionProyectoComunitarioDto> | null;
  evidencias?: EvidenciaVcs[];
  mostrarTitulo?: boolean;
  etapaActual?: FaseActualAsignacion;
  claseLista?: string;
  claseContenedor?: string;
}

const ETAPA_ORDEN_VCS: Record<FaseActualAsignacion, number> = {
  ASIGNACION: 0,
  DESARROLLO: 1,
  EVALUACION: 2,
  FINALIZACION: 2,
  FINALIZADO: 2,
};

export function PortafolioVcs({
  asignacionId,
  asignacion,
  evidencias: propEvidencias,
  mostrarTitulo = true,
  etapaActual = 'ASIGNACION',
  claseLista,
  claseContenedor,
}: PropiedadesPortafolioVcs) {
  const [evidencias, setEvidencias] = useState<EvidenciaVcs[]>(propEvidencias || []);
  const [cargando, setCargando] = useState<boolean>(!propEvidencias);
  const [docDestacadoId, setDocDestacadoId] = useState<string | null>(null);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoPortafolioVcsItem | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const highlight = searchParams?.get('highlight');
    if (highlight) {
      setDocDestacadoId(highlight);
      const timer = setTimeout(() => setDocDestacadoId(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const cargarEvidencias = useCallback(async () => {
    if (!asignacionId) return;
    setCargando(true);
    try {
      const res = await obtenerEvidenciasPorAsignacionAccion(Number(asignacionId));
      if (res.exito && res.data) {
        setEvidencias(res.data);
      } else {
        setEvidencias([]);
      }
    } catch (error) {
      console.error('Error al cargar evidencias del portafolio VCS:', error);
    } finally {
      setCargando(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    if (propEvidencias) {
      setEvidencias(propEvidencias);
      setCargando(false);
    } else {
      cargarEvidencias();
    }
  }, [propEvidencias, cargarEvidencias]);

  const documentosPortafolio = useMemo(() => {
    return generarConfiguracionPortafolioVcs(evidencias, asignacion);
  }, [evidencias, asignacion]);

  const estaDocumentoDisponible = useCallback(
    (doc: DocumentoPortafolioVcsItem) => {
      if (asignacion?.estado === 'APROBADO') return true;
      const ordenActual = ETAPA_ORDEN_VCS[etapaActual] ?? 0;
      return (ETAPA_ORDEN_VCS[doc.etapaMinima] ?? 0) <= ordenActual;
    },
    [etapaActual, asignacion?.estado]
  );

  return (
    <div className={cn('w-full flex flex-col min-h-0 h-full', claseContenedor)}>
      {mostrarTitulo && (
        <CardHeader className="px-0 pt-0 pb-2.5 gap-0 shrink-0">
          <CardTitle className="text-base sm:text-lg font-bold text-foreground pt-1 px-1">
            Documentos del Portafolio
          </CardTitle>
        </CardHeader>
      )}

      {cargando ? (
        <EsqueletoDocumentosPortafolio cantidad={3} />
      ) : (
        <div className={cn('space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1', claseLista)}>
          {documentosPortafolio.map((doc) => {
            const disponible = estaDocumentoDisponible(doc);

            return (
              <TarjetaDocumentoPortafolioVcs
                key={doc.id}
                documento={doc}
                disponible={disponible}
                esDestacado={docDestacadoId === doc.id}
                alSeleccionarParaDetalles={setDocSeleccionado}
              />
            );
          })}
        </div>
      )}

      {/* Modal Desacoplado para Ver Detalles */}
      <ModalDetalleDocumentoVcs
        documento={docSeleccionado}
        alCerrar={() => setDocSeleccionado(null)}
      />
    </div>
  );
}

export default PortafolioVcs;
