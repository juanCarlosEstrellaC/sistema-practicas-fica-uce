package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.services.SistemaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Slf4j
public class SistemaServiceImpl implements SistemaService {

    private final DataSource dataSource;

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    @Override
    public void reiniciarSistema() {
        try {
            // 1. Reejecutar db/schema.sql y db/dummy_inicial.sql para limpiar e inicializar la base de datos
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("db/schema.sql"));
            populator.addScript(new ClassPathResource("db/dummy_inicial.sql"));
            populator.execute(dataSource);

            // 2. Limpiar la carpeta de archivos subidos parametrizada
            Path carpetaSubidas = Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos");
            limpiarCarpeta(carpetaSubidas);

            // 3. Limpiar carpeta legada uploads si existe
            Path carpetaLegada = Paths.get("uploads");
            if (Files.exists(carpetaLegada)) {
                limpiarCarpeta(carpetaLegada);
            }
        } catch (Exception e) {
            log.error("Error al reiniciar el sistema", e);
            throw new NegocioException("Error al reiniciar el sistema: " + e.getMessage());
        }
    }

    private void limpiarCarpeta(Path carpeta) throws IOException {
        if (Files.exists(carpeta)) {
            Files.walk(carpeta)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            if (!path.equals(carpeta)) {
                                Files.deleteIfExists(path);
                            }
                        } catch (IOException e) {
                            log.warn("No se pudo eliminar el archivo o carpeta temporal: {}", path, e);
                        }
                    });
        }
    }
}
