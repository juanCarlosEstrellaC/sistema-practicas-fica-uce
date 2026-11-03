'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { Search, Building2, CheckCircle2 } from 'lucide-react';

interface ColumnaConveniosAsignacionProps {
  convenios: ConvenioDto[];
  convenioSeleccionado: number | null;
  alSeleccionarConvenio: (id: number | null) => void;
  estudiantesSeleccionadosCount: number;
}

export function ColumnaConveniosAsignacion({
  convenios,
  convenioSeleccionado,
  alSeleccionarConvenio,
  estudiantesSeleccionadosCount,
}: ColumnaConveniosAsignacionProps) {
  const [busqueda, setBusqueda] = useState('');

  const conveniosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return convenios;

    return convenios.filter((convenio) => {
      const institucion = (convenio.institucion || '').toLowerCase();
      const tipo = (convenio.tipo || '').toLowerCase();
      const tutorInst = (convenio.tutorInstitucional || '').toLowerCase();
      return (
        institucion.includes(termino) ||
        tipo.includes(termino) ||
        tutorInst.includes(termino)
      );
    });
  }, [convenios, busqueda]);

  return (
    <Card className="flex flex-col h-[560px] border-border/80 shadow-sm">
      <CardHeader className="px-3 border-b space-y-0.5">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
          <span className="flex items-center gap-0">
            <Building2 className="h-4 w-4 text-primary" />
            Convenio / Empresa
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            {conveniosFiltrados.length} disponibles
          </span>
        </CardTitle>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por empresa o institución..."
            className="pl-8 h-9 text-xs sm:text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 space-y-2">
            {conveniosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay convenios activos disponibles.
              </div>
            ) : (
              conveniosFiltrados.map((convenio) => {
                const idNumerico = Number(convenio.id);
                const estaSeleccionado = convenioSeleccionado === idNumerico;
                const ocupados = convenio.ocupados || 0;
                const cuposTotales = convenio.cuposTotales ?? convenio.cuposDisponibles ?? 0;
                const disponibles = cuposTotales - ocupados;
                const sinCupos = disponibles <= 0;
                const superaCupos = estaSeleccionado && estudiantesSeleccionadosCount > disponibles;

                return (
                  <div
                    key={convenio.id}
                    className={`flex flex-col p-3 rounded-lg border transition-all ${
                      sinCupos
                        ? 'opacity-50 cursor-not-allowed bg-muted/40 border-border/40'
                        : estaSeleccionado
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5 cursor-pointer shadow-xs'
                        : 'border-border/60 hover:bg-muted/40 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!sinCupos) {
                        alSeleccionarConvenio(estaSeleccionado ? null : idNumerico);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate flex-1">
                        {convenio.institucion}
                      </p>
                      {estaSeleccionado && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>

                    {convenio.tutorInstitucional && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Contacto: {convenio.tutorInstitucional}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <Badge
                        variant={sinCupos || superaCupos ? 'destructive' : 'secondary'}
                        className="text-[10px] font-medium"
                      >
                        {disponibles > 0 ? `${disponibles} disponibles de ${cuposTotales}` : 'Sin cupos'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {convenio.tipo || 'Institución'}
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
  );
}
