package com.uce.api_pp_uce.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class ServicioRateLimitIp {

    private static final int CAPACIDAD_DEFAULT_LOGIN = 5;
    private static final long INTERVALO_LOGIN_MS = 60_000L; // 1 minuto

    // Para recuperacion de contrasenia: maximo 5 por IP y 3 por correo cada 15 minutos
    private static final long INTERVALO_RECUPERACION_MS = 15 * 60_000L; // 15 minutos
    private static final int CAPACIDAD_RECUPERACION_IP = 5;
    private static final int CAPACIDAD_RECUPERACION_CORREO = 3;

    private final ConcurrentHashMap<String, CubetaTokens> cubetas = new ConcurrentHashMap<>();

    public boolean intentarConsumir(String ip) {
        return intentarConsumir("login:ip:" + ip, CAPACIDAD_DEFAULT_LOGIN, INTERVALO_LOGIN_MS);
    }

    public boolean intentarConsumirRecuperacionIp(String ip) {
        return intentarConsumir("recuperacion:ip:" + ip, CAPACIDAD_RECUPERACION_IP, INTERVALO_RECUPERACION_MS);
    }

    public boolean intentarConsumirRecuperacionCorreo(String correo) {
        String correoLimpio = correo != null ? correo.trim().toLowerCase() : "desconocido";
        return intentarConsumir("recuperacion:correo:" + correoLimpio, CAPACIDAD_RECUPERACION_CORREO, INTERVALO_RECUPERACION_MS);
    }

    public boolean intentarConsumir(String clave, int capacidad, long intervaloRecargaMs) {
        CubetaTokens cubeta = cubetas.computeIfAbsent(clave, k -> new CubetaTokens(capacidad, intervaloRecargaMs));
        return cubeta.intentarConsumir();
    }

    private static class CubetaTokens {
        private final int capacidad;
        private final long intervaloRecargaMs;
        private double tokens;
        private long ultimoReabastecimiento;

        public CubetaTokens(int capacidad, long intervaloRecargaMs) {
            this.capacidad = capacidad;
            this.intervaloRecargaMs = intervaloRecargaMs;
            this.tokens = capacidad;
            this.ultimoReabastecimiento = System.currentTimeMillis();
        }

        public synchronized boolean intentarConsumir() {
            reabastecer();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void reabastecer() {
            long ahora = System.currentTimeMillis();
            long tiempoTranscurrido = ahora - ultimoReabastecimiento;
            if (tiempoTranscurrido > 0) {
                double tokensAAgregar = ((double) tiempoTranscurrido * capacidad) / intervaloRecargaMs;
                tokens = Math.min(capacidad, tokens + tokensAAgregar);
                ultimoReabastecimiento = ahora;
            }
        }
    }
}
