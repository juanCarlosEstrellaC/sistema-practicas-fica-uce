package com.uce.api_pp_uce.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OlvidoContraseniaDto(
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato de correo es inválido")
    String correo
) {
}
