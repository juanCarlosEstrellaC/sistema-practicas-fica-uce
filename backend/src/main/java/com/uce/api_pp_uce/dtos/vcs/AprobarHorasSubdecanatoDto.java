package com.uce.api_pp_uce.dtos.vcs;

import jakarta.validation.constraints.Min;

public record AprobarHorasSubdecanatoDto(
    @Min(value = 1, message = "Las horas aprobadas deben ser mayores a 0")
    Integer horasAprobadas,

    String observaciones,

    String urlCertificadoFirmado
) {
}
