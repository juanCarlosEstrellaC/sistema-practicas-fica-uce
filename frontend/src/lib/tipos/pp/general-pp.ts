import { EstadoUsuario, TipoIdentificacion } from "../general";

// TIPOS
export type FaseActualPractica = 'CONVOCATORIA' | 'ASIGNACION' | 'DESARROLLO' | 'FINALIZACION';

export type EstadoMatrizCaces =
  | 'PENDIENTE'
  | 'ENVIADA_A_DC'
  | 'FIRMADA_POR_DC'
  | 'ENVIADA_A_SUBDECANO'
  | 'FIRMADA_POR_SUBDECANO'
  | 'RECHAZADA';

export interface MatrizCacesDto {
  id: number;
  periodoAcademicoId: number;
  periodoNombre?: string;
  carreraId: number;
  carreraNombre?: string;
  carreraCodigo?: string;
  estado: EstadoMatrizCaces;
  fechaGeneracion?: string;
  archivoFirmadoUrl?: string | null;
  observacion?: string | null;
}

export type TipoDocumento =
  | 'CV'
  | 'DOCUMENTO_IDENTIDAD'
  | 'CARTA_ASIGNACION'
  | 'SEGUIMIENTO_TA'
  | 'INFORME_FINAL'
  | 'CERTIFICADO_CUMPLIMIENTO'
  | 'AVAL'
  | 'MATRIZ_CACES'
  | 'EVIDENCIA';

export type EstadoDocumento = 'PENDIENTE_REVISION' | 'APROBADO' | 'RECHAZADO';

export type TipoConvenio = 'PUBLICO' | 'PRIVADO';

export type EstadoConvenio = 'ACTIVO' | 'POR_EXPIRAR' | 'EXPIRADO' | 'ANULADO';

export type EstadoAsignacionPractica = 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'CANCELADO';

export type TipoObservacion = 'NUEVA' | 'ANULACION';

export type EstadoObservacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

// INTERFACES / DTOS
export interface ConvenioDto {
  id: string | number;
  institucion: string;
  tutorInstitucional: string;
  correoTutor: string;
  telefonoTutor: string;
  direccion: string;
  cuposTotales: number;
  cuposDisponibles?: number;
  ocupados?: number;
  tipo: string;
  campoEspecifico: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  urlDocumento?: string;
  documentoUrl?: string;
  nombreDocumento?: string;
}

export interface DocumentoDto {
  id: string;
  estudianteId: string;
  asignacionId?: string | null;
  tipo: TipoDocumento;
  nombre: string;
  url: string;
  firmado: boolean;
  estado?: EstadoDocumento;
  observacion?: string;
  fechaSubida: string;
}

export interface TutorResumenDto {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  especialidad: string;
  estudiantesAsignados: number;
  urlAvatar: string;
  estudiantes?: { id: number; nombres: string; apellidos: string }[];
}

export interface UsuarioDto {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  rol: string;
  carreraId: string;
  identificacion?: string;
  tipoIdentificacion?: TipoIdentificacion;
  telefono?: string;
  urlAvatar?: string;
  estado?: EstadoUsuario;
  horasRequeridas?: number;
  horasAcumuladas?: number;
}

export interface CarreraDto {
  id: string;
  nombre: string;
  codigoCarrera: string;
  ciudadCarrera: string;
  horasPractica: number;
  horasProyectosComunitarios?: number;
  directorId: string;
  coordinadorId: string;
  director?: string;
  coordinador?: string;
  directorNombre?: string;
  coordinadorNombre?: string;
}

export interface UsuarioResumenDto {
  id: number | string;
  nombres: string;
  apellidos: string;
  identificacion: string;
  tipoIdentificacion?: string;
  correo: string;
  telefono?: string;
  carreraNombre?: string;
  carreraId?: number;
  urlAvatar?: string;
}

export interface AsignacionPracticaDetalleDto {
  id: number | string;
  estudiante: UsuarioResumenDto;
  tutorAcademico?: UsuarioResumenDto | null;
  convenioId?: number | string | null;
  institucion?: string | null;
  direccion?: string | null;
  tutorInstitucional?: string | null;
  correoTutorInstitucional?: string | null;
  telefonoTutorInstitucional?: string | null;
  directorCarreraNombre?: string | null;
  periodoAcademicoNombre?: string | null;
  periodoAcademicoId?: number | string | null;
  semestre?: number | null;
  horasAsignadas: number;
  horasCompletadas: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fase: FaseActualPractica;
  estado: EstadoAsignacionPractica;
  validadoCpp?: boolean;
  reunionRealizada?: boolean;
  validadoSiiu?: boolean;
  cartaAsignacionEnviada?: boolean;
  sectorReceptora?: string | null;
  observacionesCaces?: string | null;
  puedeEditar?: boolean;
}

export interface AsignacionDto {
  id: string;
  estudiante?: {
    id: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    tipoIdentificacion: string;
    correo: string;
    telefono: string;
    carreraNombre: string;
    carreraId: number;
    urlAvatar: string;
  };
  convenioId: string;
  institucion?: string;
  direccion?: string;
  tutorAcademico?: {
    id: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    tipoIdentificacion: string;
    correo: string;
    telefono: string;
    carreraNombre: string;
    carreraId: number;
    urlAvatar: string;
  };
  tutorInstitucional: string;
  semestre: number;
  horasAsignadas: number;
  horasCompletadas: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  fase: string;
  validadoCpp: boolean;
  reunionRealizada: boolean;
  periodoAcademicoId: string;
  validadoSiiu?: boolean;
  sectorReceptora?: string;
  tipoIdentificacion?: string;
  observacionesCaces?: string;
  puedeEditar?: boolean;
}

export interface ObservacionDto {
  id: string | number;
  remitenteId: string | number;
  remitente?: {
    id: number | string;
    nombres: string;
    apellidos: string;
    identificacion?: string;
    correo?: string;
    telefono?: string;
    carreraNombre?: string;
    carreraId?: number;
    urlAvatar?: string;
  };
  remitenteNombre?: string;
  carreraId: string | number;
  carreraNombre?: string;
  tipo: string;
  convenioId?: string | number | null;
  empresa: string;
  contacto?: string;
  correo?: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export interface PeriodoAcademicoDto {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface Convenio {
  id: string;
  institucion: string;
  tipo: TipoConvenio;
  campoEspecifico?: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoConvenio;
  tutorInstitucional: string;
  correoTutor: string;
  telefonoTutor?: string;
  direccion: string;
  cuposTotales: number;
  ocupados: number;
  documentoUrl?: string;
  nombreDocumento?: string;
}

export interface AsignacionPracticas {
  id: string;
  estudianteId: string;
  estudianteNombres?: string;
  estudianteApellidos?: string;
  estudianteCorreo?: string;
  estudianteIdentificacion?: string;
  estudianteTipoIdentificacion?: string;
  carreraNombre?: string;
  convenioId: string;
  convenioInstitucion?: string;
  tutorAcademicoId: string;
  tutorAcademicoNombres?: string;
  tutorAcademicoApellidos?: string;
  tutorAcademicoCorreo?: string;
  tutorAcademicoIdentificacion?: string;
  tutorInstitucional: string;
  semestre: number;
  horasAsignadas: number;
  horasCompletadas: number;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoAsignacionPractica;
  fase: FaseActualPractica;
  validadoCPP?: boolean;
  reunionRealizada?: boolean;
  periodoAcademicoId: string;
  validadoSIIU?: boolean;
  area?: string;
  sectorReceptora?: string;
  tipoIdentificacion?: string;
  observaciones?: string;
  puedeEditar?: boolean;
}

export interface Documento {
  id: string;
  estudianteId: string;
  asignacionId?: string | null;
  tipo: TipoDocumento;
  nombre: string;
  url: string;
  fechaSubida: string;
  firmado: boolean;
  estado?: EstadoDocumento;
  observacion?: string;
}

export interface Observacion {
  id: string;
  remitenteId: string;
  carreraId: string;
  tipo: TipoObservacion;
  convenioId?: string;
  empresa: string;
  contacto?: string;
  correo?: string;
  descripcion: string;
  estado: EstadoObservacion;
  fecha: string;
  remitenteNombre?: string;
}
