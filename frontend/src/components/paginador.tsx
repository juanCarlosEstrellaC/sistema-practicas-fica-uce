import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginadorProps {
  paginaActual: number; // 0-indexed
  totalPaginas: number;
  onCambioPagina: (pagina: number) => void;
  elementosPorPagina?: number;
  onCambioElementosPorPagina?: (elementos: number) => void;
  opcionesPorPagina?: number[];
}

export function Paginador({ 
  paginaActual, 
  totalPaginas, 
  onCambioPagina, 
  elementosPorPagina, 
  onCambioElementosPorPagina,
  opcionesPorPagina = [10, 20, 50, 100]
}: PaginadorProps) {
  if (totalPaginas <= 0) return null;
  const paginasTotales = Math.max(1, totalPaginas);
  const paginas = [];
  const maxPaginasVisibles = 5;
  
  let inicio = Math.max(0, paginaActual - 2);
  let fin = Math.min(paginasTotales - 1, inicio + maxPaginasVisibles - 1);
  
  if (fin - inicio + 1 < maxPaginasVisibles) {
    inicio = Math.max(0, fin - maxPaginasVisibles + 1);
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row w-full justify-between items-center gap-4 px-2">
      <div className="text-sm text-muted-foreground">
        {onCambioElementosPorPagina && (
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <Select 
              value={elementosPorPagina?.toString()} 
              onValueChange={(v) => onCambioElementosPorPagina(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={elementosPorPagina} />
              </SelectTrigger>
              <SelectContent>
                {opcionesPorPagina.map(op => (
                  <SelectItem key={op} value={op.toString()}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </div>
        )}
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (paginaActual > 0) onCambioPagina(paginaActual - 1);
              }}
              className={paginaActual === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {inicio > 0 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onCambioPagina(0); }}>
                  1
                </PaginationLink>
              </PaginationItem>
              {inicio > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {paginas.map((pag) => (
            <PaginationItem key={pag}>
              <PaginationLink
                href="#"
                isActive={pag === paginaActual}
                onClick={(e) => {
                  e.preventDefault();
                  onCambioPagina(pag);
                }}
              >
                {pag + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {fin < paginasTotales - 1 && (
            <>
              {fin < paginasTotales - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onCambioPagina(paginasTotales - 1); }}>
                  {paginasTotales}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (paginaActual < paginasTotales - 1) onCambioPagina(paginaActual + 1);
              }}
              className={paginaActual >= paginasTotales - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      {/* Spacer for flex balance */}
      <div className="hidden sm:block w-[150px]"></div>
    </div>
  );
}
