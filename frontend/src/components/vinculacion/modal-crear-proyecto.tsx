'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  esquemaProyectoComunitario,
  FormularioProyectoComunitario,
} from '@/lib/esquemas/vcs/proyecto-comunitario.esquema';
import {
  crearProyectoComunitarioAccion,
  actualizarProyectoComunitarioAccion,
} from '@/lib/acciones/vcs/proyecto-comunitario.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { cn } from '@/lib/utils';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, FileText, CheckCircle2, X, Trash2 } from 'lucide-react';

interface ModalCrearProyectoProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  proyectoAEditar?: ProyectoComunitarioDto | null;
  carreras: CarreraDto[];
}

export function ModalCrearProyecto({ abierto, abrirModal, proyectoAEditar, carreras }: ModalCrearProyectoProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();
  const esEdicion = Boolean(proyectoAEditar);

  const [archivoProyecto, setArchivoProyecto] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [quitarDocumentoActual, setQuitarDocumentoActual] = useState(false);
  const referenciaInputArchivo = useRef<HTMLInputElement>(null);

  const validarPdfProyecto = (f: File): boolean => {
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormularioProyectoComunitario>({
    resolver: zodResolver(esquemaProyectoComunitario),
    defaultValues: {
      nombre: '',
      descripcion: '',
      carreraId: carreras[0]?.id ? Number(carreras[0].id) : undefined,
      estado: 'ACTIVO',
      fechaInicio: '',
      fechaFin: '',
    },
  });

  const valorCarreraId = watch('carreraId');
  const valorEstado = watch('estado');

  useEffect(() => {
    if (abierto) {
      setArchivoProyecto(null);
      setQuitarDocumentoActual(false);
      if (proyectoAEditar) {
        reset({
          nombre: proyectoAEditar.nombre,
          descripcion: proyectoAEditar.descripcion || '',
          carreraId: proyectoAEditar.carreraId,
          estado: proyectoAEditar.estado,
          fechaInicio: proyectoAEditar.fechaInicio || '',
          fechaFin: proyectoAEditar.fechaFin || '',
        });
      } else {
        reset({
          nombre: '',
          descripcion: '',
          carreraId: carreras[0]?.id ? Number(carreras[0].id) : undefined,
          estado: 'ACTIVO',
          fechaInicio: '',
          fechaFin: '',
        });
      }
    }
  }, [abierto, proyectoAEditar, carreras, reset]);

  const enviarDatos = (datos: FormularioProyectoComunitario) => {
    iniciarTransicion(async () => {
      try {
        const urlDocOriginal = proyectoAEditar?.urlDocumento || '';
        const esUrlPreview = /^(\/api\/proxy)?\/proyectos-comunitarios\/\d+\/(preview|descargar)(\?.*)?$/.test(
          urlDocOriginal
        );
        let urlDocumento: string | undefined = esUrlPreview ? undefined : urlDocOriginal;
        let nombreDocumento: string | undefined = proyectoAEditar?.nombreDocumento || undefined;

        if (archivoProyecto) {
          toast.loading('Subiendo documento del proyecto...', { id: 'subida-doc-proyecto' });
          urlDocumento = await subirArchivo(archivoProyecto, CARPETAS_ARCHIVOS.VINCULACION);
          nombreDocumento = archivoProyecto.name;
          toast.dismiss('subida-doc-proyecto');
        } else if (quitarDocumentoActual) {
          urlDocumento = '';
          nombreDocumento = '';
        }

        if (esEdicion && proyectoAEditar) {
          const respuesta = await actualizarProyectoComunitarioAccion(proyectoAEditar.id, {
            ...datos,
            urlDocumento,
            nombreDocumento,
          });
          if (respuesta.exito) {
            toast.success(respuesta.mensaje);
            abrirModal(false);
          } else {
            toast.error(respuesta.mensaje);
          }
        } else {
          const respuesta = await crearProyectoComunitarioAccion({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            carreraId: datos.carreraId,
            fechaInicio: datos.fechaInicio || undefined,
            fechaFin: datos.fechaFin || undefined,
            urlDocumento: urlDocumento || undefined,
            nombreDocumento: nombreDocumento || undefined,
          });
          if (respuesta.exito) {
            toast.success(respuesta.mensaje);
            abrirModal(false);
          } else {
            toast.error(respuesta.mensaje);
          }
        }
      } catch (error: any) {
        toast.dismiss('subida-doc-proyecto');
        console.error('Error al guardar proyecto:', error);
        toast.error(error?.message || 'Error inesperado al procesar la solicitud');
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !estaPendiente && abrirModal(ab)}>
      <DialogContent className="sm:max-w-[560px] w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar Proyecto Comunitario' : 'Nuevo Proyecto Comunitario'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifique los campos del proyecto comunitario seleccionado.'
              : 'Complete la información para dar de alta un nuevo proyecto de vinculación.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(enviarDatos)} className="space-y-4 py-2 w-full min-w-0">
          {/* Nombre */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej. Alfabetización Digital Comunitaria"
              {...register('nombre')}
              disabled={estaPendiente}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Carrera */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="carreraId" className="text-sm font-semibold">
              Carrera <span className="text-destructive">*</span>
            </Label>
            <Select
              value={valorCarreraId ? valorCarreraId.toString() : ''}
              onValueChange={(valor) => setValue('carreraId', Number(valor), { shouldValidate: true })}
              disabled={estaPendiente}
            >
              <SelectTrigger id="carreraId">
                <SelectValue placeholder="Seleccione una carrera" />
              </SelectTrigger>
              <SelectContent>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id.toString()}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carreraId && (
              <p className="text-xs text-destructive">{errors.carreraId.message}</p>
            )}
          </div>

          {/* Estado (Solo visible en edición) */}
          {esEdicion && (
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="estado" className="text-sm font-semibold">
                Estado del Proyecto
              </Label>
              <Select
                value={valorEstado}
                onValueChange={(valor: any) => setValue('estado', valor, { shouldValidate: true })}
                disabled={estaPendiente}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-xs text-destructive">{errors.estado.message}</p>
              )}
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fechaInicio" className="text-sm font-semibold">
                Fecha de Inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                {...register('fechaInicio')}
                disabled={estaPendiente}
              />
              {errors.fechaInicio && (
                <p className="text-xs text-destructive">{errors.fechaInicio.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaFin" className="text-sm font-semibold">
                Fecha de Finalización
              </Label>
              <Input
                id="fechaFin"
                type="date"
                {...register('fechaFin')}
                disabled={estaPendiente}
              />
              {errors.fechaFin && (
                <p className="text-xs text-destructive">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="descripcion" className="text-sm font-semibold">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              rows={3}
              placeholder="Detalles sobre las actividades, objetivos o alcance del proyecto..."
              {...register('descripcion')}
              disabled={estaPendiente}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Documento PDF adjunto */}
          <div className="space-y-2 pt-2 border-t border-border w-full min-w-0">
            <Label className="text-sm font-semibold">Documento del Proyecto (Formato PDF)</Label>
            {(() => {
              const urlOriginal = proyectoAEditar?.urlDocumento;
              const urlDocExistente = urlOriginal
                ? (proyectoAEditar?.id ? `/proyectos-comunitarios/${proyectoAEditar.id}/preview` : urlOriginal)
                : undefined;
              const nombreDocExistente = proyectoAEditar?.nombreDocumento || 'Documento adjunto';
              const nombreArchivoPreview = nombreDocExistente.toLowerCase().endsWith('.pdf')
                ? nombreDocExistente
                : `${nombreDocExistente}.pdf`;

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
                        titulo={`Documento de Proyecto - ${proyectoAEditar?.nombre || 'Proyecto'}`}
                        subtitulo="Documento oficial de Vinculación con la Sociedad • Universidad Central del Ecuador"
                        nombreArchivo={nombreArchivoPreview}
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
                          setArchivoProyecto(null);
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
                      if (archivo && validarPdfProyecto(archivo)) {
                        setArchivoProyecto(archivo);
                        toast.success(`Documento preparado: ${archivo.name}`);
                      }
                    }}
                  />
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none',
                      arrastrando
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 scale-[1.01]'
                        : archivoProyecto
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border hover:border-emerald-500/50 hover:bg-muted/30'
                    )}
                    onClick={() => !archivoProyecto && referenciaInputArchivo.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!archivoProyecto) {
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
                      if (!archivoProyecto && e.dataTransfer.files?.[0]) {
                        const archivoSoltado = e.dataTransfer.files[0];
                        if (validarPdfProyecto(archivoSoltado)) {
                          setArchivoProyecto(archivoSoltado);
                          toast.success(`Documento preparado: ${archivoSoltado.name}`);
                        }
                      }
                    }}
                  >
                    {archivoProyecto ? (
                      <div className="flex items-center justify-between w-full min-w-0 gap-2 text-emerald-600 dark:text-emerald-400 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-medium truncate block max-w-full" title={archivoProyecto.name}>
                            {archivoProyecto.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchivoProyecto(null);
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

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => abrirModal(false)}
              disabled={estaPendiente}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={estaPendiente}>
              {estaPendiente ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : esEdicion ? (
                'Guardar Cambios'
              ) : (
                'Crear Proyecto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
