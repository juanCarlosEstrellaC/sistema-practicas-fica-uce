package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ProyectoComunitarioActualizarDto(
    @NotBlank(message = "El nombre del proyecto es obligatorio")
    String nombre,

    String descripcion,

    @NotNull(message = "El id de la carrera es obligatorio")
    Integer carreraId,

    Long tutorAcademicoId,

    EstadoProyecto estado,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String urlDocumento,
    String nombreDocumento
) {
}
