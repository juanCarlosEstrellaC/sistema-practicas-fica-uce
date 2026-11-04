package com.uce.api_pp_uce.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class ServicioRateLimitIp {

    private static final int CAPACIDAD_MAXIMA = 5;
    private static final long INTERVALO_RECARGA_MS = 60_000L; // 1 minuto para reponer las fichas

    private final ConcurrentHashMap<String, CubetaTokens> cubetas = new ConcurrentHashMap<>();

    public boolean intentarConsumir(String ip) {
        CubetaTokens cubeta = cubetas.computeIfAbsent(ip, k -> new CubetaTokens(CAPACIDAD_MAXIMA));
        return cubeta.intentarConsumir();
    }

    private static class CubetaTokens {
        private final int capacidad;
        private double tokens;
        private long ultimoReabastecimiento;

        public CubetaTokens(int capacidad) {
            this.capacidad = capacidad;
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
                double tokensAAgregar = ((double) tiempoTranscurrido * capacidad) / INTERVALO_RECARGA_MS;
                tokens = Math.min(capacidad, tokens + tokensAAgregar);
                ultimoReabastecimiento = ahora;
            }
        }
    }
}
