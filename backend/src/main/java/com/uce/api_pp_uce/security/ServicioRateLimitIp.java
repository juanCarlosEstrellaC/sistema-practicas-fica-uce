package com.uce.api_pp_uce.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class ServicioRateLimitIp {

    public enum ResultadoRecuperacion {
        PERMITIDO,
        LIMITE_IP,
        LIMITE_CORREO
    }

    private static final int CAPACIDAD_DEFAULT_LOGIN = 30;
    private static final long INTERVALO_LOGIN_MS = 60_000L; // 1 minuto

    // Para recuperacion de contrasenia: maximo 15 por IP y 3 por correo cada 15 minutos
    private static final long INTERVALO_RECUPERACION_MS = 15 * 60_000L; // 15 minutos
    private static final int CAPACIDAD_RECUPERACION_IP = 15;
    private static final int CAPACIDAD_RECUPERACION_CORREO = 3;
    private static final int MAX_ENTRADAS_CACHE = 10_000;

    private final ConcurrentHashMap<String, CubetaTokens> cubetas = new ConcurrentHashMap<>();
    private final Object cerrojoCache = new Object();

    public boolean intentarConsumirLoginIp(String ip) {
        return intentarConsumir("login:ip:" + normalizarIp(ip), CAPACIDAD_DEFAULT_LOGIN, INTERVALO_LOGIN_MS);
    }

    public boolean intentarConsumirRecuperacionIp(String ip) {
        return intentarConsumir("recuperacion:ip:" + normalizarIp(ip), CAPACIDAD_RECUPERACION_IP, INTERVALO_RECUPERACION_MS);
    }

    public boolean intentarConsumirRecuperacionCorreo(String correo) {
        return intentarConsumir("recuperacion:correo:" + normalizarCorreo(correo), CAPACIDAD_RECUPERACION_CORREO, INTERVALO_RECUPERACION_MS);
    }

    public synchronized ResultadoRecuperacion intentarConsumirRecuperacion(String ip, String correo) {
        CubetaTokens cubetaIp = obtenerOCrearCubeta(
                "recuperacion:ip:" + normalizarIp(ip),
                CAPACIDAD_RECUPERACION_IP,
                INTERVALO_RECUPERACION_MS
        );
        if (cubetaIp == null || !cubetaIp.tieneDisponible()) {
            return ResultadoRecuperacion.LIMITE_IP;
        }

        CubetaTokens cubetaCorreo = obtenerOCrearCubeta(
                "recuperacion:correo:" + normalizarCorreo(correo),
                CAPACIDAD_RECUPERACION_CORREO,
                INTERVALO_RECUPERACION_MS
        );
        if (cubetaCorreo == null || !cubetaCorreo.tieneDisponible()) {
            return ResultadoRecuperacion.LIMITE_CORREO;
        }

        cubetaIp.intentarConsumir();
        cubetaCorreo.intentarConsumir();
        return ResultadoRecuperacion.PERMITIDO;
    }

    private String normalizarIp(String ip) {
        return ip != null && !ip.isBlank() ? ip.trim() : "desconocida";
    }

    private String normalizarCorreo(String correo) {
        return correo != null && !correo.isBlank() ? correo.trim().toLowerCase() : "desconocido";
    }

    public boolean intentarConsumir(String clave, int capacidad, long intervaloRecargaMs) {
        CubetaTokens cubeta = obtenerOCrearCubeta(clave, capacidad, intervaloRecargaMs);
        return cubeta != null && cubeta.intentarConsumir();
    }

    private CubetaTokens obtenerOCrearCubeta(String clave, int capacidad, long intervaloRecargaMs) {
        CubetaTokens cubeta = cubetas.get(clave);
        if (cubeta == null) {
            if (cubetas.size() >= MAX_ENTRADAS_CACHE) {
                synchronized (cerrojoCache) {
                    if (cubetas.size() >= MAX_ENTRADAS_CACHE) {
                        limpiarCubetasInactivas();
                        if (cubetas.size() >= MAX_ENTRADAS_CACHE && !cubetas.containsKey(clave)) {
                            return null;
                        }
                    }
                }
            }
            cubeta = cubetas.computeIfAbsent(clave, k -> new CubetaTokens(capacidad, intervaloRecargaMs));
        }
        return cubeta;
    }

    private void limpiarCubetasInactivas() {
        long ahora = System.currentTimeMillis();
        cubetas.entrySet().removeIf(entrada -> entrada.getValue().estaInactiva(ahora));
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

        public synchronized boolean tieneDisponible() {
            reabastecer();
            return tokens >= 1.0;
        }

        public synchronized boolean intentarConsumir() {
            reabastecer();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        public synchronized boolean estaInactiva(long ahora) {
            return ahora - ultimoReabastecimiento >= intervaloRecargaMs;
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
