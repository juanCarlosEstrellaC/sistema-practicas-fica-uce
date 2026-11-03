package com.uce.api_pp_uce.excepciones;

public class NegocioException extends RuntimeException {
    public NegocioException(String mensaje) {
        super(mensaje);
    }
}
