'use client';

import { EstadoRevisionVcs } from '@/lib/tipos/vcs/reporte-proyecto';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface BadgeEstadoRevisionProps {
    estado?: EstadoRevisionVcs | null;
    className?: string;
}

export function BadgeEstadoRevision({ estado, className = '' }: BadgeEstadoRevisionProps) {
    if (!estado) {
        return null;
    }

    switch (estado) {
        case 'APROBADO':
            return (
                <Badge
                    variant="outline"
                    className={`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold gap-1.5 py-0.5 px-2.5 shadow-sm ${className}`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Aprobado
                </Badge>
            );

        case 'OBSERVADO':
            return (
                <Badge
                    variant="outline"
                    className={`bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold gap-1.5 py-0.5 px-2.5 shadow-sm ${className}`}
                >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Observado
                </Badge>
            );

        case 'PENDIENTE':
        default:
            return (
                <Badge
                    variant="outline"
                    className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-semibold gap-1.5 py-0.5 px-2.5 shadow-sm ${className}`}
                >
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Pendiente
                </Badge>
            );
    }
}
