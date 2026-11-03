package com.uce.api_pp_uce.config;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registro) {
        Path rutaCarga = Paths.get(rutaBaseAlmacenamiento);
        String rutaAbsoluta = rutaCarga.toFile().getAbsolutePath().replace("\\", "/");
        if (!rutaAbsoluta.endsWith("/")) {
            rutaAbsoluta += "/";
        }

        List<String> ubicaciones = new ArrayList<>();
        ubicaciones.add("file:" + rutaAbsoluta);
        ubicaciones.add("file:" + rutaAbsoluta + "practicas/");
        ubicaciones.add("file:" + rutaAbsoluta + "vinculacion/");
        ubicaciones.add("file:" + rutaAbsoluta + "general/");
        for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
            ubicaciones.add("file:" + rutaAbsoluta + tipo.getSubcarpeta() + "/");
        }

        registro.addResourceHandler("/archivos_subidos/**")
                .addResourceLocations(ubicaciones.toArray(new String[0]));
    }
}
