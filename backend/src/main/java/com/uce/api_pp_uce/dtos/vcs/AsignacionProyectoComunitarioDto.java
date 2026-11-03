package com.uce.api_pp_uce.dtos.vcs;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;

public record AsignacionProyectoComunitarioDto(
    Long id,
    Long procesoVinculacionId,
    Long estudianteId,
    String nombreCompletoEstudiante,
    String identificacionEstudiante,
    String correoEstudiante,
    Long proyectoId,
    String nombreProyecto,
    Long tutorId,
    String nombreCompletoTutor,
    String correoTutor,
    Long carreraId,
    String nombreCarrera,
    Long periodoAcademicoId,
    String nombrePeriodoAcademico,
    Integer horasAsignadas,
    Integer horasCompletadas,
    Integer horasAcumuladasEstudiante,
    Integer horasRequeridasEstudiante,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    EstadoAsignacionVcs estado,
    FaseActualAsignacion faseActual,
    Boolean documentosValidados,
    String urlCertificado,
    LocalDateTime fechaCreacion
) {
}
