package com.uce.api_pp_uce.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IntentosLoginServiceTest {

    private IntentosLoginService intentosLoginService;

    @BeforeEach
    void setUp() {
        intentosLoginService = new IntentosLoginService();
    }

    @Test
    void testLoginExitosoReseteaIntentos() {
        String correo = "test@uce.edu.ec";
        intentosLoginService.loginFallido(correo);
        intentosLoginService.loginFallido(correo);
        
        assertEquals(3, intentosLoginService.getIntentosRestantes(correo));
        
        intentosLoginService.loginExitoso(correo);
        
        assertEquals(5, intentosLoginService.getIntentosRestantes(correo));
        assertFalse(intentosLoginService.estaBloqueado(correo));
    }

    @Test
    void testLoginFallidoDecrementaIntentos() {
        String correo = "test@uce.edu.ec";
        intentosLoginService.loginFallido(correo);
        
        assertEquals(4, intentosLoginService.getIntentosRestantes(correo));
    }

    @Test
    void testBloqueoDespuesDeMaximosIntentos() {
        String correo = "test@uce.edu.ec";
        
        for (int i = 0; i < 5; i++) {
            intentosLoginService.loginFallido(correo);
        }
        
        assertEquals(0, intentosLoginService.getIntentosRestantes(correo));
        assertTrue(intentosLoginService.estaBloqueado(correo));
    }

    @Test
    void testBloqueoPorCuentaNoAfectaOtrosUsuarios() {
        String correoBloqueado = "estudiante1@uce.edu.ec";
        String correoCompaniero = "estudiante2@uce.edu.ec";

        for (int i = 0; i < 5; i++) {
            intentosLoginService.loginFallido(correoBloqueado);
        }

        assertTrue(intentosLoginService.estaBloqueado(correoBloqueado));
        assertFalse(intentosLoginService.estaBloqueado(correoCompaniero));
        assertEquals(5, intentosLoginService.getIntentosRestantes(correoCompaniero));
    }

    @Test
    void testNormalizacionDeCorreoEnIntentos() {
        intentosLoginService.loginFallido("  Estudiante@UCE.edu.ec ");
        assertEquals(4, intentosLoginService.getIntentosRestantes("estudiante@uce.edu.ec"));
    }

    @Test
    void testManejoSeguroDeCorreoNulo() {
        intentosLoginService.loginFallido(null);
        intentosLoginService.loginExitoso(null);

        assertEquals(5, intentosLoginService.getIntentosRestantes(null));
        assertFalse(intentosLoginService.estaBloqueado(null));
    }

    @Test
    @DisplayName("Vector adversarial TOCTOU: 25 hilos simultaneos fallando sobre la misma cuenta la bloquean")
    void testConcurrencia25HilosMismaCuenta() throws InterruptedException {
        String correo = "concurrente@uce.edu.ec";
        int totalHilos = 25;
        ExecutorService ejecutor = Executors.newFixedThreadPool(totalHilos);
        CountDownLatch listos = new CountDownLatch(totalHilos);
        CountDownLatch arranque = new CountDownLatch(1);

        for (int i = 0; i < totalHilos; i++) {
            ejecutor.submit(() -> {
                listos.countDown();
                arranque.await();
                intentosLoginService.loginFallido(correo);
                return null;
            });
        }

        listos.await();
        arranque.countDown();
        ejecutor.shutdown();

        assertTrue(ejecutor.awaitTermination(5, TimeUnit.SECONDS));
        assertTrue(intentosLoginService.estaBloqueado(correo));
        assertEquals(0, intentosLoginService.getIntentosRestantes(correo));
    }

    @Test
    @DisplayName("Vector adversarial Eviction Bypass: inundar 10_500 cuentas no desaloja cuenta bloqueada")
    void testInundacionCacheNoDesalojaCuentaBloqueada() {
        String victima = "victima@uce.edu.ec";
        for (int i = 0; i < 5; i++) {
            intentosLoginService.loginFallido(victima);
        }
        assertTrue(intentosLoginService.estaBloqueado(victima));

        for (int i = 0; i < 10_500; i++) {
            intentosLoginService.loginFallido("atacante" + i + "@uce.edu.ec");
        }

        assertTrue(intentosLoginService.estaBloqueado(victima));
    }
}
