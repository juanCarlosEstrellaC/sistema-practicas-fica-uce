import { CalendarOff } from "lucide-react";

interface BannerPeriodoInactivoProps {
    nombrePeriodo?: string;
    titulo?: string;
    mensaje?: string;
}

export function BannerPeriodoInactivo({ nombrePeriodo, titulo, mensaje }: BannerPeriodoInactivoProps) {
    return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <CalendarOff className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    {titulo || `Periodo Académico Inactivo ${nombrePeriodo ? `(${nombrePeriodo})` : ''}`}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {mensaje || "El periodo académico seleccionado se encuentra inactivo. Por tanto, este módulo es de solo lectura y no se pueden realizar nuevas modificaciones o asignaciones."}
                </p>
            </div>
        </div>
    );
}
