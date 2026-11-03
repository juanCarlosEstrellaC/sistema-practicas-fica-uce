import { EstadoRevisionVcs } from './reporte-proyecto';
import { EstadoAsignacionVcs, EstadoProcesoVcs, FaseActualAsignacion } from './asignacion-proyecto';

export type { EstadoRevisionVcs };

export type TipoDocumentoVcs = 'BITACORA' | 'INFORME_FINAL';

export interface EvidenciaVcs {
    id: number;
    asignacionId: number;
    estudianteId: number;
    nombreCompletoEstudiante: string;
    identificacionEstudiante: string;
    proyectoId: number;
    nombreProyecto: string;
    tipoDocumento?: TipoDocumentoVcs;
    nombreArchivo: string;
    urlArchivo: string;
    horasReportadas?: number | null;
    estadoTutor: EstadoRevisionVcs;
    observacionesTutor?: string | null;
    fechaSubida: string;
    fechaRevisionTutor?: string | null;
}

export interface EvidenciaVcsNuevo {
    asignacionId: number;
    tipoDocumento: TipoDocumentoVcs;
    nombreArchivo: string;
    urlArchivo: string;
    horasReportadas?: number;
}

export interface EvidenciaRevisionTutor {
    estadoTutor: EstadoRevisionVcs;
    observaciones?: string;
}

export interface AprobarHorasSubdecanato {
    horasAprobadas: number;
    observaciones?: string;
    urlCertificadoFirmado?: string;
}

export interface ResultadoAprobacionHoras {
    asignacionId: number;
    estadoAsignacion: EstadoAsignacionVcs;
    faseActual: FaseActualAsignacion;
    horasAprobadas: number;
    horasAcumuladas: number;
    horasRequeridas: number;
    estadoProceso: EstadoProcesoVcs;
    procesoCulminado: boolean;
    mensaje: string;
}

export interface FiltrosEvidenciasVcs {
    pagina?: number;
    tamanio?: number;
    busqueda?: string;
    asignacionId?: number;
    estudianteId?: number;
    tutorId?: number;
    estadoTutor?: EstadoRevisionVcs;
}
