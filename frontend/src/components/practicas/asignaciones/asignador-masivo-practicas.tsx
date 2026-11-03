'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioDto, ConvenioDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { asignarEstudiantesPracticasMasivoAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { ColumnaEstudiantesAsignacion } from './columna-estudiantes-asignacion';
import { ColumnaConveniosAsignacion } from './columna-convenios-asignacion';
import { ColumnaTutoresAsignacion } from './columna-tutores-asignacion';
import { ModalResumenAsignacionPractica } from './modal-resumen-asignacion-practica';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AsignadorMasivoPracticasProps {
  estudiantes: UsuarioDto[];
  convenios: ConvenioDto[];
  tutores: TutorResumenDto[];
  periodoAcademicoId: number;
  carreraId?: number;
  horasMaximasCarrera?: number;
  opcionesHoras?: number[];
}

export function AsignadorMasivoPracticas({
  estudiantes,
  convenios,
  tutores,
  periodoAcademicoId,
  horasMaximasCarrera = 240,
  opcionesHoras = [80, 160, 240],
}: AsignadorMasivoPracticasProps) {
  const router = useRouter();
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);
  const [convenioSeleccionado, setConvenioSeleccionado] = useState<number | null>(null);
  const [tutorSeleccionado, setTutorSeleccionado] = useState<number | null>(null);
  const [horas, setHoras] = useState<number>(opcionesHoras[0] || 80);
  const [modalResumenAbierto, setModalResumenAbierto] = useState(false);
  const [estaPendiente, empezarTransicion] = useTransition();

  // Limitar horas según estudiantes seleccionados
  const estudiantesMarcados = useMemo(
    () => estudiantes.filter((est) => estudiantesSeleccionados.includes(Number(est.id))),
    [estudiantes, estudiantesSeleccionados]
  );

  const horasPendientes = useMemo(() => {
    return estudiantesMarcados.map((est) => {
      const req = est.horasRequeridas || horasMaximasCarrera;
      const comp = est.horasAcumuladas || 0;
      return Math.max(1, req - comp);
    });
  }, [estudiantesMarcados, horasMaximasCarrera]);

  const maximoHoras = horasPendientes.length > 0 ? Math.min(...horasPendientes) : (horasMaximasCarrera || 240);

  const alternarEstudiante = (id: number) => {
    setEstudiantesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const alternarTodos = (idsVisibles: number[]) => {
    const todosVisiblesSeleccionados = idsVisibles.every((id) =>
      estudiantesSeleccionados.includes(id)
    );

    if (todosVisiblesSeleccionados) {
      setEstudiantesSeleccionados((prev) =>
        prev.filter((id) => !idsVisibles.includes(id))
      );
    } else {
      setEstudiantesSeleccionados((prev) =>
        Array.from(new Set([...prev, ...idsVisibles]))
      );
    }
  };

  const convenioSeleccionadoObj = useMemo(
    () => convenios.find((c) => Number(c.id) === convenioSeleccionado),
    [convenios, convenioSeleccionado]
  );

  const tutorSeleccionadoObj = useMemo(
    () => tutores.find((t) => Number(t.id) === tutorSeleccionado),
    [tutores, tutorSeleccionado]
  );

  const estudiantesSeleccionadosObjs = useMemo(
    () => estudiantes.filter((e) => estudiantesSeleccionados.includes(Number(e.id))),
    [estudiantes, estudiantesSeleccionados]
  );

  const validarYConfirmar = () => {
    if (estudiantesSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un estudiante.');
      return;
    }
    if (!convenioSeleccionado || !convenioSeleccionadoObj) {
      toast.error('Debe seleccionar un convenio/empresa.');
      return;
    }
    if (!tutorSeleccionado || !tutorSeleccionadoObj) {
      toast.error('Debe seleccionar un tutor académico.');
      return;
    }

    if (!Number.isInteger(horas) || horas <= 0) {
      toast.error('Las horas a asignar deben ser un número entero mayor a 0.');
      return;
    }

    if (horas > maximoHoras) {
      toast.error(`Las horas a asignar no pueden superar el máximo permitido (${maximoHoras}h).`);
      return;
    }

    // Validación de cupos de convenio
    const ocupados = convenioSeleccionadoObj.ocupados || 0;
    const cuposTotales = convenioSeleccionadoObj.cuposTotales ?? convenioSeleccionadoObj.cuposDisponibles ?? 0;
    const disponibles = cuposTotales - ocupados;
    if (estudiantesSeleccionados.length > disponibles) {
      toast.error(
        `El convenio solo tiene ${disponibles} cupos disponibles. Ha seleccionado ${estudiantesSeleccionados.length} estudiantes.`
      );
      return;
    }

    // Validación de carga de tutor (máximo 10)
    const cargaActual = tutorSeleccionadoObj.estudiantesAsignados || 0;
    if (cargaActual + estudiantesSeleccionados.length > 10) {
      toast.error(
        `El tutor seleccionado solo puede aceptar ${10 - cargaActual} estudiantes más. Ha seleccionado ${estudiantesSeleccionados.length} estudiantes.`
      );
      return;
    }

    setModalResumenAbierto(true);
  };

  const manejarEjecucionAsignacion = () => {
    if (!convenioSeleccionado || !tutorSeleccionado || estudiantesSeleccionados.length === 0) {
      return;
    }

    empezarTransicion(async () => {
      const respuesta = await asignarEstudiantesPracticasMasivoAccion({
        estudianteIds: estudiantesSeleccionados,
        convenioId: convenioSeleccionado,
        tutorAcademicoId: tutorSeleccionado,
        periodoAcademicoId,
        horasAsignadas: horas,
      });

      if (respuesta.exito) {
        toast.success(respuesta.mensaje);
        setEstudiantesSeleccionados([]);
        setConvenioSeleccionado(null);
        setTutorSeleccionado(null);
        setModalResumenAbierto(false);
        router.refresh();
      } else {
        toast.error(respuesta.mensaje || 'Error al procesar la asignación masiva');
      }
    });
  };

  const botonDeshabilitado =
    estudiantesSeleccionados.length === 0 ||
    !convenioSeleccionado ||
    !tutorSeleccionado ||
    estaPendiente;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Estudiantes */}
        <ColumnaEstudiantesAsignacion
          estudiantes={estudiantes}
          estudiantesSeleccionados={estudiantesSeleccionados}
          alAlternarEstudiante={alternarEstudiante}
          alAlternarTodos={alternarTodos}
          horasMaximasCarrera={horasMaximasCarrera}
        />

        {/* Columna 2: Convenios */}
        <ColumnaConveniosAsignacion
          convenios={convenios}
          convenioSeleccionado={convenioSeleccionado}
          alSeleccionarConvenio={setConvenioSeleccionado}
          estudiantesSeleccionadosCount={estudiantesSeleccionados.length}
        />

        {/* Columna 3: Tutores */}
        <ColumnaTutoresAsignacion
          tutores={tutores}
          tutorSeleccionado={tutorSeleccionado}
          alSeleccionarTutor={setTutorSeleccionado}
          estudiantesSeleccionadosCount={estudiantesSeleccionados.length}
        />
      </div>

      {/* Barra Inferior de Acción y Selector de Horas (Idéntico a VCS) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
              Horas a asignar:
            </span>
            <Input
              type="number"
              step={1}
              min={1}
              max={maximoHoras}
              value={horas || ''}
              onKeyDown={(e) => {
                if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const valor = e.target.value;
                if (valor === '') {
                  setHoras(0);
                  return;
                }
                const num = Number(valor);
                if (!isNaN(num)) {
                  setHoras(num);
                }
              }}
              className={`w-20 sm:w-24 text-center font-bold h-9 text-sm ${
                horas > maximoHoras || horas <= 0
                  ? 'border-destructive text-destructive focus-visible:ring-destructive'
                  : ''
              }`}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            (Máximo permitido: {maximoHoras}h)
          </span>
        </div>

        <Button
          size="default"
          onClick={validarYConfirmar}
          disabled={
            botonDeshabilitado ||
            horas <= 0 ||
            horas > maximoHoras
          }
          className="w-full sm:w-auto h-10 font-semibold shrink-0"
        >
          Confirmar Asignación ({estudiantesSeleccionados.length})
        </Button>
      </div>

      {/* Modal de Resumen y Confirmación */}
      <ModalResumenAsignacionPractica
        abierto={modalResumenAbierto}
        alCerrar={() => setModalResumenAbierto(false)}
        alConfirmar={manejarEjecucionAsignacion}
        estaPendiente={estaPendiente}
        convenio={convenioSeleccionadoObj}
        tutor={tutorSeleccionadoObj}
        estudiantes={estudiantesSeleccionadosObjs}
        horasAsignadas={horas}
      />
    </div>
  );
}
