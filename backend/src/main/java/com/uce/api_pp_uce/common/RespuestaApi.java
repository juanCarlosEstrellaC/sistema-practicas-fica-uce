package com.uce.api_pp_uce.common;

public record RespuestaApi<T>(
    boolean exito,
    String mensaje,
    T data
) {
}
