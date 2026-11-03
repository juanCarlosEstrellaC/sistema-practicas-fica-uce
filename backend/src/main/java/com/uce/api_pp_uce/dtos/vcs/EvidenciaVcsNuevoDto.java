package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EvidenciaVcsNuevoDto(
    @NotNull(message = "El ID de la asignación es obligatorio")
    Long asignacionId,

    @NotNull(message = "El tipo de documento es obligatorio")
    TipoDocumentoVcs tipoDocumento,

    @NotBlank(message = "El nombre del archivo es obligatorio")
    String nombreArchivo,

    @NotBlank(message = "La URL del archivo es obligatoria")
    String urlArchivo,

    Integer horasReportadas
) {
}
