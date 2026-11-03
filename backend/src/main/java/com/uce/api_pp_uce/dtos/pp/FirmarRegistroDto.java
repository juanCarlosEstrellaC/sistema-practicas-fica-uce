package com.uce.api_pp_uce.dtos.pp;

import java.time.LocalDate;

public record FirmarRegistroDto(
        String urlInforme,
        String urlCertificado,
        String urlSeguimiento,
        LocalDate fechaFin
) {}
