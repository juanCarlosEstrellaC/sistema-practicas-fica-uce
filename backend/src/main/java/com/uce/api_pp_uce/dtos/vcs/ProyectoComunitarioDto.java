package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProyectoComunitarioDto(
    Long id,
    String nombre,
    String descripcion,
    Integer carreraId,
    String nombreCarrera,
    Long tutorAcademicoId,
    String nombreCompletoTutor,
    String correoTutor,
    EstadoProyecto estado,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String urlDocumento,
    String nombreDocumento,
    LocalDateTime fechaCreacion,
    Boolean iniciado
) {
}
