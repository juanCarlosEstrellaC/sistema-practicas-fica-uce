'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { ConvenioDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { obtenerConveniosAccion } from '@/lib/acciones/pp/convenio.acciones';
import { obtenerTutoresResumenAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { esquemaActualizarAsignacionPractica } from '@/lib/esquemas/pp/asignacion-practica.esquema';

export interface ModalEditarAsignacionPracticaProps {
  asignacion: any | null;
  onClose: () => void;
  onSave: (
    id: string,
    datos: {
      convenioId?: number;
      tutorId?: number;
      horas?: number;
    }
  ) => Promise<void>;
  conveniosIniciales?: ConvenioDto[];
  tutoresIniciales?: TutorResumenDto[];
  periodosIniciales?: any[];
}

export function ModalEditarAsignacionPractica({
  asignacion,
  onClose,
  onSave,
  conveniosIniciales,
  tutoresIniciales,
}: ModalEditarAsignacionPracticaProps) {
  const [convenioId, setConvenioId] = useState<string>('');
  const [tutorId, setTutorId] = useState<string>('');
  const [horas, setHoras] = useState<string>('240');
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [errorHoras, setErrorHoras] = useState<string | null>(null);

  const [convenios, setConvenios] = useState<ConvenioDto[]>(conveniosIniciales || []);
  const [tutores, setTutores] = useState<TutorResumenDto[]>(tutoresIniciales || []);

  const carreraId = asignacion?.asignacion?.carreraId
    ? parseInt(String(asignacion.asignacion.carreraId))
    : undefined;

  const periodoId = asignacion?.asignacion?.periodoAcademicoId
    ? Number(asignacion.asignacion.periodoAcademicoId)
    : undefined;

  // Datos del estudiante para tarjeta visual
  const nombreEstudiante =
    asignacion?.estudiante?.nombre ||
    `${asignacion?.estudiante?.nombres || ''} ${asignacion?.estudiante?.apellidos || ''}`.trim() ||
    'el estudiante';

  const identificacionEstudiante =
    asignacion?.estudiante?.identificacion ||
    asignacion?.asignacion?.estudiante?.identificacion ||
    '';

  const correoEstudiante =
    asignacion?.estudiante?.correo ||
    asignacion?.asignacion?.estudiante?.correo ||
    '';

  const carreraEstudiante =
    asignacion?.estudiante?.carrera ||
    asignacion?.asignacion?.estudiante?.carreraNombre ||
    asignacion?.asignacion?.carreraNombre ||
    '';

  const urlFotoEstudiante =
    asignacion?.estudiante?.urlAvatar ||
    asignacion?.asignacion?.estudiante?.urlAvatar ||
    '';

  const horasCompletadas = Math.max(
    0,
    Number(asignacion?.horasCompletadas ?? asignacion?.asignacion?.horasCompletadas ?? 0)
  );

  const horasRequeridas = Number(
    asignacion?.horasRequeridas ??
      asignacion?.asignacion?.horasRequeridas ??
      asignacion?.estudiante?.horasRequeridas ??
      asignacion?.carrera?.horasPractica ??
      240
  );

  const horasAcumuladas = Math.max(
    0,
    Number(asignacion?.horasAcumuladas ?? asignacion?.asignacion?.horasAcumuladas ?? 0)
  );

  const maximoHorasDisponibles = Math.max(1, horasRequeridas - horasAcumuladas);
  const minimoHoras = Math.max(1, horasCompletadas);

  const numeroHorasActual = Number(horas) || 0;
  const horasTotalesProyectadas = horasAcumuladas + numeroHorasActual;
  const porcentajeAvance = Math.min(
    100,
    Math.round((horasTotalesProyectadas / (horasRequeridas || 240)) * 100)
  );

  const validarHoras = (valor: string): string | null => {
    if (!valor || valor.trim() === '') {
      return 'Las horas asignadas son obligatorias';
    }
    const num = Number(valor);
    if (Number.isNaN(num) || !Number.isInteger(num)) {
      return 'Las horas deben ser un número entero válido';
    }
    if (num < 1) {
      return 'Las horas asignadas deben ser mayores a 0';
    }
    if (horasCompletadas > 0 && num < horasCompletadas) {
      return `Las horas asignadas no pueden ser menores a las horas ya completadas (${horasCompletadas}h)`;
    }
    if (num > maximoHorasDisponibles) {
      return `El estudiante solo puede recibir hasta ${maximoHorasDisponibles} horas en esta asignación`;
    }
    return null;
  };

  useEffect(() => {
    if (!asignacion) return;

    setConvenioId(asignacion.convenio?.id ? String(asignacion.convenio.id) : '');
    setTutorId(asignacion.tutor?.id ? String(asignacion.tutor.id) : '');
    const horasIniciales = asignacion.horasAsignadas ? String(asignacion.horasAsignadas) : '240';
    setHoras(horasIniciales);
    setErrorHoras(null);
  }, [asignacion]);

  // Cargar catálogos de convenios y tutores vía Server Actions si no vienen por props
  useEffect(() => {
    if (!asignacion) return;

    let cancelado = false;
    const cargarCatalogos = async () => {
      try {
        const promesas: Promise<any>[] = [];

        if (!conveniosIniciales) {
          promesas.push(
            obtenerConveniosAccion({ estado: 'ACTIVO', size: 100 }).then((res) => {
              if (!cancelado) setConvenios(res.content);
            })
          );
        }

        if (!tutoresIniciales) {
          promesas.push(
            obtenerTutoresResumenAccion(carreraId, periodoId).then((res) => {
              if (!cancelado) setTutores(res);
            })
          );
        }

        await Promise.all(promesas);
      } catch (error) {
        console.error('Error al cargar catálogos para editar asignación:', error);
      }
    };

    cargarCatalogos();

    return () => {
      cancelado = true;
    };
  }, [asignacion, carreraId, periodoId, conveniosIniciales, tutoresIniciales]);

  const manejarGuardar = async () => {
    if (!asignacion) return;

    const error = validarHoras(horas);
    if (error) {
      setErrorHoras(error);
      toast.error(error);
      return;
    }

    const validacion = esquemaActualizarAsignacionPractica.safeParse({
      convenioId: convenioId || undefined,
      tutorId: tutorId || null,
      horas: horas,
    });

    if (!validacion.success) {
      toast.error(validacion.error.errors[0]?.message || 'Verifique los campos ingresados');
      return;
    }

    setEstaEnviando(true);
    try {
      await onSave(String(asignacion.id), {
        convenioId: validacion.data.convenioId,
        tutorId: validacion.data.tutorId ?? undefined,
        horas: validacion.data.horas,
      });
      onClose();
    } catch (e) {
      console.error('Error al guardar edición de asignación:', e);
    } finally {
      setEstaEnviando(false);
    }
  };

  if (!asignacion) return null;

  return (
    <Dialog open={Boolean(asignacion)} onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Actualizar Asignación</DialogTitle>
          <DialogDescription>
            Modifique los detalles de la asignación del estudiante{' '}
            <strong className="text-foreground">{nombreEstudiante}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Tarjeta modular con datos del estudiante y avance proyectado (Idéntica a VCS) */}
        <div className="my-2 rounded-xl border border-border bg-muted/40 p-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <AvatarUsuario
                nombre={nombreEstudiante}
                urlFoto={urlFotoEstudiante}
                tamano="md"
              />
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">
                  {nombreEstudiante}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                  {identificacionEstudiante && <span>C.I: {identificacionEstudiante}</span>}
                  {correoEstudiante && <span>{correoEstudiante}</span>}
                </div>
              </div>
            </div>
            {carreraEstudiante && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                {carreraEstudiante}
              </span>
            )}
          </div>

          {/* Barra de progreso y resumen de horas */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Avance proyectado:</span>
                <strong className="text-foreground font-semibold">
                  {horasTotalesProyectadas}h de {horasRequeridas}h
                </strong>
              </span>
              <span className="font-semibold text-primary">{porcentajeAvance}%</span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Horas acumuladas previas: <strong className="text-foreground">{horasAcumuladas}h</strong> | Máximo asignable: <strong className="text-foreground">{maximoHorasDisponibles}h</strong>
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Convenio Institucional</Label>
            <Select value={convenioId} onValueChange={setConvenioId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un convenio" />
              </SelectTrigger>
              <SelectContent>
                {convenios.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.institucion} ({c.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tutor Académico</Label>
            <Select value={tutorId} onValueChange={setTutorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un tutor académico" />
              </SelectTrigger>
              <SelectContent>
                {tutores.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombres} {t.apellidos} - Carga: {t.estudiantesAsignados || 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-horas-asignadas">Horas Asignadas</Label>
              <span className="text-xs text-muted-foreground">
                Máx. permitido: <strong className="text-foreground">{maximoHorasDisponibles}h</strong>
                {horasCompletadas > 0 && (
                  <span>
                    {' '}
                    · Mín. completadas: <strong className="text-foreground">{horasCompletadas}h</strong>
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="input-horas-asignadas"
                type="number"
                min={minimoHoras}
                max={maximoHorasDisponibles}
                step={1}
                value={horas}
                onKeyDown={(e) => {
                  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const nuevoValor = e.target.value;
                  setHoras(nuevoValor);
                  setErrorHoras(validarHoras(nuevoValor));
                }}
                className={`w-full ${errorHoras ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                required
              />
              <span className="text-sm text-muted-foreground font-medium shrink-0">
                horas
              </span>
            </div>
            {errorHoras && (
              <p className="text-xs text-destructive font-medium">{errorHoras}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={estaEnviando}>
            Cancelar
          </Button>
          <Button onClick={manejarGuardar} disabled={estaEnviando || Boolean(errorHoras)}>
            {estaEnviando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export compatible con el nombre anterior
export { ModalEditarAsignacionPractica as DialogoEditarAsignacion };
