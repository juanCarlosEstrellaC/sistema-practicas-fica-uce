package com.uce.api_pp_uce.excepciones;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.uce.api_pp_uce.common.RespuestaApi;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ManejadorExcepcionesGlobalTest {

    private ManejadorExcepcionesGlobal manejadorExcepciones;

    @BeforeEach
    void inicializar() {
        manejadorExcepciones = new ManejadorExcepcionesGlobal();
    }

    @Test
    void testManejarMaxUploadSizeExceededException() {
        long tamanioMaximoPermitido = 10 * 1024 * 1024L; // 10 MB
        MaxUploadSizeExceededException excepcion = new MaxUploadSizeExceededException(tamanioMaximoPermitido);

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarMaxUploadSizeExceededException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("El archivo supera el tamaño máximo permitido (máximo 10 MB por archivo).", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAccessDeniedExceptionGenerica() {
        AccessDeniedException excepcion = new AccessDeniedException("Access Denied");

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("No tiene permisos para acceder a este recurso.", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAccessDeniedExceptionGenericaConAccessIsDenied() {
        AccessDeniedException excepcion = new AccessDeniedException("Access is denied");

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("No tiene permisos para acceder a este recurso.", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAccessDeniedExceptionConMensajePersonalizado() {
        AccessDeniedException excepcion = new AccessDeniedException("Acceso restringido a administradores de carrera");

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("Acceso restringido a administradores de carrera", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAuthorizationDeniedException() {
        AuthorizationDeniedException excepcion = new AuthorizationDeniedException("Access Denied");

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("No tiene permisos para acceder a este recurso.", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAuthorizationDeniedExceptionConMensajeAuthorizationDenied() {
        AuthorizationDeniedException excepcion = new AuthorizationDeniedException("Authorization Denied");

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("No tiene permisos para acceder a este recurso.", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarAccessDeniedExceptionConMensajeNulo() {
        AccessDeniedException excepcion = new AccessDeniedException(null);

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarAccesoDenegadoException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.FORBIDDEN, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("No tiene permisos para acceder a este recurso.", respuesta.getBody().mensaje());
    }

    @Test
    void testManejarMethodArgumentTypeMismatchException() {
        MethodArgumentTypeMismatchException excepcion = new MethodArgumentTypeMismatchException(
                "VALOR_INVALIDO", Long.class, "estudianteId", null, null);

        ResponseEntity<RespuestaApi<Void>> respuesta = manejadorExcepciones.manejarMethodArgumentTypeMismatchException(excepcion);

        assertNotNull(respuesta);
        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertFalse(respuesta.getBody().exito());
        assertEquals("El parámetro 'estudianteId' tiene un valor incompatible: VALOR_INVALIDO", respuesta.getBody().mensaje());
    }
}
