package com.uce.api_pp_uce.controllers.auth;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.common.Utilitarios;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.OlvidoContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.RespuestaAuthDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.security.ServicioRateLimitIp;
import com.uce.api_pp_uce.services.auth.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ServicioRateLimitIp servicioRateLimitIp;

    @PostMapping("/login")
    public ResponseEntity<RespuestaApi<RespuestaAuthDto>> login(
            @Valid @RequestBody LoginDto peticion,
            HttpServletRequest request) {
        String ipCliente = Utilitarios.obtenerIpCliente(request);
        if (!servicioRateLimitIp.intentarConsumirLogin(ipCliente, peticion.correo())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", "60")
                    .body(new RespuestaApi<>(false, "Demasiados intentos de inicio de sesión para esta cuenta. Por favor espere 1 minuto.", null));
        }
        RespuestaAuthDto respuestaAuth = authService.login(peticion);
        servicioRateLimitIp.reiniciarLogin(ipCliente, peticion.correo());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Inicio de sesión exitoso", respuestaAuth));
    }

    @PostMapping("/olvido-contrasenia")
    public ResponseEntity<RespuestaApi<Void>> olvidoContrasenia(
            @Valid @RequestBody OlvidoContraseniaDto peticion) {
        if (!servicioRateLimitIp.intentarConsumirRecuperacionCorreo(peticion.correo())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new RespuestaApi<>(false, "Demasiadas solicitudes de recuperación para este correo. Por favor intente más tarde.", null));
        }

        authService.solicitarRestaurarContrasenia(peticion.correo());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Si el correo coincide con una cuenta activa, recibirás un mensaje con las instrucciones.", null));
    }

    @PostMapping("/restaurar-contrasenia")
    public ResponseEntity<RespuestaApi<Void>> restaurarContrasenia(@Valid @RequestBody RestaurarContraseniaDto peticion) {
        authService.restaurarContrasenia(peticion);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Contraseña actualizada exitosamente", null));
    }

    @PostMapping("/activar-cuenta")
    public ResponseEntity<RespuestaApi<Void>> activarCuenta(@Valid @RequestBody RestaurarContraseniaDto peticion) {
        authService.activarCuenta(peticion);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Cuenta activada exitosamente", null));
    }
}
