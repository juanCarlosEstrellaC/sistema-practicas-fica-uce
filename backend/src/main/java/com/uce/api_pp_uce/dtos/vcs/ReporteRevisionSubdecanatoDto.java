package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import jakarta.validation.constraints.NotNull;

public record ReporteRevisionSubdecanatoDto(
    @NotNull(message = "El estado de revisión es obligatorio")
    EstadoRevisionVcs estadoSubdecanato,

    String observaciones
) {
}
