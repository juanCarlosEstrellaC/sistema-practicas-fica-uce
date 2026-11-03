'use client';

import { EstudianteResumenDto } from "@/lib/tipos/general";
import { ProyectoResumenDto } from "@/lib/tipos/vcs/asignacion-proyecto";
import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Book, CheckCircle2, Search, User } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ModalResumenAsignacion } from './modal-resumen-asignacion';
import { asignarEstudiantesMasivoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { toast } from "sonner";

interface AsignadorMasivoProyectosProps {
    estudiantes: EstudianteResumenDto[];
    proyectosComunitarios: ProyectoResumenDto[];
    periodoAcademicoId: number,
    carreraId: number
}

export function AsignadorMasivoProyectos({ estudiantes, proyectosComunitarios, periodoAcademicoId, carreraId }: AsignadorMasivoProyectosProps) {
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);
    const [horasAsignadas, setHorasAsignadas] = useState<number>(80);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState<string>('');
    const [busquedaProyecto, setBusquedaProyecto] = useState<string>('');
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);
    const [estaPendiente, empezarTransicion] = useTransition();

    console.log('--- DATOS ASIGNACIONES ---');
    console.log('Usuario Sesion CarreraId:', carreraId);
    console.log('Periodo Id:', periodoAcademicoId);
    console.log('Estudiantes encontrados:', estudiantes.length);
    console.log('Proyectos encontrados:', proyectosComunitarios.length);

    // Filtro de estudiantes por nombre o identificacion
    const estudiantesFiltrados = estudiantes.filter((estudiante) => {
        const termino = busquedaEstudiante.trim().toLowerCase();
        if (!termino) return true;

        const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidos}`.toLowerCase();
        const identificacion = (estudiante.identificacion || '').toLowerCase();

        return nombreCompleto.includes(termino) || identificacion.includes(termino);
    });


    //  Filtro de proyectos por nombre o descripción
    const proyectosComunitariosFiltrados = proyectosComunitarios.filter((proyecto) => {
        const termino = busquedaProyecto.toLowerCase().trim();
        if (!termino) return true;
        const nombre = proyecto.nombre.toLowerCase();
        const descripcion = (proyecto.descripcion || '').toLowerCase();
        return nombre.includes(termino) || descripcion.includes(termino);
    });


    const proyectoSeleccionadoObj = proyectosComunitarios.find((p) => p.id === proyectoSeleccionado);
    const estudiantesSeleccionadosObjs = estudiantes.filter((e) => estudiantesSeleccionados.includes(e.id));

    const handleEjecutarAsignacion = () => {
        if (!proyectoSeleccionado || estudiantesSeleccionados.length === 0) return;
        empezarTransicion(async () => {
            const respuesta = await asignarEstudiantesMasivoAccion({
                estudiantesId: estudiantesSeleccionados,
                proyectoComunitarioId: proyectoSeleccionado,
                horasAsignadas,
                carreraId,
                periodoAcademicoId: periodoAcademicoId || 1,
            });
            if (respuesta.exito) {
                toast.success(respuesta.mensaje || 'Estudiantes asignados correctamente');
                setEstudiantesSeleccionados([]);
                setProyectoSeleccionado(null);
                setModalAbierto(false);
            } else {
                toast.error(respuesta.mensaje || 'Error al asignar estudiantes');
            }
        });
    };

    const calculoPorcentaje = (estudiante: EstudianteResumenDto) => {
        const completadas = estudiante.horasCompletadasVcs ?? 0;
        const requeridas = (estudiante.horasRequeridasVcs && estudiante.horasRequeridasVcs > 0)
            ? estudiante.horasRequeridasVcs
            : 80; // o 96 según la normativa de la carrera
        const porcentaje = Math.min(100, Math.round((completadas / requeridas) * 100));
        return porcentaje;
    }
    // Limitar horas según estudiantes seleccionados
    // 1. Obtener los estudiantes marcados
    const estudiantesMarcados = estudiantes.filter((est) =>
        estudiantesSeleccionados.includes(est.id)
    );

    // 2. Horas pendientes de cada uno
    const horasPendientes = estudiantesMarcados.map((est) => {
        const req = est.horasRequeridasVcs ?? 80;
        const comp = est.horasCompletadasVcs ?? 0;
        return Math.max(1, req - comp);
    });

    // 3. Límite máximo para este lote de asignación
    const maximoHoras = horasPendientes.length > 0 ? Math.min(...horasPendientes) : 80;


    return (
        <div className="w-full min-w-0 space-y-4 sm:space-y-6">
            {/* 1. GRID EN PARALELO (2 Columnas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* BLOQUE IZQUIERDO: Estudiantes */}
                <Card className="flex flex-col h-[380px] sm:h-[480px] min-w-0 shadow-sm border-border">
                    <CardHeader className="px-3 pt-0 pb-0 border-b space-y-2">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 truncate">
                                <User className="h-4 w-4 text-primary shrink-0" />
                                Estudiantes
                            </span>
                            {estudiantesFiltrados.length > 0 && (
                                <span className="text-xs font-normal text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                                    {estudiantesSeleccionados.length}/{estudiantesFiltrados.length}
                                </span>
                            )}
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="search"
                                placeholder="Buscar estudiante..."
                                className="pl-8 h-9 text-sm"
                                value={busquedaEstudiante}
                                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="sm:px-2 sm:pt-0 px-2 pt-0 space-y-2">
                                {estudiantesFiltrados.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-10">
                                        No hay estudiantes para asignación
                                    </p>
                                ) : (
                                    estudiantesFiltrados.map((estudiante) => {
                                        const isSelected = estudiantesSeleccionados.includes(estudiante.id);
                                        const porcentaje = calculoPorcentaje(estudiante);

                                        return (
                                            <div
                                                key={estudiante.id}
                                                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'
                                                    }`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setEstudiantesSeleccionados(estudiantesSeleccionados.filter((id) => id !== estudiante.id));
                                                    } else {
                                                        setEstudiantesSeleccionados([...estudiantesSeleccionados, estudiante.id]);
                                                    }
                                                }}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => {
                                                        if (isSelected) {
                                                            setEstudiantesSeleccionados(estudiantesSeleccionados.filter((id) => id !== estudiante.id));
                                                        } else {
                                                            setEstudiantesSeleccionados([...estudiantesSeleccionados, estudiante.id]);
                                                        }
                                                    }}
                                                    className="mt-1 shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <p className="text-sm font-medium leading-none truncate text-foreground">
                                                        {estudiante.nombres} {estudiante.apellidos}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {estudiante.correo}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        CI: {estudiante.identificacion || 'S/N'}
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        <div className="flex justify-between text-[10px] font-medium">
                                                            <span className="text-foreground">{estudiante.horasCompletadasVcs ?? 0} / {estudiante.horasRequeridasVcs ?? 80}h</span>
                                                            <span className="text-muted-foreground">{porcentaje}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500"
                                                                style={{ width: `${porcentaje}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* BLOQUE DERECHO: Proyectos */}
                <Card className="flex flex-col h-[380px] sm:h-[480px] min-w-0 shadow-sm border-border">
                    <CardHeader className="px-3 pt-0 pb-0 border-b space-y-2">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 truncate">
                                <Book className="h-4 w-4 text-primary shrink-0" />
                                Proyectos Comunitarios
                            </span>
                            {proyectosComunitariosFiltrados.length > 0 && (
                                <span className="text-xs font-normal text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                                    {proyectosComunitariosFiltrados.length}
                                </span>
                            )}
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="search"
                                placeholder="Buscar proyecto..."
                                className="pl-8 h-9 text-sm"
                                value={busquedaProyecto}
                                onChange={(e) => setBusquedaProyecto(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="sm:px-2 sm:pt-0 px-2 pt-0 space-y-2">
                                {proyectosComunitariosFiltrados.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-10">
                                        No hay proyectos comunitarios para asignación
                                    </p>
                                ) : (
                                    proyectosComunitariosFiltrados.map((proyecto) => {
                                        const isSelected = proyectoSeleccionado === proyecto.id;
                                        const tieneTutor = Boolean(proyecto.tutorAcademicoId || proyecto.nombreTutor);

                                        return (
                                            <div
                                                key={proyecto.id}
                                                className={`flex flex-col p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'
                                                    }`}
                                                onClick={() => {
                                                    if (!tieneTutor) {
                                                        toast.warning('Este proyecto aún no tiene un Tutor Académico asignado. Asocie un tutor primero en la sección Tutores Académicos.');
                                                        return;
                                                    }
                                                    setProyectoSeleccionado(isSelected ? null : proyecto.id);
                                                }}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-sm font-semibold truncate flex-1 text-foreground">
                                                        {proyecto.nombre}
                                                    </p>
                                                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                                                </div>
                                                {false && proyecto.descripcion && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                        {proyecto.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between gap-2 mt-2.5 pt-1.5 border-t border-border/50 text-xs">
                                                    <span className={`truncate flex-1 min-w-0 ${tieneTutor ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400 font-medium'}`} title={`Tutor: ${proyecto.nombreTutor || 'Sin asignar'}`}>
                                                        <span className="font-medium text-foreground/80">Tutor:</span> {proyecto.nombreTutor || 'Sin asignar (Requerido)'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold tracking-wider bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase shrink-0">
                                                        {proyecto.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* 2. PARTE INFERIOR: Barra de Control y Confirmación (Mobile Friendly) */}
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
                            value={horasAsignadas || ''}
                            onKeyDown={(e) => {
                                if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === '') {
                                    setHorasAsignadas(0);
                                    return;
                                }
                                const num = parseInt(valor, 10);
                                if (!isNaN(num)) {
                                    setHorasAsignadas(num);
                                }
                            }}
                            className={`w-20 sm:w-24 text-center font-bold h-9 text-sm ${horasAsignadas > maximoHoras || horasAsignadas <= 0
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
                    onClick={() => setModalAbierto(true)}
                    disabled={
                        estudiantesSeleccionados.length === 0 ||
                        proyectoSeleccionado === null ||
                        horasAsignadas <= 0 ||
                        horasAsignadas > maximoHoras
                    }
                    className="w-full sm:w-auto h-10 font-semibold shrink-0"
                >
                    Confirmar Asignación ({estudiantesSeleccionados.length})
                </Button>
            </div>

            {/* Modal de Resumen y Confirmación */}
            <ModalResumenAsignacion
                abierto={modalAbierto}
                alCerrar={() => setModalAbierto(false)}
                alConfirmar={handleEjecutarAsignacion}
                estaPendiente={estaPendiente}
                proyecto={proyectoSeleccionadoObj}
                estudiantes={estudiantesSeleccionadosObjs}
                horasAsignadas={horasAsignadas}
            />
        </div>
    );
}