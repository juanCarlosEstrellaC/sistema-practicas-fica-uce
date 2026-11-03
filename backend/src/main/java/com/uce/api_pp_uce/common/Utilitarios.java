package com.uce.api_pp_uce.common;

import com.uce.api_pp_uce.excepciones.NegocioException;
import java.time.LocalDate;

public final class Utilitarios {

    private Utilitarios() {
        // Constructor privado para evitar instanciacion
    }

    public static void validarRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio != null && fechaFin != null && fechaFin.isBefore(fechaInicio)) {
            throw new NegocioException("La fecha de finalización debe ser posterior o igual a la fecha de inicio.");
        }
    }
}
