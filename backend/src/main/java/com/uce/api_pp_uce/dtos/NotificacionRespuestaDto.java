package com.uce.api_pp_uce.dtos;

import com.uce.api_pp_uce.enums.TipoNotificacion;

import java.time.LocalDateTime;

public record NotificacionRespuestaDto(
        Long id,
        Long usuarioId,
        String titulo,
        String mensaje,
        TipoNotificacion tipo,
        String accionUrl,
        Boolean leida,
        LocalDateTime fecha
) {}
