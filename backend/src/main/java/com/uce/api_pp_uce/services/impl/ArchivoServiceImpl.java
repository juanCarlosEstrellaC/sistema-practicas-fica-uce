package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.services.ArchivoService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
@Slf4j
public class ArchivoServiceImpl implements ArchivoService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    private static final String CARPETA_AVATARES = "general/avatars";

    @PostConstruct
    public void inicializarDirectorio() {
        try {
            Path rutaBase = obtenerRutaBase();
            Files.createDirectories(rutaBase);

            for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                Path rutaSubcarpeta = rutaBase.resolve(tipo.getSubcarpeta());
                if (!Files.exists(rutaSubcarpeta)) {
                    Files.createDirectories(rutaSubcarpeta);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar el directorio de almacenamiento", e);
        }
    }

    private Path obtenerRutaBase() {
        return Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos");
    }

    private Path obtenerRutaAvatares() {
        return obtenerRutaBase().resolve(CARPETA_AVATARES);
    }

    @Override
    public String guardarAvatar(MultipartFile archivo, String identificador) {
        if (archivo == null || archivo.isEmpty()) {
            throw new NegocioException("Archivo vacio");
        }

        String extension = StringUtils.getFilenameExtension(archivo.getOriginalFilename());
        if (extension == null || !extension.matches("(?i)^(jpg|jpeg|png)$")) {
            throw new NegocioException("Solo se permiten imagenes (jpg, jpeg, png)");
        }

        String filename = identificador + "_" + UUID.randomUUID().toString() + "." + extension;
        try {
            Path directorioAvatares = obtenerRutaAvatares();
            if (!Files.exists(directorioAvatares)) {
                Files.createDirectories(directorioAvatares);
            }

            Path destinoArchivo = directorioAvatares.resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();

            if (!destinoArchivo.getParent().equals(directorioAvatares.toAbsolutePath())) {
                throw new NegocioException("Ruta no permitida");
            }

            Files.copy(archivo.getInputStream(), destinoArchivo, StandardCopyOption.REPLACE_EXISTING);

            return "/archivos_subidos/" + CARPETA_AVATARES + "/" + filename;
        } catch (IOException e) {
            log.error("Error al guardar archivo avatar", e);
            throw new NegocioException("Fallo al guardar el archivo");
        }
    }

    @Override
    public String subirArchivo(MultipartFile archivo, TipoArchivoSubido tipoArchivo) {
        String carpeta = tipoArchivo != null ? tipoArchivo.getSubcarpeta() : TipoArchivoSubido.OTROS.getSubcarpeta();
        return subirArchivo(archivo, carpeta);
    }

    @Override
    public String subirArchivo(MultipartFile archivo, String carpeta) {
        if (archivo == null || archivo.isEmpty()) {
            throw new NegocioException("El archivo esta vacio");
        }

        try {
            String nombreOriginal = archivo.getOriginalFilename();
            String extension = nombreOriginal != null && nombreOriginal.contains(".")
                    ? nombreOriginal.substring(nombreOriginal.lastIndexOf("."))
                    : ".pdf";

            String subcarpetaDestino;
            if (carpeta != null && !carpeta.trim().isEmpty()) {
                TipoArchivoSubido tipoDetectado = TipoArchivoSubido.desdeTexto(carpeta);
                if (tipoDetectado != TipoArchivoSubido.OTROS) {
                    subcarpetaDestino = tipoDetectado.getSubcarpeta();
                } else {
                    subcarpetaDestino = carpeta.replaceAll("[^a-zA-Z0-9_/\\-]", "")
                            .replaceAll("^/+", "")
                            .replaceAll("/+$", "");
                    if (subcarpetaDestino.isEmpty()) {
                        subcarpetaDestino = TipoArchivoSubido.OTROS.getSubcarpeta();
                    }
                }
            } else {
                if (extension.equalsIgnoreCase(".ods") || extension.equalsIgnoreCase(".xlsx")) {
                    subcarpetaDestino = TipoArchivoSubido.MATRICES_CACES.getSubcarpeta();
                } else {
                    subcarpetaDestino = TipoArchivoSubido.OTROS.getSubcarpeta();
                }
            }

            Path rutaBase = obtenerRutaBase();
            Path directorioPath = rutaBase.resolve(subcarpetaDestino).normalize();

            if (!directorioPath.toAbsolutePath().startsWith(rutaBase.toAbsolutePath())) {
                throw new NegocioException("Ruta no permitida");
            }

            if (!Files.exists(directorioPath)) {
                Files.createDirectories(directorioPath);
            }

            String nombreUnico = UUID.randomUUID().toString() + extension;
            Path destinoPath = directorioPath.resolve(nombreUnico);
            Files.copy(archivo.getInputStream(), destinoPath, StandardCopyOption.REPLACE_EXISTING);

            return "/archivos_subidos/" + subcarpetaDestino + "/" + nombreUnico;
        } catch (IOException e) {
            log.error("Error al guardar el archivo", e);
            throw new NegocioException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    @Override
    public String guardarArchivoBytes(byte[] contenido, String nombreArchivo, TipoArchivoSubido tipoArchivo) {
        if (contenido == null || contenido.length == 0) {
            throw new NegocioException("El contenido del archivo esta vacio");
        }

        try {
            String subcarpetaDestino = tipoArchivo != null ? tipoArchivo.getSubcarpeta() : TipoArchivoSubido.OTROS.getSubcarpeta();
            String extension = nombreArchivo != null && nombreArchivo.contains(".")
                    ? nombreArchivo.substring(nombreArchivo.lastIndexOf("."))
                    : ".pdf";

            Path rutaBase = obtenerRutaBase();
            Path directorioPath = rutaBase.resolve(subcarpetaDestino).normalize();

            if (!directorioPath.toAbsolutePath().startsWith(rutaBase.toAbsolutePath())) {
                throw new NegocioException("Ruta no permitida");
            }

            if (!Files.exists(directorioPath)) {
                Files.createDirectories(directorioPath);
            }

            String nombreUnico = UUID.randomUUID().toString() + extension;
            Path destinoPath = directorioPath.resolve(nombreUnico);
            Files.write(destinoPath, contenido, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            return "/archivos_subidos/" + subcarpetaDestino + "/" + nombreUnico;
        } catch (IOException e) {
            log.error("Error al guardar archivo desde bytes", e);
            throw new NegocioException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    @Override
    public Resource cargarArchivo(String rutaRelativa) {
        if (rutaRelativa == null || rutaRelativa.trim().isEmpty()) {
            throw new NegocioException("Ruta de archivo no especificada");
        }

        try {
            String rutaLimpia;
            if (rutaRelativa.startsWith("/archivos_subidos/")) {
                rutaLimpia = rutaRelativa.substring("/archivos_subidos/".length());
            } else if (rutaRelativa.startsWith("/usuarios/avatars/")) {
                rutaLimpia = CARPETA_AVATARES + "/" + rutaRelativa.substring("/usuarios/avatars/".length());
            } else {
                rutaLimpia = rutaRelativa.replaceAll("^/+", "");
            }

            Path rutaBase = obtenerRutaBase();
            Path archivo = rutaBase.resolve(rutaLimpia).normalize();

            // Si no existe directamente, intentar resolver retrocompatibilidad o subcarpetas
            if (!Files.exists(archivo)) {
                if (!rutaLimpia.contains("/")) {
                    for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                        Path posibleRuta = rutaBase.resolve(tipo.getSubcarpeta()).resolve(rutaLimpia);
                        if (Files.exists(posibleRuta)) {
                            archivo = posibleRuta;
                            break;
                        }
                    }
                } else {
                    for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                        String sub = tipo.getSubcarpeta();
                        String nombreCarpetaPlana = sub.contains("/") ? sub.substring(sub.lastIndexOf("/") + 1) : sub;
                        if (rutaLimpia.startsWith(nombreCarpetaPlana + "/")) {
                            String resto = rutaLimpia.substring(nombreCarpetaPlana.length() + 1);
                            Path posibleRuta = rutaBase.resolve(sub).resolve(resto);
                            if (Files.exists(posibleRuta)) {
                                archivo = posibleRuta;
                                break;
                            }
                        }
                    }
                }
            }

            Resource resource = new UrlResource(archivo.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new NegocioException("No se pudo leer el archivo: " + rutaRelativa);
            }
        } catch (MalformedURLException e) {
            throw new NegocioException("Ruta de archivo invalida: " + rutaRelativa);
        }
    }

    @Override
    public boolean eliminarArchivo(String rutaRelativa) {
        if (rutaRelativa == null || rutaRelativa.trim().isEmpty()) {
            return false;
        }

        try {
            String rutaLimpia;
            if (rutaRelativa.startsWith("/archivos_subidos/")) {
                rutaLimpia = rutaRelativa.substring("/archivos_subidos/".length());
            } else if (rutaRelativa.startsWith("/usuarios/avatars/")) {
                rutaLimpia = CARPETA_AVATARES + "/" + rutaRelativa.substring("/usuarios/avatars/".length());
            } else {
                rutaLimpia = rutaRelativa.replaceAll("^/+", "");
            }

            Path rutaBase = obtenerRutaBase();
            Path archivo = rutaBase.resolve(rutaLimpia).normalize();

            if (!archivo.toAbsolutePath().startsWith(rutaBase.toAbsolutePath())) {
                log.warn("Intento de eliminacion fuera del directorio permitido: {}", rutaRelativa);
                return false;
            }

            if (!Files.exists(archivo)) {
                if (!rutaLimpia.contains("/")) {
                    for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                        Path posibleRuta = rutaBase.resolve(tipo.getSubcarpeta()).resolve(rutaLimpia);
                        if (Files.exists(posibleRuta)) {
                            archivo = posibleRuta;
                            break;
                        }
                    }
                } else {
                    for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                        String sub = tipo.getSubcarpeta();
                        String nombreCarpetaPlana = sub.contains("/") ? sub.substring(sub.lastIndexOf("/") + 1) : sub;
                        if (rutaLimpia.startsWith(nombreCarpetaPlana + "/")) {
                            String resto = rutaLimpia.substring(nombreCarpetaPlana.length() + 1);
                            Path posibleRuta = rutaBase.resolve(sub).resolve(resto);
                            if (Files.exists(posibleRuta)) {
                                archivo = posibleRuta;
                                break;
                            }
                        }
                    }
                }
            }

            boolean eliminado = Files.deleteIfExists(archivo);
            if (eliminado) {
                log.info("Archivo eliminado exitosamente: {}", archivo.toAbsolutePath());
            } else {
                log.warn("No se encontro el archivo para eliminar en disco: {}", rutaRelativa);
            }
            return eliminado;
        } catch (IOException e) {
            log.error("Error al eliminar archivo fisico en disco: {}", rutaRelativa, e);
            return false;
        }
    }
}
