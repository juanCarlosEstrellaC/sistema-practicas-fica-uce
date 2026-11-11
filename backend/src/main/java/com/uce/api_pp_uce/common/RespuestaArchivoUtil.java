package com.uce.api_pp_uce.common;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;

public final class RespuestaArchivoUtil {

    private RespuestaArchivoUtil() {
        // Constructor privado para evitar instanciacion
    }

    public static ResponseEntity<byte[]> previsualizar(ArchivoDescargaDto descarga) {
        return construirRespuesta(descarga, false);
    }

    public static ResponseEntity<byte[]> descargar(ArchivoDescargaDto descarga) {
        return construirRespuesta(descarga, true);
    }

    public static ResponseEntity<byte[]> construirRespuesta(ArchivoDescargaDto descarga, boolean forzarDescarga) {
        if (descarga == null) {
            return ResponseEntity.noContent().build();
        }
        return construirRespuesta(descarga.contenido(), descarga.nombreArchivo(), descarga.contentType(), forzarDescarga);
    }

    public static ResponseEntity<byte[]> construirRespuesta(byte[] bytes, String nombreArchivo, String contentType, boolean forzarDescarga) {
        HttpHeaders headers = new HttpHeaders();
        MediaType mediaType = MediaType.APPLICATION_PDF;

        if (contentType != null && !contentType.isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (Exception ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        String nombreFinal = (nombreArchivo != null && !nombreArchivo.isBlank()) ? nombreArchivo : "archivo";
        ContentDisposition.Builder dispositionBuilder = forzarDescarga
                ? ContentDisposition.attachment()
                : ContentDisposition.inline();
        boolean esSoloAscii = nombreFinal.chars().allMatch(c -> c < 128);
        ContentDisposition disposition = (esSoloAscii
                ? dispositionBuilder.filename(nombreFinal)
                : dispositionBuilder.filename(nombreFinal, StandardCharsets.UTF_8))
                .build();

        headers.setContentType(mediaType);
        headers.setContentDisposition(disposition);

        return new ResponseEntity<>(bytes != null ? bytes : new byte[0], headers, HttpStatus.OK);
    }
}
