package com.uce.api_pp_uce.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record RestaurarContraseniaDto(
    @NotBlank(message = "El token es obligatorio")
    String token,

    @NotBlank(message = "La nueva contraseña es obligatoria")
    String nuevaContrasenia
) {
}
