package com.uce.api_pp_uce.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CarreraDto(
        Integer id,

        @NotBlank(message = "El nombre de la carrera es obligatorio")
        String nombre,

        @NotBlank(message = "El código de la carrera es obligatorio")
        String codigoCarrera,

        String ciudadCarrera,

        @NotNull(message = "Las horas de prácticas son obligatorias")
        @Min(value = 1, message = "Las horas de prácticas deben ser mayores a cero")
        @Max(value = 500, message = "Las horas de prácticas no pueden exceder 500")
        Integer horasPractica,

        @NotNull(message = "Las horas de proyectos comunitarios son obligatorias")
        @Min(value = 1, message = "Las horas de proyectos comunitarios deben ser mayores a cero")
        @Max(value = 500, message = "Las horas de proyectos comunitarios no pueden exceder 500")
        Integer horasProyectosComunitarios,

        Long directorId,
        Long coordinadorId,
        String directorNombre,
        String coordinadorNombre
) {}
