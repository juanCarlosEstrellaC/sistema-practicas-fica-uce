import { Skeleton } from '@/components/ui/skeleton'

export function EsqueletoConfiguracion() {
  return (
    <div className="space-y-6">
      {/* Cabecera con título a la izquierda y selector de pestañas a la derecha */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44 sm:w-56" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>

        {/* Selector de pestañas */}
        <div className="bg-muted/60 p-1 sm:p-1.5 rounded-xl border border-border/80 grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5 w-full lg:w-auto">
          <Skeleton className="h-9 w-24 sm:w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 sm:w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 sm:w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 sm:w-28 rounded-lg hidden sm:block" />
        </div>
      </div>

      {/* Contenido de la pestaña Perfil */}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Sección de Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-xl bg-muted/30">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
            <Skeleton className="h-5 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
            <Skeleton className="h-3 w-64 mx-auto sm:mx-0" />
            <Skeleton className="h-8 w-36 rounded-md mx-auto sm:mx-0" />
          </div>
        </div>

        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}
