'use client';

import { useState, useEffect, useRef } from 'react';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { EvidenciaVcs, TipoDocumentoVcs } from '@/lib/tipos/vcs/evidencia-vcs';
import { BadgeEstadoAsignacion } from '@/components/vinculacion/badge-estado-asignacion';
import { BadgeFaseAsignacion } from '@/components/vinculacion/badge-fase-asignacion';
import { BarraProgresoVcs } from '@/components/vinculacion/barra-progreso-vcs';
import { subirEvidenciaAccion, obtenerEvidenciasPorAsignacionAccion } from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderGit2,
  Calendar,
  UserCheck,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Eye,
  Lock,
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
  GraduationCap,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface VistaProyectoEstudianteProps {
  asignaciones: AsignacionProyectoDto[];
  evidenciasInicialesPorAsignacion?: Record<number, EvidenciaVcs[]>;
  periodosInactivosIds?: number[];
}

export function VistaProyectoEstudiante({
  asignaciones,
  evidenciasInicialesPorAsignacion = {},
  periodosInactivosIds = [],
}: VistaProyectoEstudianteProps) {
  // Estado de colapso de cada proyecto (el primer proyecto expandido por defecto)
  const [proyectosColapsados, setProyectosColapsados] = useState<Record<number, boolean>>(() => {
    const estadoInicial: Record<number, boolean> = {};
    asignaciones.forEach((asig, index) => {
      // El primero abierto (false), los siguientes colapsados (true)
      estadoInicial[asig.id] = index !== 0;
    });
    return estadoInicial;
  });

  // Mapa de evidencias por asignacionId
  const [evidenciasPorAsig, setEvidenciasPorAsig] = useState<Record<number, EvidenciaVcs[]>>(
    evidenciasInicialesPorAsignacion
  );

  // Estados de subida y archivos
  const [subiendoDoc, setSubiendoDoc] = useState<Record<string, boolean>>({});
  const referenciasInput = useRef<Record<string, HTMLInputElement | null>>({});

  const alternarColapso = (id: number) => {
    setProyectosColapsados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const manejarDescarga = async (e: React.MouseEvent, url: string, nombreArchivo: string) => {
    e.preventDefault();
    e.stopPropagation();
    const urlFinal = adaptarUrlProxy(url);
    try {
      const respuesta = await fetch(urlFinal);
      if (!respuesta.ok) throw new Error('Error al descargar');
      const blob = await respuesta.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(enlace);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      window.open(urlFinal, '_blank');
    }
  };

  const manejarSubirArchivoDirecto = async (
    asig: AsignacionProyectoDto,
    tipo: TipoDocumentoVcs,
    archivo: File
  ) => {
    if (archivo.type !== 'application/pdf') {
      toast.error('El archivo debe ser un documento en formato PDF');
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido es de 10 MB');
      return;
    }

    const claveCarga = `${asig.id}_${tipo}`;
    setSubiendoDoc((prev) => ({ ...prev, [claveCarga]: true }));

    try {
      // 1. Subir archivo físico
      const urlArchivo = await subirArchivo(archivo, CARPETAS_ARCHIVOS.VINCULACION);
      if (!urlArchivo) {
        throw new Error('No se pudo obtener la URL del archivo');
      }

      // 2. Guardar registro en backend de vinculación
      const etiquetaDoc = tipo === 'BITACORA' ? 'Bitácora de Actividades' : 'Informe Final';
      const nombreFinal = `${etiquetaDoc} - ${archivo.name}`;

      const res = await subirEvidenciaAccion({
        asignacionId: asig.id,
        tipoDocumento: tipo,
        urlArchivo,
        nombreArchivo: nombreFinal,
        horasReportadas: asig.horasAsignadas || 0,
      });

      if (res.exito && res.data) {
        toast.success(res.mensaje || `${etiquetaDoc} subida correctamente`);
        const evidenciaNueva = res.data as EvidenciaVcs;

        setEvidenciasPorAsig((prev) => {
          const listaActual = prev[asig.id] || [];
          const index = listaActual.findIndex((e) => e.tipoDocumento === tipo);
          if (index >= 0) {
            const copia = [...listaActual];
            copia[index] = evidenciaNueva;
            return { ...prev, [asig.id]: copia };
          }
          return { ...prev, [asig.id]: [evidenciaNueva, ...listaActual] };
        });
      } else {
        toast.error(res.mensaje || 'Error al registrar la evidencia');
      }
    } catch (err: any) {
      console.error('Error subiendo evidencia:', err);
      toast.error(err.message || 'Error al procesar la subida del documento');
    } finally {
      setSubiendoDoc((prev) => ({ ...prev, [claveCarga]: false }));
    }
  };

  if (asignaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
        <FolderGit2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-bold text-foreground">No tienes proyectos comunitarios asignados</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          Aún no cuentas con asignaciones registradas en proyectos comunitarios de vinculación con la sociedad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {asignaciones.map((asig, indice) => {
        const estaColapsado = proyectosColapsados[asig.id] ?? false;
        const evidenciasProyecto = evidenciasPorAsig[asig.id] || [];
        const bitacora = evidenciasProyecto.find((e) => e.tipoDocumento === 'BITACORA');
        const informeFinal = evidenciasProyecto.find((e) => e.tipoDocumento === 'INFORME_FINAL');

        const esPeriodoInactivo = periodosInactivosIds.includes(Number(asig.periodoAcademicoId));
        const esAsignacionCerrada = asig.estado === 'REPROBADO' || asig.estado === 'CANCELADO';
        const bloqueoCargaPeriodo = esPeriodoInactivo || esAsignacionCerrada;

        const esAprobado = asig.estado === 'APROBADO';
        const esFinalizacion = asig.faseActual === 'FINALIZACION';
        const horasValidadas = esAprobado
          ? (asig.horasCompletadas || asig.horasAsignadas || 0)
          : 0;
        const esCompletado = esAprobado;

        const certificadoDesbloqueado =
          esAprobado && (asig.documentosValidados || Boolean(asig.urlCertificado));

        const tituloHoras = esAprobado
          ? 'Horas Aprobadas'
          : esFinalizacion
          ? 'Horas en Validación'
          : 'Horas Registradas';

        const subtituloHoras = esAprobado
          ? 'Acreditadas por Subdecanato'
          : esFinalizacion
          ? asig.documentosValidados
            ? 'Validadas por Tutor • Esperando Certificado'
            : 'En revisión por Tutor • Certificado pendiente'
          : asig.faseActual === 'DESARROLLO'
          ? 'En desarrollo de actividades'
          : 'Pendiente inicio de vinculación';

        const numeroProyecto = asignaciones.length - indice;

        return (
          <Card
            key={asig.id}
            className="border-border shadow-xs overflow-hidden transition-all duration-200 p-0 py-0 gap-0"
          >
            {/* Cabecera del Proyecto (Colapsable) */}
            <div
              onClick={() => alternarColapso(asig.id)}
              className={cn(
                "p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 select-none transition-colors",
                !estaColapsado ? "border-b border-border/60" : "border-b-0"
              )}
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Proyecto #{numeroProyecto}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Periodo: {asig.nombrePeriodoAcademico}
                  </span>
                  <BadgeEstadoAsignacion estado={asig.estado} />
                  <BadgeFaseAsignacion fase={asig.faseActual} />
                </div>

                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {asig.nombreProyecto}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    <span>
                      <strong className="text-foreground">Tutor:</strong>{' '}
                      {asig.nombreCompletoTutor || 'Por asignar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      <strong className="text-foreground">Inicio:</strong>{' '}
                      {formatearFechaCorta(asig.fechaInicio)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      <strong className="text-foreground">Horas:</strong>{' '}
                      {esAprobado
                        ? `${horasValidadas} / ${asig.horasAsignadas}h`
                        : esFinalizacion
                        ? `${horasValidadas} / ${asig.horasAsignadas}h (en validación)`
                        : `${horasValidadas} / ${asig.horasAsignadas}h`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de alternar colapso */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {estaColapsado ? (
                    <>
                      <span>Ver detalles</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Ocultar</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Contenido Expandido del Proyecto */}
            {!estaColapsado && (
              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* 1. Línea de Progreso del Proceso */}
                <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Línea de Progreso del Proceso
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Fase actual: {asig.faseActual}
                    </span>
                  </div>
                  <BarraProgresoVcs faseActual={asig.faseActual} finalizado={esCompletado} />
                </div>

                {/* 2. Métricas y Datos del Proyecto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Horas Asignadas</span>
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-black text-foreground mt-2">{asig.horasAsignadas}h</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Meta para este proyecto</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">{tituloHoras}</span>
                      {esAprobado ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock
                          className={cn(
                            'h-4 w-4',
                            esFinalizacion
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-sky-600 dark:text-sky-400'
                          )}
                        />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-2xl font-black mt-2',
                        esAprobado
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : esFinalizacion
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-foreground'
                      )}
                    >
                      {horasValidadas}h
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{subtituloHoras}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Tutor Académico</span>
                      <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <p className="text-sm font-bold text-foreground mt-2 truncate">
                      {asig.nombreCompletoTutor || 'Por asignar'}
                    </p>
                    {asig.correoTutor && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {asig.correoTutor}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Portafolio de Evidencias Integrado (Lógica PP) */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1 border-b border-border pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Portafolio de Evidencias y Documentos
                      </h3>

                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suba su bitácora de actividades y el informe final en formato PDF (se requieren ambos para pasar a la fase de Finalización). Tras la validación de su tutor académico, Subdecanato emitirá el certificado de horas.
                    </p>
                  </div>

                  {/* Lista de Documentos del Portafolio */}
                  <div className="space-y-3">
                    {/* DOCUMENTO 1: BITÁCORA */}
                    <ItemDocumentoPortafolio
                      titulo="1. Bitácora de Actividades"
                      descripcion="Registro detallado y cronológico de actividades comunitarias y firmas de asistencia en formato PDF."
                      evidencia={bitacora}
                      tipo="BITACORA"
                      estaSubiendo={subiendoDoc[`${asig.id}_BITACORA`] ?? false}
                      deshabilitadoPorFase={asig.faseActual === 'ASIGNACION'}
                      deshabilitadoPorPeriodoInactivo={bloqueoCargaPeriodo}
                      alSeleccionarArchivo={(archivo) =>
                        manejarSubirArchivoDirecto(asig, 'BITACORA', archivo)
                      }
                      alDescargar={(e) =>
                        bitacora &&
                        manejarDescarga(
                          e,
                          bitacora.id ? `/evidencias-vcs/${bitacora.id}/descargar` : bitacora.urlArchivo,
                          bitacora.nombreArchivo || 'Bitacora.pdf'
                        )
                      }
                      referenciaInput={(el) => (referenciasInput.current[`${asig.id}_BITACORA`] = el)}
                    />

                    {/* DOCUMENTO 2: INFORME FINAL */}
                    <ItemDocumentoPortafolio
                      titulo="2. Informe Final de Vinculación"
                      descripcion="Informe técnico consolidado de resultados, beneficiarios y conclusiones del proyecto en formato PDF."
                      evidencia={informeFinal}
                      tipo="INFORME_FINAL"
                      estaSubiendo={subiendoDoc[`${asig.id}_INFORME_FINAL`] ?? false}
                      deshabilitadoPorFase={asig.faseActual === 'ASIGNACION'}
                      deshabilitadoPorPeriodoInactivo={bloqueoCargaPeriodo}
                      alSeleccionarArchivo={(archivo) =>
                        manejarSubirArchivoDirecto(asig, 'INFORME_FINAL', archivo)
                      }
                      alDescargar={(e) =>
                        informeFinal &&
                        manejarDescarga(
                          e,
                          informeFinal.id
                            ? `/evidencias-vcs/${informeFinal.id}/descargar`
                            : informeFinal.urlArchivo,
                          informeFinal.nombreArchivo || 'Informe_Final.pdf'
                        )
                      }
                      referenciaInput={(el) =>
                        (referenciasInput.current[`${asig.id}_INFORME_FINAL`] = el)
                      }
                    />

                    {/* DOCUMENTO 3 / RESULTADO: CERTIFICADO DE SUBDECANATO */}
                    <div
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200',
                        certificadoDesbloqueado
                          ? 'bg-card border-border'
                          : 'bg-muted/30 border-dashed border-border text-muted-foreground'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                              certificadoDesbloqueado
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {certificadoDesbloqueado ? (
                              <Award className="h-5 w-5" />
                            ) : (
                              <Lock className="h-5 w-5 opacity-60" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">
                                3. Certificado Oficial de Acreditación de Horas de Vinculación con la Sociedad
                              </span>
                              {certificadoDesbloqueado ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold shrink-0 whitespace-nowrap"
                                >
                                  Emitido
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  Bloqueado
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {certificadoDesbloqueado
                                ? `Subdecanato ha aprobado oficialmente el cumplimiento de las ${horasValidadas} horas reglamentarias para este proyecto comunitario.`
                                : 'Se desbloqueará automáticamente una vez que el Subdecanato valide y apruebe las evidencias revisadas por su Tutor Académico.'}
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción del certificado */}
                        {certificadoDesbloqueado && (
                          <div className="flex items-center gap-2 shrink-0">
                            {(() => {
                              const nombreEstudiante = asig.nombreCompletoEstudiante || 'Estudiante';
                              const nombreCarrera = asig.nombreCarrera || 'Carrera';
                              const nombreCertificado = `${nombreEstudiante} - Certificado VCS.pdf`;
                              const urlCert = asig.id
                                ? `/api/proxy/asignaciones-proyectos-comunitarios/${asig.id}/certificado-horas/preview`
                                : (asig.urlCertificado || '');

                              return (
                                <>
                                  <BotonPrevisualizarDocumento
                                    titulo={`Certificado de Vinculación - ${asig.nombreProyecto}`}
                                    subtitulo="Documento oficial de Vinculación con la Sociedad • Universidad Central del Ecuador"
                                    url={urlCert}
                                    nombreArchivo={nombreCertificado}
                                    texto="Ver Certificado"
                                  />

                                  <Button
                                    size="sm"
                                    className="h-8 text-xs gap-1.5 shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={(e) =>
                                      manejarDescarga(
                                        e,
                                        urlCert,
                                        nombreCertificado
                                      )
                                    }
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Descargar
                                  </Button>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Subcomponente de Item individual de documento del portafolio (Bitácora o Informe Final)
 */
interface ItemDocumentoPortafolioProps {
  titulo: string;
  descripcion: string;
  evidencia?: EvidenciaVcs;
  tipo: TipoDocumentoVcs;
  estaSubiendo: boolean;
  deshabilitadoPorFase?: boolean;
  deshabilitadoPorPeriodoInactivo?: boolean;
  alSeleccionarArchivo: (archivo: File) => void;
  alDescargar: (e: React.MouseEvent) => void;
  referenciaInput: (el: HTMLInputElement | null) => void;
}

function ItemDocumentoPortafolio({
  titulo,
  descripcion,
  evidencia,
  tipo,
  estaSubiendo,
  deshabilitadoPorFase = false,
  deshabilitadoPorPeriodoInactivo = false,
  alSeleccionarArchivo,
  alDescargar,
  referenciaInput,
}: ItemDocumentoPortafolioProps) {
  const tieneArchivo = Boolean(evidencia?.urlArchivo);
  const estadoTutor = evidencia?.estadoTutor;
  const esAprobado = estadoTutor === 'APROBADO';
  const esRechazado = estadoTutor === 'OBSERVADO';
  const esPendienteRevision = tieneArchivo && (!estadoTutor || estadoTutor === 'PENDIENTE');

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Información del documento */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              esAprobado
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : esRechazado
                ? 'bg-destructive/10 text-destructive'
                : tieneArchivo
                ? 'bg-sky-500/10 text-sky-600'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">{titulo}</span>

              {/* Badge de Estado del Documento */}
              {!tieneArchivo && !deshabilitadoPorFase && !deshabilitadoPorPeriodoInactivo && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Pendiente de entrega
                </Badge>
              )}
              {!tieneArchivo && deshabilitadoPorPeriodoInactivo && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                  <Lock className="h-2.5 w-2.5 mr-1 opacity-70" />
                  Periodo cerrado
                </Badge>
              )}
              {!tieneArchivo && !deshabilitadoPorPeriodoInactivo && deshabilitadoPorFase && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                  <Lock className="h-2.5 w-2.5 mr-1 opacity-70" />
                  No disponible (Fase Asignación)
                </Badge>
              )}
              {esPendienteRevision && (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] font-bold shrink-0 whitespace-nowrap"
                >
                  En Revisión por Tutor
                </Badge>
              )}
              {esAprobado && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold shrink-0 whitespace-nowrap"
                >
                  Aprobado
                </Badge>
              )}
              {esRechazado && (
                <Badge
                  variant="secondary"
                  className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold shrink-0 whitespace-nowrap"
                >
                  Con Observaciones
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{descripcion}</p>

            {evidencia?.fechaSubida && (
              <p className="text-[11px] text-muted-foreground pt-0.5">
                Subido el: {formatearFechaCorta(evidencia.fechaSubida)}
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Input oculto para subida de archivo */}
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            ref={referenciaInput}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                alSeleccionarArchivo(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          {tieneArchivo && (
            <>
              <BotonPrevisualizarDocumento
                titulo={titulo}
                subtitulo="Documento oficial de Vinculación con la Sociedad • Universidad Central del Ecuador"
                url={evidencia?.id ? `/evidencias-vcs/${evidencia.id}/preview` : evidencia?.urlArchivo}
                nombreArchivo={`${tipo.toLowerCase()}.pdf`}
                texto="Ver"
              />

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 shadow-2xs"
                onClick={alDescargar}
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </Button>
            </>
          )}

          {/* Botón de subir solo si no tiene archivo, o resubir únicamente si está OBSERVADO */}
          {!esAprobado && !deshabilitadoPorPeriodoInactivo && (
            deshabilitadoPorFase ? (
              <Button
                size="sm"
                disabled
                className="h-8 text-xs gap-1.5 bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                title="La subida se habilitará cuando su Tutor Académico inicie el proyecto (Fase de Desarrollo)"
              >
                <Lock className="h-3.5 w-3.5" />
                Subir Archivo
              </Button>
            ) : !tieneArchivo ? (
              <Button
                size="sm"
                disabled={estaSubiendo}
                className="h-8 text-xs gap-1.5 shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <label className="cursor-pointer">
                  {estaSubiendo ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Subir Archivo
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        alSeleccionarArchivo(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </Button>
            ) : esRechazado ? (
              <Button
                size="sm"
                disabled={estaSubiendo}
                variant="destructive"
                className="h-8 text-xs gap-1.5 shadow-2xs"
                asChild
              >
                <label className="cursor-pointer">
                  {estaSubiendo ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Corregir y Resubir
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        alSeleccionarArchivo(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </Button>
            ) : null
          )}
        </div>
      </div>

      {/* Alerta si tiene observaciones del tutor */}
      {esRechazado && evidencia?.observacionesTutor && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Observación del Tutor Académico:</span>
          </div>
          <p className="text-foreground pl-5 leading-relaxed">{evidencia.observacionesTutor}</p>
        </div>
      )}
    </div>
  );
}
