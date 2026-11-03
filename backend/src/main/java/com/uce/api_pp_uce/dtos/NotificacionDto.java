package com.uce.api_pp_uce.dtos;

import com.uce.api_pp_uce.enums.TipoNotificacion;

public record NotificacionDto(
    Long usuarioId,
    String titulo,
    String mensaje,
    TipoNotificacion tipo,
    String accionUrl
) {}
