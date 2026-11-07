package com.uce.api_pp_uce.common;

import com.uce.api_pp_uce.excepciones.NegocioException;
import jakarta.servlet.http.HttpServletRequest;
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

    public static String obtenerIpCliente(HttpServletRequest request) {
        if (request == null) {
            return "desconocida";
        }
        String ip = request.getHeader("CF-Connecting-IP");
        if (ip == null || ip.isBlank()) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                ip = forwarded.split(",")[0].trim();
            }
        }
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        return ip != null ? ip : "desconocida";
    }
}
