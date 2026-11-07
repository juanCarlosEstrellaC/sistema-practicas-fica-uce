package com.uce.api_pp_uce.dtos;

public record ArchivoDescargaDto(
        byte[] contenido,
        String nombreArchivo,
        String contentType
) {
}

