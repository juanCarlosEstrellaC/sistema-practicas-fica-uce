package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.TipoDocumento;

public record DocumentoSubirDto(
    Long estudianteId,
    TipoDocumento tipo,
    String url,
    String nombre
) {}
