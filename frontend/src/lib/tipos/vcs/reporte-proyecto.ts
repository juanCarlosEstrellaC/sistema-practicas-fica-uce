export type TipoReporteProyectoVcs = 'TRIMESTRAL_AVANCES' | 'INFORME_DEFINITIVO';

export type EstadoRevisionVcs = 'PENDIENTE' | 'APROBADO' | 'OBSERVADO';

export interface ReporteProyecto {
    id: number;
    proyectoId: number;
    nombreProyecto: string;
    periodoId: number;
    nombrePeriodo: string;
    coordinadorId?: number | null;
    nombreCoordinador?: string | null;
    tipo: TipoReporteProyectoVcs;
    nombreArchivo: string;
    urlArchivo: string;
    estadoSubdecanato: EstadoRevisionVcs;
    observaciones?: string | null;
    fechaSubida: string;
    fechaRevision?: string | null;
}

export interface ReporteProyectoNuevo {
    proyectoId: number;
    periodoId: number;
    tipo: TipoReporteProyectoVcs;
    nombreArchivo: string;
    urlArchivo: string;
}

export interface ReporteRevisionSubdecanato {
    estadoSubdecanato: EstadoRevisionVcs;
    observaciones?: string;
}

export interface FiltrosReportesVcs {
    pagina?: number;
    tamanio?: number;
    busqueda?: string;
    proyectoId?: number;
    periodoId?: number;
    tipo?: TipoReporteProyectoVcs;
    estadoSubdecanato?: EstadoRevisionVcs;
}
