"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Send,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { BadgeEstadoMatrizCaces } from './badge-estado-matriz-caces';
import { TablaMatrizCaces } from './tabla-matriz-caces';
import { ModalObservacionesCaces } from './modal-observaciones-caces';
import { ModalSubirMatrizFirmada } from './modal-subir-matriz-firmada';
import {
  crearOActualizarMatrizCacesAccion,
  cambiarEstadoMatrizCacesAccion,
  obtenerMatrizPorPeriodoYCarreraAccion,
} from '@/lib/acciones/pp/matriz-caces.acciones';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { MatrizCacesDto, EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';
import { normalizarRol } from '@/lib/seguridad/permisos';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { formatearNombreDescargaMatrizCaces } from '@/lib/utilidades/matriz-caces';
import { toast } from 'sonner';

interface VistaMatrizCacesCarreraProps {
  rol: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS' | string;
  carreraId: number | string;
  carreraNombre?: string;
  carreraCodigo?: string;
  carreraCiudad?: string;
  codigoIes?: string;
  periodoId: number | string;
  periodoNombre?: string;
  esInactivo?: boolean;
  matrizInicial?: MatrizCacesDto | null;
  alVolver?: () => void;
}

export function VistaMatrizCacesCarrera({
  rol,
  carreraId,
  carreraNombre,
  carreraCodigo,
  carreraCiudad = 'Quito',
  codigoIes = '1005',
  periodoId,
  periodoNombre,
  esInactivo = false,
  matrizInicial = null,
  alVolver,
}: VistaMatrizCacesCarreraProps) {
  const [matriz, setMatriz] = useState<MatrizCacesDto | null>(matrizInicial);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [pagina, setPagina] = useState(0);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Modales
  const [modalObservacionesAbierto, setModalObservacionesAbierto] = useState(false);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [nuevoEstadoFirma, setNuevoEstadoFirma] = useState<EstadoMatrizCaces>('FIRMADA_POR_DC');

  const rolNormalizado = normalizarRol(rol);
  const esCoordinador = rolNormalizado === 'COORDINADOR_PRACTICAS';
  const esDirector = rolNormalizado === 'DIRECTOR_CARRERA';
  const esSubdecano = rolNormalizado === 'SUBDECANO';

  const estadoActual = matriz?.estado || 'PENDIENTE';
  const tieneObservaciones = Boolean(matriz?.observacion);
  const esEditable =
    esCoordinador && !esInactivo && (estadoActual === 'PENDIENTE' || estadoActual === 'RECHAZADA');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Cargar matriz específica
      let matrizActual = await obtenerMatrizPorPeriodoYCarreraAccion(periodoId, carreraId);

      // Si aún no existe registro consolidado en la base de datos para la carrera y periodo,
      // se inicializa automáticamente para Coordinador de Prácticas
      if (!matrizActual && esCoordinador && !esInactivo) {
        const resCrear = await crearOActualizarMatrizCacesAccion(periodoId, carreraId);
        if (resCrear.exito && resCrear.data) {
          matrizActual = resCrear.data;
        }
      }

      setMatriz(matrizActual);

      // 2. Cargar asignaciones de la carrera y periodo
      const resAsignaciones = await obtenerAsignacionesPracticasAccion({
        carreraId: Number(carreraId),
        periodoId: Number(periodoId),
        page: pagina,
        size: elementosPorPagina,
      });

      setAsignaciones(resAsignaciones.content || []);
      setTotalPaginas(resAsignaciones.totalPages || 0);
      setTotalElementos(resAsignaciones.totalElements || 0);
    } catch (error) {
      console.error('Error al cargar datos de la matriz CACES:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [carreraId, periodoId, pagina, elementosPorPagina, rolNormalizado]);

  const manejarEnviarEstado = async (
    nuevoEstado: EstadoMatrizCaces,
    mensajeExito: string,
    observacionEnvio?: string
  ) => {
    if (!matriz?.id) return;
    try {
      const res = await cambiarEstadoMatrizCacesAccion(matriz.id, nuevoEstado, observacionEnvio);
      if (res.exito) {
        toast.success(mensajeExito);
        await cargarDatos();
      } else {
        toast.error(res.mensaje || 'Error al actualizar estado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado');
    }
  };

  const abrirSubidaFirma = (estado: EstadoMatrizCaces) => {
    setNuevoEstadoFirma(estado);
    setModalFirmaAbierto(true);
  };

  const puedeDescargarDirector =
    estadoActual === 'ENVIADA_A_DC' || estadoActual === 'FIRMADA_POR_SUBDECANO';
  const mostrarBotonDescarga = Boolean(matriz?.id && (!esDirector || puedeDescargarDirector));
  const tieneArchivoFirmado = Boolean(matriz?.archivoFirmadoUrl);
  const urlDescargaMatriz = `/api/proxy/matrices-caces/${matriz?.id}/excel?t=${tieneArchivoFirmado ? encodeURIComponent(matriz!.archivoFirmadoUrl!) : 'base'}`;
  const nombreArchivoDescarga = formatearNombreDescargaMatrizCaces(
    carreraNombre || matriz?.carreraNombre,
    periodoNombre || matriz?.periodoNombre,
    estadoActual,
    matriz?.archivoFirmadoUrl
  );

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <CabeceraListado
        titulo={`Matriz CACES ${carreraNombre ? `- ${carreraNombre}` : ''}`}
        total={totalElementos}
        etiquetaTotal="Estudiantes en matriz"
        metricasExtra={
          <div className="flex flex-wrap items-center gap-1.5">
            <BadgeEstadoMatrizCaces estado={estadoActual} />
          </div>
        }
        accion={
          <div className="flex flex-wrap items-center gap-2">
            {alVolver && (
              <Button variant="outline" size="sm" onClick={alVolver}>
                Volver al listado
              </Button>
            )}

            {/* Descargar Excel oficial o matriz firmada en curso */}
            {mostrarBotonDescarga && (
              <a
                href={urlDescargaMatriz}
                download={nombreArchivoDescarga}
                className="inline-flex"
                title={tieneArchivoFirmado ? 'Descargar matriz firmada en curso' : 'Descargar plantilla oficial Excel'}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300 shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 group"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  {tieneArchivoFirmado ? 'Descargar Matriz Firmada' : 'Descargar Excel'}
                </Button>
              </a>
            )}

            {/* Flujo de Coordinador: Envío a Dirección o Devolución con correcciones */}
            {esCoordinador && !esInactivo && (estadoActual === 'PENDIENTE' || estadoActual === 'RECHAZADA') && (
              <Button
                size="sm"
                className="gap-1.5 shadow-xs"
                disabled={cargando || !matriz?.id}
                onClick={() =>
                  manejarEnviarEstado(
                    'ENVIADA_A_DC',
                    tieneObservaciones
                      ? 'Matriz CACES corregida remitida a Dirección de Carrera con éxito.'
                      : 'Matriz CACES remitida a Dirección de Carrera con éxito.'
                  )
                }
              >
                <Send className="w-4 h-4 mr-1.5" />
                {tieneObservaciones ? 'Devolver Matriz Corregida' : 'Enviar a Dirección'}
              </Button>
            )}

            {/* Flujo de Coordinador: Firmar y remitir a Subdecanato tras firma de DC */}
            {esCoordinador && !esInactivo && estadoActual === 'FIRMADA_POR_DC' && (
              <Button
                size="sm"
                className="gap-1.5 shadow-xs"
                onClick={() => abrirSubidaFirma('ENVIADA_A_SUBDECANO')}
              >
                <UploadCloud className="w-4 h-4 mr-1.5" />
                Firmar y Remitir a Subdecanato
              </Button>
            )}

            {/* Flujo de Director de Carrera: Firmar y Subir o Devolver */}
            {esDirector && !esInactivo && estadoActual === 'ENVIADA_A_DC' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setModalObservacionesAbierto(true)}
                >
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  Devolver con observaciones
                </Button>
                <Button
                  size="sm"
                  onClick={() => abrirSubidaFirma('FIRMADA_POR_DC')}
                >
                  <UploadCloud className="w-4 h-4 mr-1.5" />
                  Subir Firma y Validar
                </Button>
              </>
            )}

            {/* Flujo de Subdecano: Oficializar y Firmar Final */}
            {esSubdecano && !esInactivo && estadoActual === 'ENVIADA_A_SUBDECANO' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => abrirSubidaFirma('FIRMADA_POR_SUBDECANO')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Oficializar y Subir Firma
              </Button>
            )}
          </div>
        }
      />

      {/* Banner de Observaciones Registradas cuando la matriz es devuelta */}
      {matriz?.observacion && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-foreground shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-destructive">
                  Observaciones registradas en la matriz:
                </h4>
                {esCoordinador && !esInactivo && (
                  <Badge
                    variant="outline"
                    className="text-xs border-destructive/40 text-destructive bg-destructive/10 font-medium"
                  >
                    Corrección habilitada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {matriz.observacion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Modular de Asignaciones con cabecera CACES y columnas actualizadas */}
      <TablaMatrizCaces
        asignaciones={asignaciones}
        totalPaginas={totalPaginas}
        paginaActual={pagina}
        elementosPorPagina={elementosPorPagina}
        alCambiarPagina={setPagina}
        alCambiarElementosPorPagina={setElementosPorPagina}
        cargando={cargando}
        esEditable={esEditable}
        alActualizarDatos={cargarDatos}
        codigoIes={codigoIes}
        codigoCarrera={carreraCodigo}
        ciudadCarrera={carreraCiudad}
      />

      {/* Modales de Interacción */}
      {matriz?.id && (
        <>
          {esDirector && (
            <ModalObservacionesCaces
              abierto={modalObservacionesAbierto}
              alCerrar={() => setModalObservacionesAbierto(false)}
              matrizId={matriz.id}
              rolUsuario={rolNormalizado as any}
              alCompletar={cargarDatos}
            />
          )}
          <ModalSubirMatrizFirmada
            abierto={modalFirmaAbierto}
            alCerrar={() => setModalFirmaAbierto(false)}
            matrizId={matriz.id}
            nuevoEstado={nuevoEstadoFirma}
            carreraNombre={carreraNombre}
            carreraCodigo={carreraCodigo}
            periodoNombre={periodoNombre || matriz.periodoNombre}
            rolUsuario={rolNormalizado as any}
            archivoPrevioUrl={matriz.archivoFirmadoUrl}
            alCompletar={cargarDatos}
          />
        </>
      )}
    </div>
  );
}
