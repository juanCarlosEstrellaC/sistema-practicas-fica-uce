package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;

import java.time.LocalDateTime;

public record MatrizCacesDto(
        Long id,
        Long periodoAcademicoId,
        String periodoNombre,
        Integer carreraId,
        String carreraNombre,
        String carreraCodigo,
        EstadoMatrizCaces estado,
        LocalDateTime fechaGeneracion,
        String archivoFirmadoUrl,
        String observacion
) {
    public MatrizCacesDto(
            Long id,
            Long periodoAcademicoId,
            Integer carreraId,
            String carreraNombre,
            String carreraCodigo,
            EstadoMatrizCaces estado,
            LocalDateTime fechaGeneracion,
            String archivoFirmadoUrl,
            String observacion
    ) {
        this(id, periodoAcademicoId, null, carreraId, carreraNombre, carreraCodigo, estado, fechaGeneracion, archivoFirmadoUrl, observacion);
    }
}
