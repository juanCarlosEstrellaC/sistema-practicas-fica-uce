package com.uce.api_pp_uce.dtos.pp;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record HorasAsignacionDto(
        @NotNull(message = "El número de horas es obligatorio")
        @Positive(message = "Las horas deben ser mayores a 0")
        @Max(value = 500, message = "Las horas no pueden exceder el límite permitido (500h)")
        Integer horas
) {}
