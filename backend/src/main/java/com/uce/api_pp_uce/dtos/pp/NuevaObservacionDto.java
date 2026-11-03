package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NuevaObservacionDto(
        @NotNull(message = "El ID del remitente es obligatorio")
        Long remitenteId,

        Integer carreraId,

        @NotNull(message = "El tipo de observación es obligatorio")
        TipoObservacion tipo,

        String empresa,

        String contacto,

        String correo,

        @NotBlank(message = "La descripción de la observación es obligatoria")
        String descripcion
) {}
