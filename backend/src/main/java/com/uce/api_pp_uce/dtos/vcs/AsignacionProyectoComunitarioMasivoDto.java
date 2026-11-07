package com.uce.api_pp_uce.dtos.vcs;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AsignacionProyectoComunitarioMasivoDto(
        @NotEmpty(message = "Debe seleccionar al menos un estudiante")
        List<Long> estudiantesId,
        
        @NotNull(message = "Debe seleccionar un proyecto")
        Long proyectoComunitarioId,
        
        @NotNull(message = "El número de horas es obligatorio")
        @Positive(message = "El número de horas debe ser mayor a 0")
        @Max(value = 160, message = "El número de horas no puede superar las 160h reglamentarias")
        Integer horasAsignadas,
        
        @NotNull(message = "Debe seleccionar una carrera")
        Integer carreraId,
        
        @NotNull(message = "Debe seleccionar un periodo académico")
        Long periodoAcademicoId) {
}
