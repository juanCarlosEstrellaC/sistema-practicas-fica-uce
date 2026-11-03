'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { UsuarioDto } from '@/lib/tipos/pp/general-pp';
import { Search, User, CheckSquare, Square } from 'lucide-react';

interface ColumnaEstudiantesAsignacionProps {
  estudiantes: UsuarioDto[];
  estudiantesSeleccionados: number[];
  alAlternarEstudiante: (id: number) => void;
  alAlternarTodos: (ids: number[]) => void;
  horasMaximasCarrera: number;
}

export function ColumnaEstudiantesAsignacion({
  estudiantes,
  estudiantesSeleccionados,
  alAlternarEstudiante,
  alAlternarTodos,
  horasMaximasCarrera,
}: ColumnaEstudiantesAsignacionProps) {
  const [busqueda, setBusqueda] = useState('');

  const estudiantesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return estudiantes;

    return estudiantes.filter((estudiante) => {
      const nombreCompleto = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.toLowerCase();
      const identificacion = (estudiante.identificacion || '').toLowerCase();
      const correo = (estudiante.correo || '').toLowerCase();
      return (
        nombreCompleto.includes(termino) ||
        identificacion.includes(termino) ||
        correo.includes(termino)
      );
    });
  }, [estudiantes, busqueda]);

  const todosSeleccionados =
    estudiantesFiltrados.length > 0 &&
    estudiantesFiltrados.every((e) => estudiantesSeleccionados.includes(Number(e.id)));

  const manejarAlternarTodos = () => {
    const idsVisibles = estudiantesFiltrados.map((e) => Number(e.id));
    alAlternarTodos(idsVisibles);
  };

  return (
    <Card className="flex flex-col h-[560px] border-border/80 shadow-sm">
      <CardHeader className="px-3 border-b space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-0 text-foreground">
            <User className="h-4 w-4 text-primary" />
            <span>Estudiantes</span>
            <span className="text-xs px-2 py-0 rounded-full bg-primary/10 text-primary font-bold">
              {estudiantesSeleccionados.length}/{estudiantes.length}
            </span>
          </CardTitle>

          {estudiantesFiltrados.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={manejarAlternarTodos}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {todosSeleccionados ? (
                <>
                  <Square className="h-3.5 w-3.5 mr-1" />
                  Deseleccionar
                </>
              ) : (
                <>
                  <CheckSquare className="h-3.5 w-3.5 mr-1" />
                  Seleccionar todos
                </>
              )}
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o cédula..."
            className="pl-8 h-9 text-xs sm:text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 space-y-2">
            {estudiantesFiltrados.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay estudiantes disponibles para asignar.
              </div>
            ) : (
              estudiantesFiltrados.map((estudiante) => {
                const idNumerico = Number(estudiante.id);
                const estaSeleccionado = estudiantesSeleccionados.includes(idNumerico);
                const nombreCompleto = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim() || 'Estudiante';
                const horasRequeridas = estudiante.horasRequeridas || horasMaximasCarrera;
                const horasAcumuladas = estudiante.horasAcumuladas || 0;
                const porcentaje = Math.min(100, Math.round((horasAcumuladas / horasRequeridas) * 100));

                return (
                  <div
                    key={estudiante.id}
                    className={`flex items-start space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      estaSeleccionado
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5 shadow-xs'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                    onClick={() => alAlternarEstudiante(idNumerico)}
                  >
                    <Checkbox
                      checked={estaSeleccionado}
                      onCheckedChange={() => alAlternarEstudiante(idNumerico)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <AvatarUsuario
                      nombre={nombreCompleto}
                      urlFoto={estudiante.urlAvatar}
                      tamano="sm"
                      className="mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold leading-tight text-foreground truncate">
                        {nombreCompleto}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        C.I: {estudiante.identificacion || 'Sin cédula'}
                      </p>

                      {/* Progreso: Horas primero a la izquierda, porcentaje a la derecha */}
                      <div className="mt-1.5">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1 font-medium">
                          <span>
                            {horasAcumuladas}/{horasRequeridas}h
                          </span>
                          <span>{porcentaje}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
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
  );
}
