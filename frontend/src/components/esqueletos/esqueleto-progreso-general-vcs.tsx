import { Skeleton } from '@/components/ui/skeleton'

export function EsqueletoProgresoGeneralVcs() {
  return (
    <div className="space-y-6">
      {/* Resumen Global de 4 Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={`esqueleto-metrica-${indice}`} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Barra de Progreso Global */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 2 }).map((_, indice) => (
          <div key={`esqueleto-proyecto-card-${indice}`} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
