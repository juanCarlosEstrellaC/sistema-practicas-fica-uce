package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;

import java.time.LocalDateTime;

public record ObservacionDto(
        Long id,
        UsuarioResumenDto remitente,
        Long remitenteId,
        Integer carreraId,
        String carreraNombre,
        Long convenioId,
        String empresa,
        TipoObservacion tipo,
        String contacto,
        String correo,
        String descripcion,
        EstadoObservacion estado,
        LocalDateTime fecha
) {}
