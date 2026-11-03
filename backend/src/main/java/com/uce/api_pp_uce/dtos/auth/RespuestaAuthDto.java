package com.uce.api_pp_uce.dtos.auth;

import com.uce.api_pp_uce.dtos.UsuarioDto;

public record RespuestaAuthDto(
    String token,
    UsuarioDto usuario
) {
}
