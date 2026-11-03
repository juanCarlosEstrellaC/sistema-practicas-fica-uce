'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ConvenioDto, ObservacionDto } from '@/lib/tipos/pp/general-pp';
import { RolUsuario, RespuestaPaginada } from '@/lib/tipos/general';
import { obtenerConveniosAccion } from '@/lib/acciones/pp/convenio.acciones';
import { obtenerObservacionesAccion } from '@/lib/acciones/pp/observacion.acciones';
import { TablaConvenios } from './tabla-convenios';
import { FiltrosConvenios } from './filtros-convenios';
import { ModalFormularioConvenio } from './modal-formulario-convenio';
import { ModalDetalleConvenio } from './modal-detalle-convenio';
import { ModalSugerirConvenio } from './modal-sugerir-convenio';
import { ModalEliminarConvenio } from './modal-eliminar-convenio';
import { TablaObservacionesConvenio } from './tabla-observaciones-convenio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';

export interface VistaGestionConveniosProps {
  rol?: RolUsuario;
  usuarioId?: string;
  conveniosIniciales?: RespuestaPaginada<ConvenioDto>;
  observacionesIniciales?: RespuestaPaginada<ObservacionDto>;
}

export function VistaGestionConvenios({
  rol = 'SUBDECANO',
  usuarioId = '1',
  conveniosIniciales,
  observacionesIniciales,
}: VistaGestionConveniosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();

  const esSubdecano = rol === 'SUBDECANO';

  // Pestaña activa
  const [subpestania, setSubpestania] = useState(searchParams.get('subtab') || 'actuales');

  // Estado Convenios
  const [conveniosData, setConveniosData] = useState<RespuestaPaginada<ConvenioDto>>(
    conveniosIniciales || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }
  );

  // Estado Observaciones
  const [observacionesData, setObservacionesData] = useState<RespuestaPaginada<ObservacionDto>>(
    observacionesIniciales || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }
  );

  // Filtros Observaciones (en pestaña secundaria)
  const [textoObs, setTextoObs] = useState('');
  const [tipoObs, setTipoObs] = useState('all');
  const [estadoObs, setEstadoObs] = useState('all');
  const [paginaObs, setPaginaObs] = useState(0);
  const [tamanoObs, setTamanoObs] = useState(10);

  // Modales
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [convenioAEditar, setConvenioAEditar] = useState<ConvenioDto | null>(null);
  const [convenioADetalle, setConvenioADetalle] = useState<ConvenioDto | null>(null);
  const [convenioAEliminar, setConvenioAEliminar] = useState<ConvenioDto | null>(null);

  const [modalSugerirAbierto, setModalSugerirAbierto] = useState(false);
  const [convenioAAnular, setConvenioAAnular] = useState<ConvenioDto | null>(null);

  // Carga inicial o refetch de convenios si no provienen de RSC
  const cargarConvenios = async () => {
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;
    const size = searchParams.get('size') ? Number(searchParams.get('size')) : 10;
    const busqueda = searchParams.get('busqueda') || undefined;
    const estado = searchParams.get('estado') || undefined;

    const resultado = await obtenerConveniosAccion({
      page,
      size,
      search: busqueda,
      estado,
    });
    setConveniosData(resultado);
  };

  const cargarObservaciones = async () => {
    const resultado = await obtenerObservacionesAccion({
      page: paginaObs,
      size: tamanoObs,
      search: textoObs || undefined,
      tipo: tipoObs === 'all' ? undefined : tipoObs,
      estado: estadoObs === 'all' ? undefined : estadoObs,
      remitenteId: !esSubdecano && usuarioId ? Number(usuarioId) : undefined,
    });
    setObservacionesData(resultado);
  };

  // Reaccionar a cambios en URL searchParams para convenios
  useEffect(() => {
    if (conveniosIniciales && !searchParams.toString()) {
      setConveniosData(conveniosIniciales);
    } else {
      cargarConvenios();
    }
  }, [searchParams]);

  // Cargar observaciones cuando se pasa a esa pestaña o cambian sus filtros
  useEffect(() => {
    if (subpestania === 'observaciones') {
      cargarObservaciones();
    }
  }, [subpestania, textoObs, tipoObs, estadoObs, paginaObs, tamanoObs]);

  const manejarCambioPestania = (nuevaPestania: string) => {
    setSubpestania(nuevaPestania);
    const params = new URLSearchParams(searchParams.toString());
    params.set('subtab', nuevaPestania);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const manejarCambioPaginaConvenios = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nuevaPagina.toString());
    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const manejarCambioTamanoConvenios = (nuevoTamano: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', nuevoTamano.toString());
    params.set('page', '0');
    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal Dinámico y Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground">
            {subpestania === 'actuales'
              ? 'Gestión de Convenios Institucionales'
              : 'Sugerencias y Observaciones de Convenios'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {subpestania === 'actuales'
              ? 'Aquí podrá gestionar los convenios institucionales para prácticas preprofesionales.'
              : 'Bandeja de propuestas de nuevos convenios y solicitudes de anulación para el Subdecanato.'}
          </p>
        </div>

        <Tabs
          value={subpestania}
          onValueChange={manejarCambioPestania}
          className="w-full sm:w-auto min-w-0"
        >
          <TabsList className="bg-muted/60 p-1 sm:p-1.5 w-full sm:w-auto grid grid-cols-2 h-auto border border-border/60 min-w-0 rounded-xl gap-1">
            <TabsTrigger
              value="actuales"
              aria-label="Convenios actuales"
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold py-2 px-2.5 sm:px-3 text-center min-w-0 rounded-lg"
              title="Convenios actuales"
            >
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Convenios actuales</span>
                <span className="sm:hidden">Convenios</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="observaciones"
              aria-label="Observaciones y trámites"
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold py-2 px-2.5 sm:px-3 text-center min-w-0 rounded-lg"
              title="Sugerencias"
            >
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Sugerencias</span>
                <span className="sm:hidden">Sugerencias</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido Pestaña 1: Convenios Actuales */}
      {subpestania === 'actuales' && (
        <div className="space-y-4">
          <FiltrosConvenios
            esSubdecano={esSubdecano}
          />

          <TablaConvenios
            convenios={conveniosData.content}
            totalPaginas={conveniosData.totalPages}
            totalElementos={conveniosData.totalElements}
            paginaActual={conveniosData.number}
            elementosPorPagina={conveniosData.size}
            esSubdecano={esSubdecano}
            estaCargando={estaPendiente}
            alVerDetalle={(c) => setConvenioADetalle(c)}
            alEditar={(c) => {
              setConvenioAEditar(c);
              setModalFormularioAbierto(true);
            }}
            alEliminar={(c) => setConvenioAEliminar(c)}
            alSugerirAnulacion={(c) => {
              setConvenioAAnular(c);
              setModalSugerirAbierto(true);
            }}
            alAbrirNuevoConvenio={() => {
              setConvenioAEditar(null);
              setModalFormularioAbierto(true);
            }}
            alAbrirSugerirConvenio={() => {
              setConvenioAAnular(null);
              setModalSugerirAbierto(true);
            }}
            onCambioPagina={manejarCambioPaginaConvenios}
            onCambioElementosPorPagina={manejarCambioTamanoConvenios}
          />
        </div>
      )}

      {/* Contenido Pestaña 2: Observaciones y Tramites */}
      {subpestania === 'observaciones' && (
        <TablaObservacionesConvenio
          observaciones={observacionesData.content}
          totalPaginas={observacionesData.totalPages}
          totalElementos={observacionesData.totalElements}
          paginaActual={paginaObs}
          elementosPorPagina={tamanoObs}
          esSubdecano={esSubdecano}
          filtroTexto={textoObs}
          filtroTipo={tipoObs}
          filtroEstado={estadoObs}
          onCambioFiltroTexto={(txt) => {
            setTextoObs(txt);
            setPaginaObs(0);
          }}
          onCambioFiltroTipo={(t) => {
            setTipoObs(t);
            setPaginaObs(0);
          }}
          onCambioFiltroEstado={(e) => {
            setEstadoObs(e);
            setPaginaObs(0);
          }}
          onCambioPagina={setPaginaObs}
          onCambioElementosPorPagina={(tam) => {
            setTamanoObs(tam);
            setPaginaObs(0);
          }}
          alProcesarExitoso={() => {
            cargarObservaciones();
            cargarConvenios();
          }}
        />
      )}

      {/* Modales Compartidos */}
      <ModalFormularioConvenio
        abierto={modalFormularioAbierto}
        alCerrar={() => setModalFormularioAbierto(false)}
        convenioAEditar={convenioAEditar}
        alGuardarExitoso={() => {
          cargarConvenios();
        }}
      />

      <ModalDetalleConvenio
        convenio={convenioADetalle}
        abierto={Boolean(convenioADetalle)}
        alCerrar={() => setConvenioADetalle(null)}
      />

      <ModalSugerirConvenio
        abierto={modalSugerirAbierto}
        alCerrar={() => setModalSugerirAbierto(false)}
        usuarioId={usuarioId}
        convenioAAnular={convenioAAnular}
        alExito={() => {
          cargarObservaciones();
        }}
      />

      <ModalEliminarConvenio
        convenio={convenioAEliminar}
        abierto={Boolean(convenioAEliminar)}
        alCerrar={() => setConvenioAEliminar(null)}
        alExito={() => {
          cargarConvenios();
        }}
      />
    </div>
  );
}
