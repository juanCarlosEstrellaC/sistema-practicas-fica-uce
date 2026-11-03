package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;

import java.time.LocalDateTime;

public record DocumentoPortafolioDto(
    Long id,
    Long estudianteId,
    Long asignacionId,
    TipoDocumento tipo,
    String nombre,
    String url,
    Boolean firmado,
    EstadoDocumento estado,
    String observacion,
    LocalDateTime fechaSubida
) {}
