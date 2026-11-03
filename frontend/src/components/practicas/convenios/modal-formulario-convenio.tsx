'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { esquemaConvenio, FormularioConvenio } from '@/lib/esquemas/pp/convenio.esquema';
import { crearConvenioAccion, actualizarConvenioAccion } from '@/lib/acciones/pp/convenio.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { cn } from '@/lib/utils';
import { validarFechas } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, FileText, CheckCircle2, X, Eye, Trash2 } from 'lucide-react';

export interface ModalFormularioConvenioProps {
  abierto: boolean;
  alCerrar: () => void;
  convenioAEditar?: ConvenioDto | null;
  alGuardarExitoso?: () => void;
}

export function ModalFormularioConvenio({
  abierto,
  alCerrar,
  convenioAEditar,
  alGuardarExitoso,
}: ModalFormularioConvenioProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [fechaInicioVal, setFechaInicioVal] = useState<string>('');
  const [fechaFinVal, setFechaFinVal] = useState<string>('');
  const [archivoConvenio, setArchivoConvenio] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [quitarDocumentoActual, setQuitarDocumentoActual] = useState(false);
  const referenciaInputArchivo = useRef<HTMLInputElement>(null);

  const validarPdfConvenio = (f: File): boolean => {
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      toast.error('Formato no permitido. Solo se aceptan documentos en formato PDF.');
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('El documento no debe superar los 10 MB.');
      return false;
    }
    return true;
  };

  const esEdicion = Boolean(convenioAEditar?.id);

  useEffect(() => {
    if (abierto) {
      setErrores({});
      setArchivoConvenio(null);
      setQuitarDocumentoActual(false);
      if (convenioAEditar) {
        setFechaInicioVal(convenioAEditar.fechaInicio || '');
        setFechaFinVal(convenioAEditar.fechaFin || '');
      } else {
        setFechaInicioVal('');
        setFechaFinVal('');
      }
    }
  }, [abierto, convenioAEditar]);

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrores({});

    const formData = new FormData(e.currentTarget);
    const fechaInicio = (formData.get('fechaInicio') as string) || '';
    const fechaFin = (formData.get('fechaFin') as string) || '';

    const errorFecha = validarFechas(fechaInicio, fechaFin);
    if (errorFecha) {
      toast.error(errorFecha);
      setErrores((prev) => ({ ...prev, fechaFin: errorFecha }));
      return;
    }

    iniciarTransicion(async () => {
      try {
        const urlDocOriginal = convenioAEditar?.urlDocumento || convenioAEditar?.documentoUrl || '';
        let urlDocumento = urlDocOriginal;
        let nombreDocumento = convenioAEditar?.nombreDocumento || '';

        if (archivoConvenio) {
          toast.loading('Subiendo documento de respaldo...', { id: 'subida-doc' });
          urlDocumento = await subirArchivo(archivoConvenio, CARPETAS_ARCHIVOS.CONVENIOS);
          nombreDocumento = archivoConvenio.name;
          toast.dismiss('subida-doc');
        } else if (quitarDocumentoActual) {
          urlDocumento = '';
          nombreDocumento = '';
        }

        const cuposRaw = formData.get('cuposTotales');
        const campoEspecificoRaw = formData.get('campoEspecifico');
        const cuerpoConvenio = {
          institucion: (formData.get('institucion') as string) || '',
          tipo: (formData.get('tipo') as 'PUBLICO' | 'PRIVADO') || 'PUBLICO',
          campoEspecifico: campoEspecificoRaw !== null ? String(campoEspecificoRaw) : '',
          fechaInicio,
          fechaFin,
          tutorInstitucional: (formData.get('tutorInstitucional') as string) || '',
          correoTutor: (formData.get('correoTutor') as string) || '',
          telefonoTutor: (formData.get('telefonoTutor') as string) || '',
          direccion: (formData.get('direccion') as string) || '',
          cuposTotales: cuposRaw !== null ? String(cuposRaw) : '',
          estado: (formData.get('estado') as any) || (convenioAEditar?.estado || 'ACTIVO'),
          urlDocumento,
          nombreDocumento,
        };

        const validacionZod = esquemaConvenio.safeParse(cuerpoConvenio);
        if (!validacionZod.success) {
          const nuevosErrores: Record<string, string> = {};
          validacionZod.error.errors.forEach((err) => {
            const campo = err.path[0]?.toString() || 'general';
            nuevosErrores[campo] = err.message;
          });
          setErrores(nuevosErrores);
          toast.error(validacionZod.error.errors[0]?.message || 'Verifique los campos ingresados');
          return;
        }

        if (esEdicion && convenioAEditar?.id) {
          const respuesta = await actualizarConvenioAccion(
            Number(convenioAEditar.id),
            validacionZod.data
          );
          if (!respuesta.exito) {
            toast.error(respuesta.mensaje);
            return;
          }
          toast.success('Convenio actualizado exitosamente');
        } else {
          const respuesta = await crearConvenioAccion(validacionZod.data);
          if (!respuesta.exito) {
            toast.error(respuesta.mensaje);
            return;
          }
          toast.success('Convenio registrado exitosamente');
        }

        alCerrar();
        if (alGuardarExitoso) {
          alGuardarExitoso();
        }
      } catch (error: any) {
        console.error('Error al guardar convenio:', error);
        toast.error(error?.message || 'Error inesperado al procesar la solicitud');
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && !estaPendiente && alCerrar()}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {esEdicion ? 'Editar Convenio Institucional' : 'Nuevo Convenio Institucional'}
          </DialogTitle>
          <DialogDescription>
            Gestión administrativa de entidades receptoras de prácticas preprofesionales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={manejarEnvio} noValidate className="space-y-4 py-2 w-full min-w-0">
          {/* Institucion */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="institucion">Nombre de la Institución / Empresa *</Label>
            <Input
              id="institucion"
              name="institucion"
              defaultValue={convenioAEditar?.institucion || ''}
              placeholder="Ej: Ministerio de Telecomunicaciones"
              required
            />
            {errores.institucion && (
              <p className="text-xs text-destructive">{errores.institucion}</p>
            )}
          </div>

          {/* Tipo y Cupos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="tipo">Tipo de Institución *</Label>
              <Select name="tipo" defaultValue={convenioAEditar?.tipo || 'PUBLICO'}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLICO">Público</SelectItem>
                  <SelectItem value="PRIVADO">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="cuposTotales">Cupos Totales *</Label>
              <Input
                id="cuposTotales"
                name="cuposTotales"
                type="number"
                min="0"
                max="1000"
                step="1"
                onKeyDown={(e) => {
                  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                defaultValue={convenioAEditar?.cuposTotales ?? 5}
                required
              />
              {errores.cuposTotales && (
                <p className="text-xs text-destructive">{errores.cuposTotales}</p>
              )}
            </div>
          </div>

          {/* Campo especifico y Estado (si edita) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="campoEspecifico">Campo Específico (CACES) *</Label>
              <Input
                id="campoEspecifico"
                name="campoEspecifico"
                type="number"
                step="0.01"
                min="0"
                onKeyDown={(e) => {
                  if (['e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                defaultValue={convenioAEditar?.campoEspecifico || 1.0}
                required
              />
              {errores.campoEspecifico && (
                <p className="text-xs text-destructive">{errores.campoEspecifico}</p>
              )}
            </div>

            {esEdicion ? (
              <div className="space-y-1.5">
                <Label htmlFor="estado">Estado del Convenio</Label>
                <Select name="estado" defaultValue={convenioAEditar?.estado || 'ACTIVO'}>
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="POR_EXPIRAR">Por Vencer</SelectItem>
                    <SelectItem value="EXPIRADO">Vencido</SelectItem>
                    <SelectItem value="ANULADO">Anulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="direccion">Dirección Física *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  defaultValue={convenioAEditar?.direccion || ''}
                  placeholder="Ej: Av. Universitaria y Gato Sobral"
                  required
                />
              </div>
            )}
          </div>

          {/* Fechas Inicio y Fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
              <Input
                id="fechaInicio"
                name="fechaInicio"
                type="date"
                value={fechaInicioVal}
                onChange={(e) => setFechaInicioVal(e.target.value)}
                required
              />
              {errores.fechaInicio && (
                <p className="text-xs text-destructive">{errores.fechaInicio}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaFin">Fecha de Expiración *</Label>
              <Input
                id="fechaFin"
                name="fechaFin"
                type="date"
                value={fechaFinVal}
                min={fechaInicioVal || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFechaFinVal(e.target.value)}
                required
              />
              {errores.fechaFin && (
                <p className="text-xs text-destructive">{errores.fechaFin}</p>
              )}
            </div>
          </div>

          {/* Tutor Institucional */}
          <div className="space-y-1.5">
            <Label htmlFor="tutorInstitucional">Responsable / Tutor Institucional *</Label>
            <Input
              id="tutorInstitucional"
              name="tutorInstitucional"
              defaultValue={convenioAEditar?.tutorInstitucional || ''}
              placeholder="Ej: Ana María Morales"
              required
            />
            {errores.tutorInstitucional && (
              <p className="text-xs text-destructive">{errores.tutorInstitucional}</p>
            )}
          </div>

          {/* Correo y Telefono Tutor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="correoTutor">Correo de Contacto *</Label>
              <Input
                id="correoTutor"
                name="correoTutor"
                type="email"
                defaultValue={convenioAEditar?.correoTutor || ''}
                placeholder="contacto@institucion.gob.ec"
                required
              />
              {errores.correoTutor && (
                <p className="text-xs text-destructive">{errores.correoTutor}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefonoTutor">Teléfono de Contacto</Label>
              <Input
                id="telefonoTutor"
                name="telefonoTutor"
                defaultValue={convenioAEditar?.telefonoTutor || ''}
                placeholder="0991234567"
              />
            </div>
          </div>

          {esEdicion && (
            <div className="space-y-1.5">
              <Label htmlFor="direccion">Dirección Física *</Label>
              <Input
                id="direccion"
                name="direccion"
                defaultValue={convenioAEditar?.direccion || ''}
                placeholder="Ej: Av. Universitaria y Gato Sobral"
                required
              />
              {errores.direccion && (
                <p className="text-xs text-destructive">{errores.direccion}</p>
              )}
            </div>
          )}

          {/* Documento PDF adjunto */}
          <div className="space-y-2 pt-2 border-t border-border w-full min-w-0">
            <Label>Documento del Convenio (Formato PDF)</Label>
            {(() => {
              const urlDocExistente = convenioAEditar?.urlDocumento || convenioAEditar?.documentoUrl;
              const nombreDocExistente = convenioAEditar?.nombreDocumento || 'Documento adjunto';

              if (urlDocExistente && !quitarDocumentoActual) {
                return (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40 w-full min-w-0 gap-3 overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate block max-w-full" title={nombreDocExistente}>
                        {nombreDocExistente}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <BotonPrevisualizarDocumento
                        url={adaptarUrlProxy(urlDocExistente)}
                        titulo={`Documento de Convenio - ${convenioAEditar?.institucion || 'Institución'}`}
                        nombreArchivo={nombreDocExistente}
                        texto="Ver"
                        variante="ghost"
                        tamano="sm"
                        className="h-8 text-xs font-semibold"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs font-semibold"
                        onClick={() => {
                          setQuitarDocumentoActual(true);
                          setArchivoConvenio(null);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Quitar
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    ref={referenciaInputArchivo}
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];
                      if (archivo && validarPdfConvenio(archivo)) {
                        setArchivoConvenio(archivo);
                        toast.success(`Documento preparado: ${archivo.name}`);
                      }
                    }}
                  />
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none',
                      arrastrando
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 scale-[1.01]'
                        : archivoConvenio
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border hover:border-emerald-500/50 hover:bg-muted/30'
                    )}
                    onClick={() => !archivoConvenio && referenciaInputArchivo.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!archivoConvenio) {
                        setArrastrando(true);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      setArrastrando(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setArrastrando(false);
                      if (!archivoConvenio && e.dataTransfer.files?.[0]) {
                        const archivoSoltado = e.dataTransfer.files[0];
                        if (validarPdfConvenio(archivoSoltado)) {
                          setArchivoConvenio(archivoSoltado);
                          toast.success(`Documento preparado: ${archivoSoltado.name}`);
                        }
                      }
                    }}
                  >
                    {archivoConvenio ? (
                      <div className="flex items-center justify-between w-full min-w-0 gap-2 text-emerald-600 dark:text-emerald-400 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-medium truncate block max-w-full" title={archivoConvenio.name}>
                            {archivoConvenio.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchivoConvenio(null);
                            if (referenciaInputArchivo.current) {
                              referenciaInputArchivo.current.value = '';
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload
                          className={cn(
                            'w-6 h-6 mb-1.5 transition-all',
                            arrastrando ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-muted-foreground opacity-70'
                          )}
                        />
                        <p className="font-medium text-xs text-foreground">
                          {arrastrando ? 'Suelte el archivo PDF aquí' : 'Haga clic o arrastre el archivo PDF aquí'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Máximo 10 MB (solo .pdf)</p>
                      </>
                    )}
                  </div>

                  {urlDocExistente && quitarDocumentoActual && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuitarDocumentoActual(false)}
                      className="text-xs h-7 self-start"
                    >
                      Restaurar documento original
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={alCerrar}
              disabled={estaPendiente}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={estaPendiente}>
              {estaPendiente ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : esEdicion ? (
                'Guardar Cambios'
              ) : (
                'Registrar Convenio'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
