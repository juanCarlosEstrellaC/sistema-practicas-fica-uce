package com.uce.api_pp_uce.dtos.pp;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;

public record ActualizarAsignacionDto(
        Long convenioId,
        Long tutorId,
        @Positive(message = "Las horas deben ser mayores a 0")
        @Max(value = 500, message = "Las horas no pueden exceder el límite institucional (500h)")
        Integer horas,
        Long periodoAcademicoId
) {}

