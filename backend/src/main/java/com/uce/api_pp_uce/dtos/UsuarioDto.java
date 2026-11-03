package com.uce.api_pp_uce.dtos;

import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioDto(
    Long id,
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato valido")
    String correo,
    @NotBlank(message = "Los nombres son obligatorios")
    String nombres,
    @NotBlank(message = "Los apellidos son obligatorios")
    String apellidos,
    @NotBlank(message = "La identificacion es obligatoria")
    String identificacion,
    TipoIdentificacionUsuario tipoIdentificacion,
    @NotNull(message = "El rol es obligatorio")
    RolUsuario rol,
    Integer carreraId,
    String telefono,
    String urlAvatar,
    EstadoUsuario estado,
    Integer horasRequeridas,
    Integer horasAcumuladas
) {
}
