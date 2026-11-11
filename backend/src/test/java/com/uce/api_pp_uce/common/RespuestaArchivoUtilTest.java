package com.uce.api_pp_uce.common;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class RespuestaArchivoUtilTest {

    @Test
    @DisplayName("Debe construir respuesta inline correctamente para previsualizacion")
    void previsualizar_Exitoso() {
        byte[] contenido = new byte[]{1, 2, 3};
        ArchivoDescargaDto dto = new ArchivoDescargaDto(contenido, "documento.pdf", "application/pdf");

        ResponseEntity<byte[]> respuesta = RespuestaArchivoUtil.previsualizar(dto);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isEqualTo(contenido);
        assertThat(respuesta.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(respuesta.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .isEqualTo("inline; filename=\"documento.pdf\"");
    }

    @Test
    @DisplayName("Debe construir respuesta attachment correctamente para descarga")
    void descargar_Exitoso() {
        byte[] contenido = new byte[]{4, 5, 6};
        ArchivoDescargaDto dto = new ArchivoDescargaDto(contenido, "matriz.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        ResponseEntity<byte[]> respuesta = RespuestaArchivoUtil.descargar(dto);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).isEqualTo(contenido);
        assertThat(respuesta.getHeaders().getContentType().toString())
                .isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(respuesta.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .isEqualTo("attachment; filename=\"matriz.xlsx\"");
    }

    @Test
    @DisplayName("Debe retornar NoContent cuando el DTO de descarga es nulo")
    void construirRespuesta_DtoNulo_RetornaNoContent() {
        ResponseEntity<byte[]> respuesta = RespuestaArchivoUtil.previsualizar(null);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(respuesta.getBody()).isNull();
    }

    @Test
    @DisplayName("Debe manejar contentType invalido o vacio usando valores por defecto")
    void construirRespuesta_ContentTypeInvalido_UsaFallback() {
        byte[] contenido = new byte[]{7, 8};
        ArchivoDescargaDto dto = new ArchivoDescargaDto(contenido, null, "tipo/invalido/formato");

        ResponseEntity<byte[]> respuesta = RespuestaArchivoUtil.descargar(dto);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(respuesta.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .isEqualTo("attachment; filename=\"archivo\"");
    }
}
