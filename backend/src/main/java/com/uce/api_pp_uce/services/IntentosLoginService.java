package com.uce.api_pp_uce.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IntentosLoginService {

    private static final int MAX_INTENTOS = 5;
    private static final int TIEMPO_BLOQUEO_MINUTOS = 15;
    private static final int MAX_ENTRADAS_CACHE = 10_000;

    // Usar un mapa concurrente para guardar los intentos en memoria de forma segura y rapida
    private final ConcurrentHashMap<String, DetallesIntento> cacheIntentos = new ConcurrentHashMap<>();
    private final Object cerrojoCache = new Object();

    public void loginExitoso(String correo) {
        if (correo == null) {
            return;
        }
        cacheIntentos.remove(normalizarCorreo(correo));
    }

    public void loginFallido(String correo) {
        if (correo == null) {
            return;
        }
        String clave = normalizarCorreo(correo);
        if (!cacheIntentos.containsKey(clave) && cacheIntentos.size() >= MAX_ENTRADAS_CACHE) {
            synchronized (cerrojoCache) {
                if (cacheIntentos.size() >= MAX_ENTRADAS_CACHE) {
                    cacheIntentos.entrySet().removeIf(entrada -> entrada.getValue().expirado());
                    if (cacheIntentos.size() >= MAX_ENTRADAS_CACHE) {
                        cacheIntentos.entrySet().removeIf(entrada -> entrada.getValue().getBloqueadoHasta() == null);
                    }
                    if (cacheIntentos.size() >= MAX_ENTRADAS_CACHE && !cacheIntentos.containsKey(clave)) {
                        return;
                    }
                }
            }
        }
        cacheIntentos.compute(clave, (k, actual) -> {
            DetallesIntento intento = (actual == null || actual.expirado()) ? new DetallesIntento() : actual;
            intento.incrementarIntentos();
            if (intento.getIntentos() >= MAX_INTENTOS) {
                intento.setBloqueadoHasta(LocalDateTime.now().plusMinutes(TIEMPO_BLOQUEO_MINUTOS));
            }
            return intento;
        });
    }

    public int getIntentosRestantes(String correo) {
        if (correo == null) {
            return MAX_INTENTOS;
        }
        DetallesIntento intento = cacheIntentos.get(normalizarCorreo(correo));
        if (intento == null || intento.expirado()) {
            return MAX_INTENTOS;
        }
        return Math.max(0, MAX_INTENTOS - intento.getIntentos());
    }

    public boolean estaBloqueado(String correo) {
        if (correo == null) {
            return false;
        }
        String clave = normalizarCorreo(correo);
        DetallesIntento intento = cacheIntentos.get(clave);
        if (intento == null) {
            return false;
        }

        if (intento.expirado()) {
            cacheIntentos.remove(clave);
            return false;
        }

        return intento.getBloqueadoHasta() != null;
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }

    // Clase interna para llevar el registro por cuenta
    private static class DetallesIntento {
        private int intentos = 0;
        private LocalDateTime ultimoIntento = null;
        private LocalDateTime bloqueadoHasta = null;

        public synchronized void incrementarIntentos() {
            this.intentos++;
            this.ultimoIntento = LocalDateTime.now();
        }

        public synchronized int getIntentos() {
            return intentos;
        }

        public synchronized LocalDateTime getBloqueadoHasta() {
            return bloqueadoHasta;
        }

        public synchronized void setBloqueadoHasta(LocalDateTime bloqueadoHasta) {
            this.bloqueadoHasta = bloqueadoHasta;
        }

        public synchronized boolean expirado() {
            LocalDateTime ahora = LocalDateTime.now();
            if (bloqueadoHasta != null) {
                return ahora.isAfter(bloqueadoHasta);
            }
            return ultimoIntento != null && ahora.isAfter(ultimoIntento.plusMinutes(TIEMPO_BLOQUEO_MINUTOS));
        }
    }
}
