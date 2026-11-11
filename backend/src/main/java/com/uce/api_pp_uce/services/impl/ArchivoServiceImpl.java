package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.services.ArchivoService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class ArchivoServiceImpl implements ArchivoService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    private static final String CARPETA_AVATARES = "general/avatars";
    private final Tika tika = new Tika();

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
        String baseConfig = rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos";
        Path rutaBase = Paths.get(baseConfig).toAbsolutePath().normalize();
        if (!Files.exists(rutaBase) && Files.exists(Paths.get("backend", baseConfig))) {
            rutaBase = Paths.get("backend", baseConfig).toAbsolutePath().normalize();
        }
        return rutaBase;
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
        if (extension == null || !extension.matches("(?i)^(jpg|jpeg|png|webp)$")) {
            throw new NegocioException("Solo se permiten imagenes (jpg, jpeg, png, webp)");
        }

        // 1. Validacion de Magic Bytes con Apache Tika
        validarMagicBytes(archivo, "." + extension);

        // 2. Desinfeccion de metadatos EXIF y re-rasterizacion segura
        try {
            BufferedImage imagenOriginal = ImageIO.read(archivo.getInputStream());
            if (imagenOriginal == null) {
                throw new NegocioException("El archivo proporcionado no es una imagen valida o se encuentra daniado.");
            }

            int anchoOriginal = imagenOriginal.getWidth();
            int altoOriginal = imagenOriginal.getHeight();
            if (anchoOriginal > 4096 || altoOriginal > 4096) {
                throw new NegocioException("Dimensiones de imagen excesivas (maximo 4096x4096)");
            }

            // Redimensionar proporcionalmente a maximo 512px para optimizar avatar
            int maxDim = 512;
            int nuevoAncho = anchoOriginal;
            int nuevoAlto = altoOriginal;
            if (anchoOriginal > maxDim || altoOriginal > maxDim) {
                if (anchoOriginal > altoOriginal) {
                    nuevoAncho = maxDim;
                    nuevoAlto = Math.max(1, (altoOriginal * maxDim) / anchoOriginal);
                } else {
                    nuevoAlto = maxDim;
                    nuevoAncho = Math.max(1, (anchoOriginal * maxDim) / altoOriginal);
                }
            }

            BufferedImage imagenLimpia = new BufferedImage(nuevoAncho, nuevoAlto, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = imagenLimpia.createGraphics();
            try {
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2d.drawImage(imagenOriginal, 0, 0, nuevoAncho, nuevoAlto, null);
            } finally {
                g2d.dispose();
            }

            Path directorioAvatares = obtenerRutaAvatares();
            if (!Files.exists(directorioAvatares)) {
                Files.createDirectories(directorioAvatares);
            }

            // Siempre se almacena como PNG limpio (eliminando metadatos EXIF y estandarizando formato)
            String filename = identificador + "_" + UUID.randomUUID().toString() + ".png";
            Path destinoArchivo = directorioAvatares.resolve(Paths.get(filename)).normalize().toAbsolutePath();

            if (!destinoArchivo.getParent().equals(directorioAvatares.toAbsolutePath())) {
                throw new NegocioException("Ruta no permitida");
            }

            boolean escrito = ImageIO.write(imagenLimpia, "png", destinoArchivo.toFile());
            if (!escrito) {
                throw new NegocioException("No se pudo codificar la imagen sanitizada");
            }

            return "/archivos_subidos/" + CARPETA_AVATARES + "/" + filename;
        } catch (IOException e) {
            log.error("Error al procesar y sanitizar avatar de usuario", e);
            throw new NegocioException("Fallo al guardar el archivo de avatar");
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
            if (nombreOriginal == null || !nombreOriginal.contains(".")) {
                throw new NegocioException("El archivo debe tener una extension valida");
            }
            String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".")).toLowerCase();

            Set<String> extensionesDocumentos = Set.of(".pdf");
            Set<String> extensionesExcel = Set.of(".xlsx", ".ods", ".xls");
            Set<String> extensionesImagenes = Set.of(".png", ".jpg", ".jpeg", ".webp");

            boolean esValido = extensionesDocumentos.contains(extension)
                    || extensionesExcel.contains(extension)
                    || extensionesImagenes.contains(extension);

            if (!esValido) {
                throw new NegocioException("Tipo de archivo no permitido (" + extension + "). Solo se aceptan documentos PDF (.pdf), plantillas Excel (.xlsx, .ods) o imagenes (.png, .jpg, .webp).");
            }

            // Validacion estricta de Magic Bytes mediante Apache Tika
            validarMagicBytes(archivo, extension);

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

    private void validarMagicBytes(MultipartFile archivo, String extension) {
        try (InputStream is = archivo.getInputStream()) {
            String tipoMimeReal = tika.detect(is, archivo.getOriginalFilename());
            log.info("Inspeccion Tika para '{}': MIME detectado = {}", archivo.getOriginalFilename(), tipoMimeReal);

            if (extension.equalsIgnoreCase(".pdf")) {
                if (!"application/pdf".equalsIgnoreCase(tipoMimeReal)) {
                    throw new NegocioException("Firma de archivo invalida: el archivo no corresponde a un documento PDF legitimo (detectado: " + tipoMimeReal + ").");
                }
            } else if (extension.equalsIgnoreCase(".xlsx") || extension.equalsIgnoreCase(".ods") || extension.equalsIgnoreCase(".xls")) {
                boolean esExcelValido = tipoMimeReal.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        || tipoMimeReal.equalsIgnoreCase("application/vnd.ms-excel")
                        || tipoMimeReal.equalsIgnoreCase("application/vnd.oasis.opendocument.spreadsheet")
                        || tipoMimeReal.equalsIgnoreCase("application/x-tika-ooxml")
                        || tipoMimeReal.equalsIgnoreCase("application/zip");
                if (!esExcelValido) {
                    throw new NegocioException("Firma de archivo invalida: el archivo no corresponde a una hoja de calculo valida (detectado: " + tipoMimeReal + ").");
                }
            } else if (extension.equalsIgnoreCase(".png") || extension.equalsIgnoreCase(".jpg") || extension.equalsIgnoreCase(".jpeg") || extension.equalsIgnoreCase(".webp")) {
                boolean esImagenValida = tipoMimeReal.equalsIgnoreCase("image/jpeg")
                        || tipoMimeReal.equalsIgnoreCase("image/png")
                        || tipoMimeReal.equalsIgnoreCase("image/webp");
                if (!esImagenValida) {
                    throw new NegocioException("Firma de archivo invalida: el archivo no corresponde a una imagen valida (detectado: " + tipoMimeReal + ").");
                }
            } else {
                throw new NegocioException("Extension de archivo no admitida para analisis de seguridad: " + extension);
            }
        } catch (IOException e) {
            log.error("Error al inspeccionar magic bytes con Apache Tika", e);
            throw new NegocioException("Error al inspeccionar la seguridad del archivo: " + e.getMessage());
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

            if (!archivo.toAbsolutePath().startsWith(rutaBase.toAbsolutePath())) {
                throw new NegocioException("Acceso no permitido: ruta fuera del directorio base");
            }

            // Si no existe directamente, intentar resolver retrocompatibilidad o subcarpetas
            if (!Files.exists(archivo)) {
                if (!rutaLimpia.contains("/")) {
                    for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
                        Path posibleRuta = rutaBase.resolve(tipo.getSubcarpeta()).resolve(rutaLimpia).normalize();
                        if (posibleRuta.toAbsolutePath().startsWith(rutaBase.toAbsolutePath()) && Files.exists(posibleRuta)) {
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
                            Path posibleRuta = rutaBase.resolve(sub).resolve(resto).normalize();
                            if (posibleRuta.toAbsolutePath().startsWith(rutaBase.toAbsolutePath()) && Files.exists(posibleRuta)) {
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
