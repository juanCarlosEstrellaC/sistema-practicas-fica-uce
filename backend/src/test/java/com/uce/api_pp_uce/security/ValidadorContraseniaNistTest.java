package com.uce.api_pp_uce.security;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.excepciones.NegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ValidadorContraseniaNistTest {

    private ValidadorContraseniaNist validador;

    @BeforeEach
    void setUp() {
        validador = new ValidadorContraseniaNist();
        validador.cargarListaNegra();
    }

    @Test
    @DisplayName("Debe aceptar una contrasenia que cumple todos los criterios NIST y politicas de seguridad")
    void debeAceptarContraseniaSegura() {
        assertDoesNotThrow(() -> validador.validar("Segura#2026!Abc"));
        assertDoesNotThrow(() -> validador.validar("MiClaveFuerte#2026"));
    }

    @Test
    @DisplayName("Debe rechazar contrasenia con longitud menor a 8 caracteres")
    void debeRechazarLongitudMenorA8() {
        NegocioException ex = assertThrows(NegocioException.class, () -> validador.validar("Ab1#"));
        assertTrue(ex.getMessage().contains("al menos 8 caracteres"));
    }

    @Test
    @DisplayName("Debe rechazar contrasenia con longitud mayor a 64 caracteres")
    void debeRechazarLongitudMayorA64() {
        String muyLarga = "A1#".concat("a".repeat(65));
        NegocioException ex = assertThrows(NegocioException.class, () -> validador.validar(muyLarga));
        assertTrue(ex.getMessage().contains("no debe exceder los 64 caracteres"));
    }

    @Test
    @DisplayName("Debe rechazar contrasenia sin mayuscula, minuscula, numero o especial")
    void debeRechazarSinRequisitosBasicos() {
        assertThrows(NegocioException.class, () -> validador.validar("minusculaynum12#"));
        assertThrows(NegocioException.class, () -> validador.validar("MAYUSCULAYNUM12#"));
        assertThrows(NegocioException.class, () -> validador.validar("SoloLetrasYSimbolo#"));
        assertThrows(NegocioException.class, () -> validador.validar("SinEspecial123Abc"));
    }

    @Test
    @DisplayName("Debe rechazar patrones repetitivos consecutivos (ej. aaa, 111)")
    void debeRechazarPatronesRepetitivos() {
        NegocioException ex = assertThrows(NegocioException.class, () -> validador.validar("Claveeee#2026"));
        assertTrue(ex.getMessage().contains("caracteres repetitivos"));

        NegocioException exNum = assertThrows(NegocioException.class, () -> validador.validar("Clave#1111Abc"));
        assertTrue(exNum.getMessage().contains("caracteres repetitivos"));
    }

    @Test
    @DisplayName("Debe rechazar secuencias alfanumericas o de teclado obvias (ej. 1234, abcd, qwerty)")
    void debeRechazarSecuenciasObvias() {
        NegocioException ex1 = assertThrows(NegocioException.class, () -> validador.validar("Clave#1234Xyz"));
        assertTrue(ex1.getMessage().contains("secuencias"));

        NegocioException ex2 = assertThrows(NegocioException.class, () -> validador.validar("Clave#abcd8Xyz"));
        assertTrue(ex2.getMessage().contains("secuencias"));

        NegocioException ex3 = assertThrows(NegocioException.class, () -> validador.validar("Clave#qwerty26"));
        assertTrue(ex3.getMessage().contains("teclado"));
    }

    @Test
    @DisplayName("Debe rechazar palabras institucionales obvias como uce, central, ingenieria, quito, facultad")
    void debeRechazarPalabrasInstitucionales() {
        NegocioException ex1 = assertThrows(NegocioException.class, () -> validador.validar("Uce#2026Segura"));
        assertTrue(ex1.getMessage().contains("institucionales"));

        NegocioException ex2 = assertThrows(NegocioException.class, () -> validador.validar("Central#2026Abc"));
        assertTrue(ex2.getMessage().contains("institucionales"));

        NegocioException ex3 = assertThrows(NegocioException.class, () -> validador.validar("Ingenieria#2026!"));
        assertTrue(ex3.getMessage().contains("institucionales"));

        NegocioException ex4 = assertThrows(NegocioException.class, () -> validador.validar("Quito#2026Segura"));
        assertTrue(ex4.getMessage().contains("institucionales"));

        NegocioException ex5 = assertThrows(NegocioException.class, () -> validador.validar("Facultad#2026!"));
        assertTrue(ex5.getMessage().contains("institucionales"));
    }

    @Test
    @DisplayName("Debe rechazar contrasenias comunes presentes en la lista negra")
    void debeRechazarListaNegra() {
        NegocioException ex = assertThrows(NegocioException.class, () -> validador.validar("Password123!"));
        assertTrue(ex.getMessage().contains("común") || ex.getMessage().contains("insegura"));
    }

    @Test
    @DisplayName("Debe rechazar contrasenia que contiene datos del usuario (correo, nombre o identificacion)")
    void debeRechazarDatosContextoUsuario() {
        Usuario usuario = new Usuario();
        usuario.setCorreo("aperez@uce.edu.ec");
        usuario.setNombres("Ana Lucia");
        usuario.setApellidos("Perez Gomez");
        usuario.setIdentificacion("1725839401");

        NegocioException exCorreo = assertThrows(NegocioException.class, () -> validador.validar("MiClaveAperez#2026", usuario));
        assertTrue(exCorreo.getMessage().contains("nombre de usuario"));

        NegocioException exNombre = assertThrows(NegocioException.class, () -> validador.validar("ClaveDeAna#2026!", usuario));
        assertTrue(exNombre.getMessage().contains("nombres"));

        NegocioException exApellido = assertThrows(NegocioException.class, () -> validador.validar("ClaveDeGomez#2026!", usuario));
        assertTrue(exApellido.getMessage().contains("apellidos"));

        NegocioException exCedula = assertThrows(NegocioException.class, () -> validador.validar("Clave#1725839401X", usuario));
        assertTrue(exCedula.getMessage().contains("identificación"));
    }
}
