package com.uce.api_pp_uce.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IntentosLoginService {

    private final int MAX_INTENTOS = 5;
    private final int TIEMPO_BLOQUEO_MINUTOS = 15;

    // Usar un mapa concurrente para guardar los intentos en memoria de forma segura y rápida
    private ConcurrentHashMap<String, DetallesIntento> cacheIntentos = new ConcurrentHashMap<>();

    public void loginExitoso(String correo) {
        cacheIntentos.remove(correo);
    }

    public void loginFallido(String correo) {
        DetallesIntento intento = cacheIntentos.getOrDefault(correo, new DetallesIntento());
        intento.incrementarIntentos();
        
        if (intento.getIntentos() >= MAX_INTENTOS) {
            intento.setBloqueadoHasta(LocalDateTime.now().plusMinutes(TIEMPO_BLOQUEO_MINUTOS));
        }
        
        cacheIntentos.put(correo, intento);
    }

    public int getIntentosRestantes(String correo) {
        DetallesIntento intento = cacheIntentos.get(correo);
        if (intento == null) {
            return MAX_INTENTOS;
        }
        return Math.max(0, MAX_INTENTOS - intento.getIntentos());
    }

    public boolean estaBloqueado(String correo) {
        DetallesIntento intento = cacheIntentos.get(correo);
        if (intento == null) {
            return false;
        }
        
        if (intento.getBloqueadoHasta() != null) {
            if (LocalDateTime.now().isAfter(intento.getBloqueadoHasta())) {
                cacheIntentos.remove(correo); // El tiempo de bloqueo ya pasó
                return false;
            }
            return true; // Sigue bloqueado
        }
        
        return false;
    }

    // Clase interna para llevar el registro
    private static class DetallesIntento {
        private int intentos = 0;
        private LocalDateTime bloqueadoHasta = null;

        public void incrementarIntentos() {
            this.intentos++;
        }

        public int getIntentos() {
            return intentos;
        }

        public LocalDateTime getBloqueadoHasta() {
            return bloqueadoHasta;
        }

        public void setBloqueadoHasta(LocalDateTime bloqueadoHasta) {
            this.bloqueadoHasta = bloqueadoHasta;
        }
    }
}
