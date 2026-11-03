package com.uce.api_pp_uce.controllers.auth;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.OlvidoContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.RespuestaAuthDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.services.auth.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/login")
    public ResponseEntity<RespuestaApi<RespuestaAuthDto>> login(@Valid @RequestBody LoginDto peticion) {
        RespuestaAuthDto respuestaAuth = authService.login(peticion);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Inicio de sesión exitoso", respuestaAuth));
    }

    @PostMapping("/olvido-contrasenia")
    public ResponseEntity<RespuestaApi<Void>> olvidoContrasenia(@Valid @RequestBody OlvidoContraseniaDto peticion) {
        authService.solicitarRestaurarContrasenia(peticion.correo());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Se ha enviado un correo con las instrucciones", null));
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
