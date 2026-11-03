package com.uce.api_pp_uce.security;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.excepciones.NegocioException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class ValidadorContraseniaNist {

    private static final Logger log = LoggerFactory.getLogger(ValidadorContraseniaNist.class);

    private static final List<String> PALABRAS_INSTITUCIONALES = List.of(
            "uce", "central", "ingenieria", "quito", "facultad", "subdecano", "subdecana", "rectorado", "carrera", "universidad"
    );

    private static final List<String> SECUENCIAS_TECLADO = List.of(
            "qwerty", "asdfgh", "zxcvbn", "qwert", "asdf", "zxcv", "poiuy", "lkjh", "mnbv"
    );

    private static final Pattern PATRON_REPETITIVOS = Pattern.compile("(.)\\1{2,}");

    private final Set<String> contraseniasComunes = new HashSet<>();

    @PostConstruct
    public void cargarListaNegra() {
        try {
            ClassPathResource recurso = new ClassPathResource("seguridad/contrasenias-comunes.txt");
            if (recurso.exists()) {
                try (BufferedReader lector = new BufferedReader(new InputStreamReader(recurso.getInputStream(), StandardCharsets.UTF_8))) {
                    String linea;
                    while ((linea = lector.readLine()) != null) {
                        String normalizada = linea.trim().toLowerCase();
                        if (!normalizada.isEmpty()) {
                            contraseniasComunes.add(normalizada);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar la lista negra de contraseñas desde archivo, utilizando lista por defecto: {}", e.getMessage());
        }

        // Respaldo estático básico
        contraseniasComunes.addAll(List.of(
                "password", "password123", "12345678", "admin123", "contrasenia", "clave123", "welcome123"
        ));
    }

    public void validar(String contrasenia) {
        validar(contrasenia, null);
    }

    public void validar(String contrasenia, Usuario usuario) {
        if (contrasenia == null || contrasenia.length() < 8) {
            throw new NegocioException("La contraseña debe tener al menos 8 caracteres.");
        }
        if (contrasenia.length() > 64) {
            throw new NegocioException("La contraseña no debe exceder los 64 caracteres.");
        }
        if (!contrasenia.matches(".*[A-Z].*")) {
            throw new NegocioException("La contraseña debe contener al menos una letra mayúscula.");
        }
        if (!contrasenia.matches(".*[a-z].*")) {
            throw new NegocioException("La contraseña debe contener al menos una letra minúscula.");
        }
        if (!contrasenia.matches(".*[0-9].*")) {
            throw new NegocioException("La contraseña debe contener al menos un número.");
        }
        if (!contrasenia.matches(".*[^A-Za-z0-9].*")) {
            throw new NegocioException("La contraseña debe contener al menos un carácter especial.");
        }

        validarPatronesRepetitivos(contrasenia);
        validarSecuenciasObvias(contrasenia);
        validarPalabrasInstitucionales(contrasenia);
        validarListaNegra(contrasenia);

        if (usuario != null) {
            validarContextoUsuario(contrasenia, usuario);
        }
    }

    private void validarPatronesRepetitivos(String contrasenia) {
        if (PATRON_REPETITIVOS.matcher(contrasenia).find()) {
            throw new NegocioException("La contraseña no debe contener 3 o más caracteres repetitivos consecutivos (ej. aaa, 111).");
        }
    }

    private void validarSecuenciasObvias(String contrasenia) {
        String contraseniaMin = contrasenia.toLowerCase();
        for (String teclado : SECUENCIAS_TECLADO) {
            if (contraseniaMin.contains(teclado)) {
                throw new NegocioException("La contraseña no debe contener secuencias de teclado obvias como '" + teclado + "'.");
            }
        }

        for (int i = 0; i <= contrasenia.length() - 4; i++) {
            char c1 = contrasenia.charAt(i);
            char c2 = contrasenia.charAt(i + 1);
            char c3 = contrasenia.charAt(i + 2);
            char c4 = contrasenia.charAt(i + 3);

            if (Character.isLetterOrDigit(c1) && Character.isLetterOrDigit(c2)
                    && Character.isLetterOrDigit(c3) && Character.isLetterOrDigit(c4)) {
                char c1Min = Character.toLowerCase(c1);
                char c2Min = Character.toLowerCase(c2);
                char c3Min = Character.toLowerCase(c3);
                char c4Min = Character.toLowerCase(c4);

                boolean ascendente = (c2Min - c1Min == 1) && (c3Min - c2Min == 1) && (c4Min - c3Min == 1);
                boolean descendente = (c1Min - c2Min == 1) && (c2Min - c3Min == 1) && (c3Min - c4Min == 1);

                if (ascendente || descendente) {
                    throw new NegocioException("La contraseña no debe contener secuencias alfanuméricas consecutivas (ej. 1234, abcd).");
                }
            }
        }
    }

    private void validarPalabrasInstitucionales(String contrasenia) {
        String contraseniaMin = contrasenia.toLowerCase();
        for (String palabra : PALABRAS_INSTITUCIONALES) {
            if (contraseniaMin.contains(palabra)) {
                throw new NegocioException("La contraseña no debe contener palabras institucionales obvias como '" + palabra + "'.");
            }
        }
    }

    private void validarListaNegra(String contrasenia) {
        String contraseniaMin = contrasenia.trim().toLowerCase();
        if (contraseniasComunes.contains(contraseniaMin)) {
            throw new NegocioException("La contraseña seleccionada es muy común o insegura. Por favor elija otra.");
        }
    }

    private void validarContextoUsuario(String contrasenia, Usuario usuario) {
        String contraseniaMin = contrasenia.toLowerCase();
        if (usuario.getCorreo() != null && !usuario.getCorreo().isBlank()) {
            String correo = usuario.getCorreo().toLowerCase();
            if (contraseniaMin.contains(correo)) {
                throw new NegocioException("La contraseña no debe contener su correo electrónico.");
            }
            int arrobaIdx = correo.indexOf('@');
            if (arrobaIdx > 0) {
                String nombreUsuario = correo.substring(0, arrobaIdx);
                if (nombreUsuario.length() >= 3 && contraseniaMin.contains(nombreUsuario)) {
                    throw new NegocioException("La contraseña no debe contener su nombre de usuario de correo.");
                }
            }
        }

        validarFragmento(contraseniaMin, usuario.getNombres(), "nombres");
        validarFragmento(contraseniaMin, usuario.getApellidos(), "apellidos");

        if (usuario.getIdentificacion() != null && usuario.getIdentificacion().trim().length() >= 4) {
            if (contrasenia.contains(usuario.getIdentificacion().trim())) {
                throw new NegocioException("La contraseña no debe contener su número de identificación o cédula.");
            }
        }
    }

    private void validarFragmento(String contraseniaMin, String texto, String tipo) {
        if (texto == null || texto.isBlank()) {
            return;
        }
        String[] partes = texto.toLowerCase().split("[\\s,.-]+");
        for (String parte : partes) {
            if (parte.length() >= 3 && contraseniaMin.contains(parte)) {
                throw new NegocioException("La contraseña no debe contener sus " + tipo + " personales.");
            }
        }
    }
}
