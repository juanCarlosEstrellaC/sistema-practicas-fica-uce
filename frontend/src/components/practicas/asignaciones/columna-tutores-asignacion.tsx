'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { Search, GraduationCap, CheckCircle2 } from 'lucide-react';

interface ColumnaTutoresAsignacionProps {
  tutores: TutorResumenDto[];
  tutorSeleccionado: number | null;
  alSeleccionarTutor: (id: number | null) => void;
  estudiantesSeleccionadosCount: number;
}

export function ColumnaTutoresAsignacion({
  tutores,
  tutorSeleccionado,
  alSeleccionarTutor,
  estudiantesSeleccionadosCount,
}: ColumnaTutoresAsignacionProps) {
  const [busqueda, setBusqueda] = useState('');

  const tutoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return tutores;

    return tutores.filter((tutor) => {
      const nombreCompleto = `${tutor.nombres || ''} ${tutor.apellidos || ''}`.toLowerCase();
      const correo = (tutor.correo || '').toLowerCase();
      const especialidad = (tutor.especialidad || '').toLowerCase();
      return (
        nombreCompleto.includes(termino) ||
        correo.includes(termino) ||
        especialidad.includes(termino)
      );
    });
  }, [tutores, busqueda]);

  return (
    <Card className="flex flex-col h-[560px] border-border/80 shadow-sm">
      <CardHeader className="px-3 border-b space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Tutor Académico
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            {tutoresFiltrados.length} disponibles
          </span>
        </CardTitle>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o correo..."
            className="pl-8 h-9 text-xs sm:text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden space-y-1">
        <ScrollArea className="h-full">
          <div className="px-3 space-y-2">
            {tutoresFiltrados.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay tutores académicos registrados.
              </div>
            ) : (
              tutoresFiltrados.map((tutor) => {
                const idNumerico = Number(tutor.id);
                const estaSeleccionado = tutorSeleccionado === idNumerico;
                const carga = tutor.estudiantesAsignados || 0;
                const limiteMaximo = 10;
                const sinCupo = carga >= limiteMaximo;
                const superaLimite =
                  estaSeleccionado && carga + estudiantesSeleccionadosCount > limiteMaximo;
                const nombreCompleto = `${tutor.nombres || ''} ${tutor.apellidos || ''}`.trim() || 'Tutor';

                return (
                  <div
                    key={tutor.id}
                    className={`flex flex-col p-3 rounded-lg border transition-all ${
                      sinCupo
                        ? 'opacity-50 cursor-not-allowed bg-muted/40 border-border/40'
                        : estaSeleccionado
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5 cursor-pointer shadow-xs'
                        : 'border-border/60 hover:bg-muted/40 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!sinCupo) {
                        alSeleccionarTutor(estaSeleccionado ? null : idNumerico);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarUsuario
                          nombre={nombreCompleto}
                          urlFoto={tutor.urlAvatar}
                          tamano="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {nombreCompleto}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {tutor.correo}
                          </p>
                        </div>
                      </div>

                      {estaSeleccionado && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/50">
                      <Badge
                        variant={sinCupo || superaLimite ? 'destructive' : 'secondary'}
                        className="text-[10px] font-medium"
                      >
                        {carga} asignados de {limiteMaximo}
                      </Badge>

                      {tutor.especialidad && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                          {tutor.especialidad}
                        </span>
                      )}
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
