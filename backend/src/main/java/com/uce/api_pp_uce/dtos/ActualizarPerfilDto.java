package com.uce.api_pp_uce.dtos;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarPerfilDto(
    @Size(max = 20, message = "El telefono no puede exceder los 20 caracteres")
    @Pattern(regexp = "^$|^[0-9+()\\s-]+$", message = "El formato del telefono no es valido")
    String telefono
) {
}
