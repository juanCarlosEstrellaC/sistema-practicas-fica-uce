package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;

public record ResultadoAprobacionHorasDto(
    Long asignacionId,
    EstadoAsignacionVcs estadoAsignacion,
    FaseActualAsignacion faseActual,
    Integer horasAprobadas,
    Integer horasAcumuladas,
    Integer horasRequeridas,
    EstadoProcesoVcs estadoProceso,
    Boolean procesoCulminado,
    String mensaje
) {
}
