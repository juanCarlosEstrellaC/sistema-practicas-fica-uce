package com.uce.api_pp_uce.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record CambiarContraseniaDto(
    @NotBlank(message = "La contraseña actual es obligatoria")
    String contraseniaActual,

    @NotBlank(message = "La nueva contraseña es obligatoria")
    String nuevaContrasenia
) {
}
