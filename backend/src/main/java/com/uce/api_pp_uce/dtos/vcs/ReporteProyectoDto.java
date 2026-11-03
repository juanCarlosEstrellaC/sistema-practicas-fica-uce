package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;

import java.time.LocalDateTime;

public record ReporteProyectoDto(
    Long id,
    Long proyectoId,
    String nombreProyecto,
    Long periodoId,
    String nombrePeriodo,
    Long coordinadorId,
    String nombreCoordinador,
    TipoReporteProyectoVcs tipo,
    String nombreArchivo,
    String urlArchivo,
    EstadoRevisionVcs estadoSubdecanato,
    String observaciones,
    LocalDateTime fechaSubida,
    LocalDateTime fechaRevision
) {
}
