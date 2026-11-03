package com.uce.api_pp_uce.dtos.pp;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record NuevaAsignacionDto(
        @NotNull(message = "El ID del estudiante es obligatorio")
        Long estudianteId,

        Long convenioId,

        Long tutorId,

        String tutorInstitucional,

        @Positive(message = "Las horas asignadas deben ser mayores a 0")
        @Max(value = 500, message = "Las horas asignadas no pueden exceder el límite institucional (500h)")
        Integer horas,

        @NotNull(message = "El ID del periodo académico es obligatorio")
        Long periodoAcademicoId
) {}

