'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle2, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  iniciarDesarrolloAccion,
  firmarRegistroAccion,
} from '@/lib/acciones/pp/asignacion-practica.acciones';

export interface AccionesTutorAcademicoProps {
  estudianteSeleccionado: string;
  datosEstudianteSeleccionado: any;
  esInactivo?: boolean;
  alActualizar?: () => void;
}

export function AccionesTutorAcademico({
  estudianteSeleccionado,
  datosEstudianteSeleccionado,
  esInactivo = false,
  alActualizar,
}: AccionesTutorAcademicoProps) {
  const router = useRouter();
  const [reunionConfirmada, setReunionConfirmada] = useState<boolean>(false);
  const [modalDocumentosAbierto, setModalDocumentosAbierto] = useState<boolean>(false);
  const [fechaFinPracticas, setFechaFinPracticas] = useState<string>('');
  const [estaPendiente, empezarTransicion] = useTransition();

  const [archivosCargados, setArchivosCargados] = useState<{
    seguimiento?: File;
    informeFinal?: File;
    certificado?: File;
  }>({});
  const [arrastrandoClave, setArrastrandoClave] = useState<'seguimiento' | 'informeFinal' | 'certificado' | null>(null);

  const refInputSeguimiento = useRef<HTMLInputElement>(null);
  const refInputInforme = useRef<HTMLInputElement>(null);
  const refInputCertificado = useRef<HTMLInputElement>(null);

  const esExtensionPermitida = (archivo: File, extensiones: string[]): boolean => {
    const nombre = archivo.name.toLowerCase();
    return extensiones.some((ext) => nombre.endsWith(ext.toLowerCase()));
  };

  const asignacion =
    datosEstudianteSeleccionado?.asignacion || datosEstudianteSeleccionado || {};
  const asignacionId = asignacion.id;
  const faseActual = asignacion.fase;
  const cartaAsignacionEnviada = Boolean(asignacion.cartaAsignacionEnviada);

  if (faseActual === 'ASIGNACION' && !cartaAsignacionEnviada) {
    return null;
  }

  const manejarIniciarDesarrollo = () => {
    if (!asignacionId || !reunionConfirmada) return;

    empezarTransicion(async () => {
      const res = await iniciarDesarrolloAccion(asignacionId);
      if (res.exito) {
        toast.success(res.mensaje);
        alActualizar?.();
        router.refresh();
      } else {
        toast.error(res.mensaje || 'Error al iniciar la fase de desarrollo');
      }
    });
  };

  const manejarEnviarRevision = () => {
    if (!archivosCargados.seguimiento || !archivosCargados.informeFinal || !archivosCargados.certificado) {
      toast.error('Debe cargar los tres documentos requeridos para enviar a revisión.');
      return;
    }

    if (!fechaFinPracticas) {
      toast.error('Debe ingresar la fecha de finalización de prácticas.');
      return;
    }

    // Validación de fecha fin vs fecha inicio
    if (asignacion.fechaInicio) {
      const inicio = new Date(asignacion.fechaInicio);
      const fin = new Date(fechaFinPracticas);
      if (fin < inicio) {
        toast.error('La fecha de finalización no puede ser menor a la fecha de inicio.');
        return;
      }
    }

    empezarTransicion(async () => {
      try {
        const [urlSeguimiento, urlInforme, urlCertificado] = await Promise.all([
          subirArchivo(archivosCargados.seguimiento!, CARPETAS_ARCHIVOS.PORTAFOLIOS),
          subirArchivo(archivosCargados.informeFinal!, CARPETAS_ARCHIVOS.PORTAFOLIOS),
          subirArchivo(archivosCargados.certificado!, CARPETAS_ARCHIVOS.PORTAFOLIOS),
        ]);

        const res = await firmarRegistroAccion(asignacionId, {
          urlInforme,
          urlCertificado,
          urlSeguimiento,
          fechaFin: fechaFinPracticas,
        });

        if (res.exito) {
          toast.success(res.mensaje);
          setModalDocumentosAbierto(false);
          setArchivosCargados({});
          alActualizar?.();
          router.refresh();
        } else {
          toast.error(res.mensaje || 'Error al firmar y enviar el registro');
        }
      } catch (error) {
        console.error('Error al subir archivos o firmar registro:', error);
        toast.error('Ocurrió un error al cargar los documentos de finalización.');
      }
    });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Fase ASIGNACION: Iniciar desarrollo tras reunión (requiere carta emitida) */}
      {faseActual === 'ASIGNACION' && cartaAsignacionEnviada && (
        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
          <p className="text-xs sm:text-sm font-semibold text-foreground">Inicio de Desarrollo</p>
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id={`reunion-${estudianteSeleccionado}`}
              className="mt-1 rounded border-border"
              checked={reunionConfirmada}
              onChange={(e) => setReunionConfirmada(e.target.checked)}
            />
            <Label htmlFor={`reunion-${estudianteSeleccionado}`} className="text-xs sm:text-sm leading-snug cursor-pointer">
              Se realizó la reunión de coordinación y planificación con el tutor institucional.
            </Label>
          </div>
          <Button
            className="w-full font-bold shadow-xs"
            disabled={!reunionConfirmada || esInactivo || estaPendiente}
            onClick={manejarIniciarDesarrollo}
          >
            {estaPendiente ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Desarrollo'
            )}
          </Button>
        </div>
      )}

      {/* Fase DESARROLLO: Cargar documentos de finalización y enviar a revisión */}
      {faseActual === 'DESARROLLO' && (
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => setModalDocumentosAbierto(true)}
            disabled={esInactivo}
          >
            <Upload className="w-4 h-4 mr-2" />
            Cargar Documentos de Finalización
          </Button>

          <Dialog open={modalDocumentosAbierto} onOpenChange={setModalDocumentosAbierto}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cargar Documentos de Finalización</DialogTitle>
                <DialogDescription>
                  Suba los tres documentos requeridos para enviar a revisión del Coordinador de Prácticas.
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 flex flex-col gap-4">
                <div className="bg-muted/40 p-3.5 rounded-lg border border-border">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-1">
                    Fecha de Finalización de Prácticas
                  </h4>
                  <p className="text-[11px] text-muted-foreground mb-2.5">
                    Fecha exacta en que el estudiante culminó sus actividades prácticas.
                  </p>
                  <Input
                    type="date"
                    value={fechaFinPracticas}
                    onChange={(e) => setFechaFinPracticas(e.target.value)}
                    min={asignacion.fechaInicio ? new Date(asignacion.fechaInicio).toISOString().split('T')[0] : undefined}
                    className="h-9"
                  />
                </div>

                {/* Inputs ocultos de archivo */}
                <input
                  type="file"
                  ref={refInputSeguimiento}
                  className="hidden"
                  accept=".pdf,.xlsx,.xls"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setArchivosCargados((prev) => ({ ...prev, seguimiento: f }));
                  }}
                />
                <input
                  type="file"
                  ref={refInputInforme}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setArchivosCargados((prev) => ({ ...prev, informeFinal: f }));
                  }}
                />
                <input
                  type="file"
                  ref={refInputCertificado}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setArchivosCargados((prev) => ({ ...prev, certificado: f }));
                  }}
                />

                {/* Zonas de subida */}
                <div className="space-y-2.5">
                  {[
                    {
                      clave: 'seguimiento' as const,
                      ref: refInputSeguimiento,
                      etiqueta: '1. Registro de Seguimiento / Asistencia',
                      formato: 'PDF, XLSX',
                      extensiones: ['.pdf', '.xlsx', '.xls'],
                    },
                    {
                      clave: 'informeFinal' as const,
                      ref: refInputInforme,
                      etiqueta: '2. Informe Final de Prácticas',
                      formato: 'PDF, DOCX',
                      extensiones: ['.pdf', '.doc', '.docx'],
                    },
                    {
                      clave: 'certificado' as const,
                      ref: refInputCertificado,
                      etiqueta: '3. Certificado de Cumplimiento Institucional',
                      formato: 'PDF, DOCX',
                      extensiones: ['.pdf', '.doc', '.docx'],
                    },
                  ].map((item) => {
                    const archivo = archivosCargados[item.clave];
                    const estaArrastrando = arrastrandoClave === item.clave;

                    return (
                      <div
                        key={item.clave}
                        className={cn(
                          'w-full max-w-full overflow-hidden border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none',
                          estaArrastrando
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]'
                            : archivo
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-border/70 hover:bg-muted/30 hover:border-primary/40'
                        )}
                        onClick={() => !archivo && item.ref.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!archivo) {
                            setArrastrandoClave(item.clave);
                          }
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                          setArrastrandoClave(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setArrastrandoClave(null);
                          if (archivo) return;

                          const archivoSoltado = e.dataTransfer.files?.[0];
                          if (!archivoSoltado) return;

                          if (!esExtensionPermitida(archivoSoltado, item.extensiones)) {
                            toast.error(
                              `Formato no permitido para "${item.etiqueta}". Formatos válidos: ${item.formato}`
                            );
                            return;
                          }

                          setArchivosCargados((prev) => ({ ...prev, [item.clave]: archivoSoltado }));
                          toast.success(`Archivo preparado: ${archivoSoltado.name}`);
                        }}
                      >
                        {archivo ? (
                          <div className="flex items-center justify-between w-full min-w-0 text-foreground gap-2 overflow-hidden">
                            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              <span
                                className="text-xs font-medium truncate min-w-0 flex-1 text-left"
                                title={archivo.name}
                              >
                                {archivo.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                              title="Quitar archivo"
                              aria-label="Quitar archivo"
                              onClick={(e) => {
                                e.stopPropagation();
                                setArchivosCargados((prev) => ({ ...prev, [item.clave]: undefined }));
                                if (item.ref.current) {
                                  item.ref.current.value = '';
                                }
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload
                              className={cn(
                                'w-4 h-4 mb-1 transition-all',
                                estaArrastrando ? 'text-primary scale-110' : 'text-muted-foreground'
                              )}
                            />
                            <p className="font-semibold text-xs text-foreground">{item.etiqueta}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {estaArrastrando ? 'Suelta el archivo aquí' : `Arrastra o haz clic para cargar (${item.formato})`}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalDocumentosAbierto(false)}
                  disabled={estaPendiente}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={
                    !archivosCargados.seguimiento ||
                    !archivosCargados.informeFinal ||
                    !archivosCargados.certificado ||
                    !fechaFinPracticas ||
                    estaPendiente ||
                    esInactivo
                  }
                  onClick={manejarEnviarRevision}
                  className="gap-2"
                >
                  {estaPendiente ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-1.5" />
                      Enviar a Revisión
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
