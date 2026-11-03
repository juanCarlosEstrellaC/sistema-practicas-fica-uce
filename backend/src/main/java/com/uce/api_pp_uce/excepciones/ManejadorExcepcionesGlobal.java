package com.uce.api_pp_uce.excepciones;

import com.uce.api_pp_uce.common.RespuestaApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class ManejadorExcepcionesGlobal {

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<RespuestaApi<Void>> manejarAccesoDenegadoException(AccessDeniedException ex) {
        log.warn("Acceso denegado: {}", ex.getMessage());
        String mensajeOriginal = ex.getMessage() != null ? ex.getMessage().trim() : "";
        boolean esMensajeGenerico = mensajeOriginal.isBlank()
                || mensajeOriginal.equalsIgnoreCase("Access Denied")
                || mensajeOriginal.equalsIgnoreCase("Access is denied")
                || mensajeOriginal.equalsIgnoreCase("Access Denied.")
                || mensajeOriginal.equalsIgnoreCase("Access is denied.")
                || mensajeOriginal.equalsIgnoreCase("Authorization Denied")
                || mensajeOriginal.equalsIgnoreCase("Authorization Denied.")
                || mensajeOriginal.toLowerCase().startsWith("access denied")
                || mensajeOriginal.toLowerCase().startsWith("access is denied")
                || mensajeOriginal.toLowerCase().startsWith("authorization denied");
        String mensaje = esMensajeGenerico
                ? "No tiene permisos para acceder a este recurso."
                : ex.getMessage();
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new RespuestaApi<>(false, mensaje, null));
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<RespuestaApi<Void>> manejarRecursoNoEncontradoException(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND) //404 Not Found
                .body(new RespuestaApi<>(false, ex.getMessage(), null));
    }

    @ExceptionHandler({NegocioException.class, IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<RespuestaApi<Void>> manejarNegocioException(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) //400 Bad Request
                .body(new RespuestaApi<>(false, ex.getMessage(), null));
    }

    @ExceptionHandler({CredencialesInvalidasException.class, BadCredentialsException.class})
    public ResponseEntity<RespuestaApi<Void>> manejarCredencialesInvalidasException(Exception ex) {
        String mensaje = ex instanceof CredencialesInvalidasException ? ex.getMessage() : "Correo o contraseña incorrectos";
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED) //401 Unauthorized
                .body(new RespuestaApi<>(false, mensaje, null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaApi<Map<String, String>>> manejarValidacionesException(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.put(error.getField(), error.getDefaultMessage())
        );
        String mensajeGeneral = errores.values().stream().findFirst().orElse("Error de validación en los campos enviados.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) //400 Bad Request
                .body(new RespuestaApi<>(false, mensajeGeneral, errores));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RespuestaApi<Void>> manejarViolacionIntegridadDatos(DataIntegrityViolationException ex) {
        log.warn("Violacion de integridad de datos: {}", ex.getMessage());
        String mensaje = "Conflicto de integridad en los datos enviados. Es posible que el registro ya exista o viole una restricción.";
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("duplicate key")) {
            mensaje = "El registro ya existe con los datos proporcionados (identificación o correo duplicado).";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new RespuestaApi<>(false, mensaje, null));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RespuestaApi<Void>> manejarPeticionNoLegible(HttpMessageNotReadableException ex) {
        log.warn("Formato de peticion no legible: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new RespuestaApi<>(false, "El cuerpo de la solicitud no tiene un formato JSON válido o contiene valores incompatibles.", null));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<RespuestaApi<Void>> manejarMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        log.warn("Parámetro de solicitud incompatible: {} = {}", ex.getName(), ex.getValue());
        String nombreParametro = ex.getName() != null ? ex.getName() : "desconocido";
        String valorInvalido = String.valueOf(ex.getValue());
        String mensaje = "El parámetro '" + nombreParametro + "' tiene un valor incompatible: " + valorInvalido;
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new RespuestaApi<>(false, mensaje, null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<RespuestaApi<Void>> manejarMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new RespuestaApi<>(false, "El archivo supera el tamaño máximo permitido (máximo 10 MB por archivo).", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaApi<Void>> manejarExcepcionGeneral(Exception ex) {
        log.error("Error no controlado en el servidor: ", ex); 
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) //500 Internal Server Error
                .body(new RespuestaApi<>(false, "Ocurrió un error interno en el servidor. Por favor, intente más tarde.", null));
    }
}

