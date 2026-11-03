package com.uce.api_pp_uce.dtos.vcs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ProyectoComunitarioNuevoDto(
    @NotBlank(message = "El nombre del proyecto es obligatorio")
    String nombre,

    String descripcion,

    @NotNull(message = "El id de la carrera es obligatorio")
    Integer carreraId,

    Long tutorAcademicoId,

    LocalDate fechaInicio,
    LocalDate fechaFin,
    String urlDocumento,
    String nombreDocumento
) {
}
