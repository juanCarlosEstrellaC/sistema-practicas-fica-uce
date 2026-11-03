package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ConvenioDto(
    Long id,
    String institucion,
    TipoConvenio tipo,
    BigDecimal campoEspecifico,
    String direccion,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    EstadoConvenio estado,
    Integer cuposDisponibles,
    String tutorInstitucional,
    String correoTutor,
    String telefonoTutor,
    String urlDocumento,
    String nombreDocumento,
    Integer ocupados
) {
}
