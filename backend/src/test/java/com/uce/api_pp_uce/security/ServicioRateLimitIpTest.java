package com.uce.api_pp_uce.security;

import com.uce.api_pp_uce.security.ServicioRateLimitIp.ResultadoRecuperacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicioRateLimitIpTest {

    private ServicioRateLimitIp servicioRateLimitIp;

    @BeforeEach
    void setUp() {
        servicioRateLimitIp = new ServicioRateLimitIp();
    }

    @Test
    @DisplayName("Debe permitir hasta 30 intentos por IP en login y bloquear el 31 sin afectar otras IPs")
    void testLimiteLoginPorIp() {
        String ipLaboratorio = "192.168.10.25";
        String ipExterna = "10.0.0.8";

        // Simula 5 intentos de X, 5 de Y y 20 mas de otros estudiantes en la misma red
        for (int i = 0; i < 30; i++) {
            assertTrue(servicioRateLimitIp.intentarConsumirLoginIp(ipLaboratorio));
        }

        // El intento 31 desde esa IP debe rechazarse
        assertFalse(servicioRateLimitIp.intentarConsumirLoginIp(ipLaboratorio));

        // Otra IP debe conservar su cuota intacta
        assertTrue(servicioRateLimitIp.intentarConsumirLoginIp(ipExterna));
    }

    @Test
    @DisplayName("Debe normalizar espacios en IP de login")
    void testNormalizacionIpEnLogin() {
        for (int i = 0; i < 30; i++) {
            assertTrue(servicioRateLimitIp.intentarConsumirLoginIp(" 203.0.113.5 "));
        }
        assertFalse(servicioRateLimitIp.intentarConsumirLoginIp("203.0.113.5"));
    }

    @Test
    @DisplayName("Debe limitar recuperacion de contrasenia a 15 solicitudes por IP")
    void testLimiteRecuperacionPorIp() {
        String ip = "198.51.100.14";

        for (int i = 0; i < 15; i++) {
            assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionIp(ip));
        }

        assertFalse(servicioRateLimitIp.intentarConsumirRecuperacionIp(ip));
        assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionIp("198.51.100.15"));
    }

    @Test
    @DisplayName("Debe limitar recuperacion de contrasenia a 3 solicitudes por correo normalizado")
    void testLimiteRecuperacionPorCorreo() {
        assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionCorreo("Estudiante@UCE.edu.ec"));
        assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionCorreo(" estudiante@uce.edu.ec "));
        assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionCorreo("ESTUDIANTE@uce.edu.ec"));

        assertFalse(servicioRateLimitIp.intentarConsumirRecuperacionCorreo("estudiante@uce.edu.ec"));
        assertTrue(servicioRateLimitIp.intentarConsumirRecuperacionCorreo("otro@uce.edu.ec"));
    }

    @Test
    @DisplayName("Debe purgar cubetas inactivas al superar el umbral maximo en memoria")
    void testLimpiezaDeCubetasInactivas() throws InterruptedException {
        for (int i = 0; i < 10_000; i++) {
            servicioRateLimitIp.intentarConsumir("clave:temporal:" + i, 1, 1L);
        }

        // Esperar 5ms para asegurar que las 10_000 cubetas de 1ms queden inactivas
        Thread.sleep(5L);

        // La insercion adicional dispara la limpieza sin lanzar excepciones y permite operar
        assertTrue(servicioRateLimitIp.intentarConsumir("clave:nueva", 1, 60_000L));
        assertFalse(servicioRateLimitIp.intentarConsumir("clave:nueva", 1, 60_000L));
    }

    @Test
    @DisplayName("Vector adversarial TOCTOU: 50 hilos simultaneos sobre la misma IP solo permiten 30")
    void testConcurrencia50HilosMismaIp() throws InterruptedException {
        String ipObjetivo = "198.51.100.120";
        int totalHilos = 50;
        ExecutorService ejecutor = Executors.newFixedThreadPool(totalHilos);
        CountDownLatch listos = new CountDownLatch(totalHilos);
        CountDownLatch arranque = new CountDownLatch(1);
        AtomicInteger exitosos = new AtomicInteger(0);
        AtomicInteger rechazados = new AtomicInteger(0);

        for (int i = 0; i < totalHilos; i++) {
            ejecutor.submit(() -> {
                listos.countDown();
                arranque.await();
                if (servicioRateLimitIp.intentarConsumirLoginIp(ipObjetivo)) {
                    exitosos.incrementAndGet();
                } else {
                    rechazados.incrementAndGet();
                }
                return null;
            });
        }

        listos.await();
        arranque.countDown();
        ejecutor.shutdown();

        assertTrue(ejecutor.awaitTermination(5, TimeUnit.SECONDS));
        assertEquals(30, exitosos.get());
        assertEquals(20, rechazados.get());
    }

    @Test
    @DisplayName("Vector adversarial Eviction Bypass: inundar cache activa falla cerrado y no desaloja IP bloqueada")
    void testInundacionCacheActivaNoDesalojaBloqueos() {
        String ipBloqueada = "198.51.100.200";
        for (int i = 0; i < 30; i++) {
            assertTrue(servicioRateLimitIp.intentarConsumirLoginIp(ipBloqueada));
        }
        assertFalse(servicioRateLimitIp.intentarConsumirLoginIp(ipBloqueada));

        // Llenar las 9_999 entradas restantes con cubetas activas (60s)
        for (int i = 0; i < 9_999; i++) {
            assertTrue(servicioRateLimitIp.intentarConsumir("inundacion:activa:" + i, 1, 60_000L));
        }

        // La entrada 10_001 nueva debe fallar cerrado al no haber entradas inactivas por purgar
        assertFalse(servicioRateLimitIp.intentarConsumirLoginIp("198.51.100.201"));

        // La IP previamente bloqueada debe seguir bloqueada sin haber sido desalojada
        assertFalse(servicioRateLimitIp.intentarConsumirLoginIp(ipBloqueada));
    }

    @Test
    @DisplayName("Recuperacion atomica: IP bloqueada no consume correo ajeno ni correo bloqueado consume IP compartida")
    void testRecuperacionAtomicaNoContaminaFichasCruzadas() {
        String ipAtacante = "198.51.100.210";
        String ipVictima = "203.0.113.210";
        String correoVictima = "victima@uce.edu.ec";

        // 1. El atacante agota las 15 fichas de su IP con correos aleatorios
        for (int i = 0; i < 15; i++) {
            assertEquals(
                    ResultadoRecuperacion.PERMITIDO,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipAtacante, "ruido" + i + "@uce.edu.ec")
            );
        }

        // 2. La IP bloqueada intenta atacar el correo de la victima 5 veces -> todas rechazan por LIMITE_IP
        for (int i = 0; i < 5; i++) {
            assertEquals(
                    ResultadoRecuperacion.LIMITE_IP,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipAtacante, correoVictima)
            );
        }

        // 3. La victima desde su propia IP conserva sus 3 fichas intactas
        for (int i = 0; i < 3; i++) {
            assertEquals(
                    ResultadoRecuperacion.PERMITIDO,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipVictima, correoVictima)
            );
        }

        // 4. Un correo saturado en laboratorio no gasta las fichas de IP de otros companieros
        String ipLaboratorio = "198.51.100.211";
        String correoImpaciente = "impaciente@uce.edu.ec";
        for (int i = 0; i < 3; i++) {
            assertEquals(
                    ResultadoRecuperacion.PERMITIDO,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipLaboratorio, correoImpaciente)
            );
        }
        for (int i = 0; i < 15; i++) {
            assertEquals(
                    ResultadoRecuperacion.LIMITE_CORREO,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipLaboratorio, correoImpaciente)
            );
        }

        // Los companieros aun tienen las 12 fichas restantes de la IP del laboratorio
        for (int i = 0; i < 12; i++) {
            assertEquals(
                    ResultadoRecuperacion.PERMITIDO,
                    servicioRateLimitIp.intentarConsumirRecuperacion(ipLaboratorio, "companiero" + i + "@uce.edu.ec")
            );
        }
    }
}
