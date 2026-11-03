'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DocumentoDto, FaseActualPractica } from '@/lib/tipos/pp/general-pp';
import { obtenerDocumentosPorEstudianteAccion } from '@/lib/acciones/pp/documento-portafolio.acciones';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EsqueletoDocumentosPortafolio } from '@/components/esqueletos/esqueleto-portafolio-estudiante';
import { cn } from '@/lib/utils';
import {
  DocumentoPortafolioItem,
  generarConfiguracionPortafolio,
} from './tipos-portafolio';
import { TarjetaDocumentoPortafolio } from './tarjeta-documento-portafolio';
import { ModalSubirDocumentoPortafolio } from './modal-subir-documento-portafolio';

export interface PropiedadesPortafolio {
  estudianteId: string;
  soloLectura?: boolean;
  mostrarTitulo?: boolean;
  documentos?: DocumentoDto[] | any[];
  permitirResubirIds?: string[];
  asignacionId?: string;
  etapaActual?: FaseActualPractica;
  validadoCpp?: boolean;
  rol?: string;
  asignacionEstado?: string;
  claseLista?: string;
  claseContenedor?: string;
}

const ETAPA_ORDEN: Record<FaseActualPractica, number> = {
  CONVOCATORIA: 0,
  ASIGNACION: 1,
  DESARROLLO: 2,
  FINALIZACION: 3,
};

function normalizarRol(r?: string): string | undefined {
  if (!r) return undefined;
  const limpio = r.trim().toUpperCase();
  if (limpio === 'CPP' || limpio === 'COORDINADOR') return 'COORDINADOR_PRACTICAS';
  if (limpio === 'TA' || limpio === 'TUTOR') return 'TUTOR_ACADEMICO';
  if (limpio === 'DC' || limpio === 'DIRECTOR') return 'DIRECTOR_CARRERA';
  if (limpio === 'SUB' || limpio === 'SUBDECANATO') return 'SUBDECANO';
  return limpio;
}

export function Portafolio({
  estudianteId,
  soloLectura = false,
  mostrarTitulo = true,
  documentos: propDocumentos,
  permitirResubirIds,
  asignacionId,
  etapaActual = 'CONVOCATORIA',
  validadoCpp = false,
  rol,
  asignacionEstado,
  claseLista,
  claseContenedor,
}: PropiedadesPortafolio) {
  const [documentos, setDocumentos] = useState<DocumentoDto[]>(propDocumentos || []);
  const [cargando, setCargando] = useState<boolean>(!propDocumentos);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoPortafolioItem | null>(null);
  const [docDestacadoId, setDocDestacadoId] = useState<string | null>(null);

  const rolNormalizado = normalizarRol(rol);

  const searchParams = useSearchParams();

  // Escuchar parámetro 'highlight' para deep-linking desde notificaciones
  useEffect(() => {
    const highlight = searchParams?.get('highlight');
    if (highlight) {
      setDocDestacadoId(highlight);
      const timer = setTimeout(() => setDocDestacadoId(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Cargar documentos mediante Server Action si no vienen por props
  const cargarDocumentos = useCallback(async () => {
    if (!estudianteId) return;
    setCargando(true);
    try {
      const res = await obtenerDocumentosPorEstudianteAccion(Number(estudianteId));
      setDocumentos(res);
    } catch (error) {
      console.error('Error al cargar documentos del portafolio:', error);
    } finally {
      setCargando(false);
    }
  }, [estudianteId]);

  useEffect(() => {
    if (propDocumentos) {
      setDocumentos(propDocumentos);
      setCargando(false);
    } else {
      cargarDocumentos();
    }
  }, [propDocumentos, cargarDocumentos]);

  const avalEmitido = useMemo(() => {
    const docAval = documentos.find((d) => d.tipo === 'AVAL');
    return Boolean(docAval && docAval.url && docAval.url !== '');
  }, [documentos]);

  const documentosPortafolio = useMemo(() => {
    return generarConfiguracionPortafolio(
      documentos,
      asignacionEstado,
      !soloLectura,
      avalEmitido,
      validadoCpp,
      rolNormalizado
    );
  }, [documentos, asignacionEstado, soloLectura, avalEmitido, validadoCpp, rolNormalizado]);

  const estaDocumentoDisponible = useCallback(
    (doc: DocumentoPortafolioItem) => {
      const ordenActual = ETAPA_ORDEN[etapaActual] ?? 0;
      return ETAPA_ORDEN[doc.etapaMinima] <= ordenActual;
    },
    [etapaActual]
  );

  const esResubible = useCallback(
    (doc: DocumentoPortafolioItem) => {
      if (soloLectura && (!permitirResubirIds || !permitirResubirIds.includes(doc.id))) {
        return false;
      }
      const disponible = estaDocumentoDisponible(doc);
      return (
        disponible &&
        (doc.estado === 'rechazado' ||
          (doc.estado === 'pendiente' && ['doc_cv', 'doc_cedula'].includes(doc.id))) &&
        !['doc_carta', 'doc_matriz', 'doc_aval'].includes(doc.id)
      );
    },
    [soloLectura, permitirResubirIds, estaDocumentoDisponible]
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
        <EsqueletoDocumentosPortafolio cantidad={6} />
      ) : (
        <div className={cn('space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1', claseLista)}>
          {documentosPortafolio.map((doc) => {
            const disponible = estaDocumentoDisponible(doc);
            const puedeResubir = esResubible(doc);

            return (
              <TarjetaDocumentoPortafolio
                key={doc.id}
                documento={doc}
                disponible={disponible}
                puedeResubir={puedeResubir}
                alSeleccionarParaSubir={setDocSeleccionado}
                esDestacado={docDestacadoId === doc.id}
                rol={rolNormalizado}
              />
            );
          })}
        </div>
      )}

      {/* Modal Desacoplado para Subir o Resubir */}
      <ModalSubirDocumentoPortafolio
        documento={docSeleccionado}
        abierto={Boolean(docSeleccionado)}
        alCerrar={() => setDocSeleccionado(null)}
        estudianteId={estudianteId}
        asignacionId={asignacionId}
        alDocumentoActualizado={cargarDocumentos}
        esSoloLectura={
          soloLectura &&
          (!permitirResubirIds || !permitirResubirIds.includes(docSeleccionado?.id || ''))
        }
      />
    </div>
  );
}

export default Portafolio;
