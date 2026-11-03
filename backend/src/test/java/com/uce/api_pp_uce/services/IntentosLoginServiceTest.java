package com.uce.api_pp_uce.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

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
}
