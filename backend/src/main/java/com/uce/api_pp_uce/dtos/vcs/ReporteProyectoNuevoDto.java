package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReporteProyectoNuevoDto(
    @NotNull(message = "El ID del proyecto es obligatorio")
    Long proyectoId,

    @NotNull(message = "El ID del periodo académico es obligatorio")
    Long periodoId,

    @NotNull(message = "El tipo de reporte es obligatorio")
    TipoReporteProyectoVcs tipo,

    @NotBlank(message = "El nombre del archivo es obligatorio")
    String nombreArchivo,

    @NotBlank(message = "La URL del archivo es obligatoria")
    String urlArchivo
) {
}
