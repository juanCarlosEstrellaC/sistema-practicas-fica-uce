'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProyectoResumenDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, RotateCcw } from 'lucide-react';

interface FiltrosTutoresVcsProps {
  proyectos: ProyectoResumenDto[];
  carreras?: CarreraDto[];
}

export function FiltrosTutoresVcs({ proyectos, carreras = [] }: FiltrosTutoresVcsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('busqueda') || '');

  const busquedaDebounce = useDebounce(textoBusqueda, 500);
  const esPrimeraCarga = useRef(true);

  useEffect(() => {
    setTextoBusqueda(searchParams.get('busqueda') || '');
  }, [searchParams]);

  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }
    const busquedaActual = searchParams.get('busqueda') || '';
    if (busquedaDebounce !== busquedaActual) {
      aplicarFiltro('busqueda', busquedaDebounce);
    }
  }, [busquedaDebounce]);

  const aplicarFiltro = (clave: string, valor: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '0');

    if (valor && valor !== 'TODOS' && valor.trim() !== '') {
      params.set(clave, valor.trim());
    } else {
      params.delete(clave);
    }

    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    const params = new URLSearchParams();
    const periodoId = searchParams.get('periodoId');
    if (periodoId) {
      params.set('periodoId', periodoId);
    }
    iniciarTransicion(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  };

  const tieneFiltrosActivos =
    Boolean(searchParams.get('busqueda')) ||
    Boolean(searchParams.get('carreraId')) ||
    Boolean(searchParams.get('proyectoId')) ||
    Boolean(searchParams.get('conAsignaciones'));

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Búsqueda a la izquierda */}
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o cédula..."
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                aplicarFiltro('busqueda', textoBusqueda);
              }
            }}
            className="pl-9 pr-8 h-9 w-full placeholder:truncate"
          />
          {textoBusqueda && (
            <button
              onClick={() => {
                setTextoBusqueda('');
                aplicarFiltro('busqueda', null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grupo de selectores alineados a la derecha */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 justify-end">
          {/* Filtro Carrera */}
          {carreras && carreras.length > 0 && (
            <div className="w-full sm:w-[200px] min-w-0">
              <Select
                value={searchParams.get('carreraId') || 'TODOS'}
                onValueChange={(val) => aplicarFiltro('carreraId', val)}
              >
                <SelectTrigger className="h-9 w-full min-w-0 truncate">
                  <SelectValue placeholder="Todas las carreras" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent className="max-w-[320px]">
                  <SelectItem value="TODOS">Todas las carreras</SelectItem>
                  {carreras.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <span className="truncate">{c.nombre}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro Proyecto */}
          <div className="w-full sm:w-[200px] min-w-0">
            <Select
              value={searchParams.get('proyectoId') || 'TODOS'}
              onValueChange={(val) => aplicarFiltro('proyectoId', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0 truncate">
                <SelectValue placeholder="Todos los proyectos" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent className="max-w-[320px]">
                <SelectItem value="TODOS">Todos los proyectos</SelectItem>
                {proyectos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    <span className="truncate">{p.nombre}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Asignaciones */}
          <div className="w-full sm:w-[170px] min-w-0">
            <Select
              value={searchParams.get('conAsignaciones') || 'TODOS'}
              onValueChange={(val) => aplicarFiltro('conAsignaciones', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0 truncate">
                <SelectValue placeholder="Todos los tutores" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los tutores</SelectItem>
                <SelectItem value="CON_ASIGNACIONES">Con asignaciones</SelectItem>
                <SelectItem value="SIN_ASIGNACIONES">Sin asignaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limpiar */}
          {tieneFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
              disabled={estaPendiente}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
