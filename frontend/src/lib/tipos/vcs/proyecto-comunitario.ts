export type EstadoProyectoComunitario = 'ACTIVO' | 'FINALIZADO' | 'CANCELADO' | 'INACTIVO';

export interface ProyectoComunitarioDto {
  id: number;
  nombre: string;
  descripcion?: string;
  carreraId: number;
  nombreCarrera?: string;
  tutorAcademicoId?: number | null;
  nombreCompletoTutor?: string;
  correoTutor?: string;
  estado: EstadoProyectoComunitario;
  fechaInicio?: string;
  fechaFin?: string;
  urlDocumento?: string | null;
  nombreDocumento?: string | null;
  fechaCreacion?: string;
  iniciado?: boolean;
}

export interface NuevoProyectoComunitarioDto {
  nombre: string;
  descripcion?: string;
  carreraId: number;
  tutorAcademicoId?: number | null;
  fechaInicio?: string;
  fechaFin?: string;
  urlDocumento?: string | null;
  nombreDocumento?: string | null;
}

export interface ActualizarProyectoComunitarioDto {
  nombre: string;
  descripcion?: string;
  carreraId: number;
  tutorAcademicoId?: number | null;
  estado?: EstadoProyectoComunitario;
  fechaInicio?: string;
  fechaFin?: string;
  urlDocumento?: string | null;
  nombreDocumento?: string | null;
}

export interface FiltrosProyectoComunitario {
  busqueda?: string;
  carreraId?: number;
  tutorId?: number;
  estado?: EstadoProyectoComunitario;
  page?: number;
  size?: number;
  sort?: string;
}
