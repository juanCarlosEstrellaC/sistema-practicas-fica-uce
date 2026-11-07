package com.uce.api_pp_uce.dtos.vcs;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AsignacionProyectoComunitarioActualizarDto(
        @NotNull(message = "El id del proyecto es obligatorio")
        Long proyectoComunitarioId,

        @NotNull(message = "El número de horas es obligatorio")
        @Positive(message = "El número de horas debe ser mayor a 0")
        @Max(value = 160, message = "El número de horas no puede superar las 160h reglamentarias")
        Integer horasAsignadas) {

}
