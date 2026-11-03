'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

interface FiltrosProyectosProps {
  carreras?: CarreraDto[];
}

export function FiltrosProyectos({ carreras = [] }: FiltrosProyectosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('busqueda') || '');

  const busquedaDebounce = useDebounce(textoBusqueda, 500);
  const esPrimeraCarga = useRef(true);

  // Sincronizar input si los searchParams cambian externamente (ej: boton limpiar o flechas atras/adelante)
  useEffect(() => {
    setTextoBusqueda(searchParams.get('busqueda') || '');
  }, [searchParams]);

  // Aplicar busqueda automatica cuando el usuario deja de escribir (debounce 500ms)
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
    params.set('page', '0'); // Siempre reiniciar a pagina 0 al cambiar filtros

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
    iniciarTransicion(() => {
      router.push(pathname);
    });
  };

  const tieneFiltrosActivos =
    Boolean(searchParams.get('busqueda')) ||
    Boolean(searchParams.get('carreraId')) ||
    Boolean(searchParams.get('estado'));

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Busqueda a la izquierda */}
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
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
          {/* Filtro Carrera (Solo visible si hay carreras disponibles, ej: Subdecano) */}
          {carreras && carreras.length > 0 && (
            <div className="w-full sm:w-[210px] min-w-0">
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

          {/* Filtro Estado */}
          <div className="w-full sm:w-[160px] min-w-0">
            <Select
              value={searchParams.get('estado') || 'TODOS'}
              onValueChange={(val) => aplicarFiltro('estado', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0 truncate">
                <SelectValue placeholder="Todos los estados" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
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
