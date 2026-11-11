package com.uce.api_pp_uce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registro) {
        Path rutaCarga = Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos").toAbsolutePath().normalize();
        if (!Files.exists(rutaCarga) && Files.exists(Paths.get("backend", rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos"))) {
            rutaCarga = Paths.get("backend", rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos").toAbsolutePath().normalize();
        }

        String rutaAbsoluta = rutaCarga.toFile().getAbsolutePath().replace("\\", "/");
        if (!rutaAbsoluta.endsWith("/")) {
            rutaAbsoluta += "/";
        }

        // Restriccion de seguridad (OWASP ASVS v5.0):
        // UNICAMENTE se exponen de forma estatica avatares e imagenes/plantillas no confidenciales.
        // Los documentos protegidos (portafolios, cartas, avales, matrices, convenios, evidencias)
        // se sirven exclusivamente mediante controladores con autorizacion y validacion BOLA/IDOR.
        registro.addResourceHandler(
                "/archivos_subidos/avatars/**",
                "/archivos_subidos/general/avatars/**"
        ).addResourceLocations(
                "file:" + rutaAbsoluta + "general/avatars/",
                "file:" + rutaAbsoluta + "avatars/"
        );

        registro.addResourceHandler(
                "/archivos_subidos/plantillas/**",
                "/archivos_subidos/general/plantillas/**"
        ).addResourceLocations(
                "file:" + rutaAbsoluta + "general/plantillas/",
                "file:" + rutaAbsoluta + "plantillas/"
        );
    }
}
