import { UsuarioResumenDto } from '../general';
import { EstadoProyectoComunitario } from './proyecto-comunitario';

// TIPOS / ENUMS
export type EstadoAsignacionVcs = 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'CANCELADO';
export type EstadoProcesoVcs = 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';
export type FaseActualAsignacion = 'ASIGNACION' | 'DESARROLLO' | 'FINALIZACION' | 'EVALUACION' | 'FINALIZADO';

// DTOS DEL BACKEND

// 1. DTO de respuesta principal para tablas y vistas
export interface AsignacionProyectoComunitarioDto {
  id: number;
  procesoVinculacionId?: number;
  estudianteId: number;
  nombreCompletoEstudiante: string;
  identificacionEstudiante: string;
  correoEstudiante: string;
  urlAvatar?: string;
  proyectoId: number;
  nombreProyecto: string;
  tutorId?: number;
  nombreCompletoTutor?: string;
  correoTutor?: string;
  carreraId: number;
  nombreCarrera: string;
  periodoAcademicoId: number;
  nombrePeriodoAcademico: string;
  horasAsignadas: number;
  horasCompletadas: number;
  horasAcumuladasEstudiante?: number;
  horasRequeridasEstudiante?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoAsignacionVcs;
  faseActual: FaseActualAsignacion;
  documentosValidados?: boolean;
  urlCertificado?: string;
  fechaCreacion?: string;
}

export type AsignacionProyectoDto = AsignacionProyectoComunitarioDto;

// 2. DTO para la asignación masiva (POST)
export interface AsignacionProyectoComunitarioMasivoDto {
  estudiantesId: number[];
  proyectoComunitarioId: number;
  horasAsignadas: number;
  carreraId: number;
  periodoAcademicoId: number;
}

// 3. DTO para actualizar una asignación individual (PUT)
export interface AsignacionProyectoComunitarioActualizarDto {
  proyectoComunitarioId: number;
  horasAsignadas: number;
}

// 4. DTOs de apoyo
export interface ProyectoResumenDto {
  id: number;
  nombre: string;
  descripcion?: string;
  carreraId?: number;
  nombreCarrera?: string;
  tutorAcademicoId?: number;
  nombreTutor?: string;
  estado: EstadoProyectoComunitario;
}

export interface TutorResumenVcsDto {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion?: string;
  correo: string;
  carreraId: number;
  nombreCarrera: string;
  asignacionesActuales: number;
  proyectos: ProyectoResumenDto[];
  estudiantes: UsuarioResumenDto[];
}

export interface FiltrosAsignacionProyectoComunitario {
  carreraId?: number;
  periodoAcademicoId?: number;
  tutorId?: number;
  estudianteId?: number;
  proyectoId?: number;
  estado?: EstadoAsignacionVcs;
  faseActual?: FaseActualAsignacion;
  busqueda?: string;
  page?: number;
  size?: number;
  sort?: string;
}
