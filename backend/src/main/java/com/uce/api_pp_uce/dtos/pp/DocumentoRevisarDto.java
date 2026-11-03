package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.EstadoDocumento;

public record DocumentoRevisarDto(
    EstadoDocumento estado,
    String observacion
) {}
