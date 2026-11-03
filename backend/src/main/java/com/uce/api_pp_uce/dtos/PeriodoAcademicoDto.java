package com.uce.api_pp_uce.dtos;

import com.uce.api_pp_uce.enums.EstadoPeriodo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PeriodoAcademicoDto(
        Long id,

        @NotBlank(message = "El nombre del periodo académico es obligatorio")
        String nombre,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate fechaFin,

        EstadoPeriodo estado
) {}
