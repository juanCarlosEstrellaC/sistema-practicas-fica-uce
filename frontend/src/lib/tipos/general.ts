// TIPOS
export type RolUsuario =
  | 'ESTUDIANTE'
  | 'TUTOR_ACADEMICO'
  | 'DIRECTOR_CARRERA'
  | 'COORDINADOR_PRACTICAS'
  | 'SUBDECANO';

export type TipoNotificacion = 'INFORMACION' | 'ADVERTENCIA' | 'EXITO' | 'ERROR';

export type EstadoPeriodo = 'ACTIVO' | 'INACTIVO';

export type TipoIdentificacion = 'CEDULA' | 'PASAPORTE';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

// INTERFACES
export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  rol: RolUsuario;
  carreraId?: string;
  avatar?: string;
  identificacion?: string;
  tipoIdentificacion?: TipoIdentificacion;
  apellidos?: string;
  nombres?: string;
  telefono?: string;
  estado?: EstadoUsuario;
  creditosAprobados?: number;
  promedioGeneral?: number;
  horasRequeridas?: number;
  horasAcumuladas?: number;
}

export interface UsuarioSesion {
  id: number;
  correo: string;
  nombres: string;
  apellidos: string;
  identificacion?: string;
  tipoIdentificacion?: TipoIdentificacion;
  rol: RolUsuario;
  carreraId?: number;
  carreraNombre?: string;
  telefono?: string;
  urlAvatar?: string;
  estado?: EstadoUsuario;
  horasRequeridas?: number;
  horasAcumuladas?: number;
}

export interface Carrera {
  id: string;
  nombre: string;
  codigoCarrera?: string;
  ciudadCarrera?: string;
  horasPractica: number[];
  semestresPPP: number[];
  horasVCS: number[];
  semestresVCS: number[];
  director: string;
  coordinador: string;
}

export interface Notificacion {
  id: string;
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  fecha: string;
}

export interface PeriodoAcademico {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
}

export interface UsuarioResumenDto {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion?: string;
  tipoIdentificacion?: TipoIdentificacion;
  correo?: string;
  telefono?: string;
  carreraNombre?: string;
  carreraId?: number;
  urlAvatar?: string;
}

export interface EstudianteResumenDto extends UsuarioResumenDto {
  horasCompletadasVcs?: number;
  horasRequeridasVcs?: number;
}


export interface RespuestaApi<T = void> {
  exito: boolean;
  mensaje: string;
  data?: T;
}

export interface RespuestaPaginada<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
