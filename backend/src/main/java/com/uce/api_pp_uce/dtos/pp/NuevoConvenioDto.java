package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NuevoConvenioDto(
    @NotBlank(message = "El nombre de la institución es obligatorio")
    String institucion,

    @NotNull(message = "El tipo de convenio es obligatorio")
    TipoConvenio tipo,

    BigDecimal campoEspecifico,

    String direccion,

    @NotNull(message = "La fecha de inicio es obligatoria")
    LocalDate fechaInicio,

    @NotNull(message = "La fecha de fin es obligatoria")
    LocalDate fechaFin,

    String tutorInstitucional,

    String correoTutor,

    String telefonoTutor,

    @Min(value = 0, message = "Los cupos disponibles deben ser mayores o iguales a 0")
    @Max(value = 1000, message = "Los cupos disponibles no pueden superar 1000")
    Integer cuposDisponibles,

    String urlDocumento,

    String nombreDocumento,

    EstadoConvenio estado
) {}
