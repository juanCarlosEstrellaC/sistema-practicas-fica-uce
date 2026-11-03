package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.services.impl.ArchivoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArchivoServiceTest {

    private ArchivoServiceImpl archivoService;

    @TempDir
    Path directorioTemporal;

    @BeforeEach
    void setUp() {
        archivoService = new ArchivoServiceImpl();
        ReflectionTestUtils.setField(archivoService, "rutaBaseAlmacenamiento", directorioTemporal.toString());
        archivoService.inicializarDirectorio();
    }

    @Test
    @DisplayName("Debe inicializar todas las subcarpetas por tipo de archivo")
    void inicializarDirectorioCreaSubcarpetas() {
        for (TipoArchivoSubido tipo : TipoArchivoSubido.values()) {
            Path subcarpeta = directorioTemporal.resolve(tipo.getSubcarpeta());
            assertTrue(Files.exists(subcarpeta), "La subcarpeta " + tipo.getSubcarpeta() + " deberia existir");
        }
    }

    @Test
    @DisplayName("Debe guardar avatar exitosamente en la carpeta unificada")
    void guardarAvatarExitoso() {
        MockMultipartFile archivo = new MockMultipartFile(
                "file",
                "perfil.png",
                "image/png",
                "contenido-imagen".getBytes()
        );

        String ruta = archivoService.guardarAvatar(archivo, "123");

        assertNotNull(ruta);
        assertTrue(ruta.startsWith("/archivos_subidos/general/avatars/123_"));
        assertTrue(ruta.endsWith(".png"));

        Path carpetaAvatares = directorioTemporal.resolve("general/avatars");
        assertTrue(Files.exists(carpetaAvatares));
    }

    @Test
    @DisplayName("Debe fallar al guardar avatar vacio")
    void guardarAvatarVacioLanzaExcepcion() {
        MockMultipartFile archivoVacio = new MockMultipartFile(
                "file",
                "vacio.png",
                "image/png",
                new byte[0]
        );

        NegocioException excepcion = assertThrows(
                NegocioException.class,
                () -> archivoService.guardarAvatar(archivoVacio, "123")
        );

        assertEquals("Archivo vacio", excepcion.getMessage());
    }

    @Test
    @DisplayName("Debe fallar al guardar archivo con extension no permitida para avatar")
    void guardarAvatarExtensionInvalidaLanzaExcepcion() {
        MockMultipartFile archivoPdf = new MockMultipartFile(
                "file",
                "documento.pdf",
                "application/pdf",
                "contenido".getBytes()
        );

        NegocioException excepcion = assertThrows(
                NegocioException.class,
                () -> archivoService.guardarAvatar(archivoPdf, "123")
        );

        assertEquals("Solo se permiten imagenes (jpg, jpeg, png)", excepcion.getMessage());
    }

    @Test
    @DisplayName("Debe cargar avatar existente correctamente mediante cargarArchivo")
    void cargarAvatarExitoso() throws IOException {
        Path carpetaAvatares = directorioTemporal.resolve("general/avatars");
        Files.createDirectories(carpetaAvatares);
        Path archivoPrueba = carpetaAvatares.resolve("avatar_test.png");
        Files.write(archivoPrueba, "datos".getBytes());

        Resource recurso = archivoService.cargarArchivo("/archivos_subidos/general/avatars/avatar_test.png");
        assertNotNull(recurso);
        assertTrue(recurso.exists());

        Resource recursoLegado = archivoService.cargarArchivo("/usuarios/avatars/avatar_test.png");
        assertNotNull(recursoLegado);
        assertTrue(recursoLegado.exists());
    }

    @Test
    @DisplayName("Debe lanzar excepcion si el avatar no existe mediante cargarArchivo")
    void cargarAvatarInexistenteLanzaExcepcion() {
        assertThrows(
                NegocioException.class,
                () -> archivoService.cargarArchivo("/archivos_subidos/avatars/no_existe.png")
        );
    }

    @Test
    @DisplayName("Debe subir archivo general en la subcarpeta especificada")
    void subirArchivoConCarpetaExitoso() {
        MockMultipartFile archivo = new MockMultipartFile(
                "file",
                "convenio.pdf",
                "application/pdf",
                "contenido-pdf".getBytes()
        );

        String ruta = archivoService.subirArchivo(archivo, "convenios");

        assertNotNull(ruta);
        assertTrue(ruta.startsWith("/archivos_subidos/practicas/convenios/"));
        assertTrue(ruta.endsWith(".pdf"));

        Path carpetaConvenios = directorioTemporal.resolve("practicas/convenios");
        assertTrue(Files.exists(carpetaConvenios));
    }

    @Test
    @DisplayName("Debe subir archivo usando TipoArchivoSubido directamente")
    void subirArchivoConTipoExitoso() {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "carta.pdf",
                "application/pdf",
                "contenido-carta".getBytes()
        );

        String ruta = archivoService.subirArchivo(archivo, TipoArchivoSubido.CARTAS_ASIGNACION);

        assertNotNull(ruta);
        assertTrue(ruta.startsWith("/archivos_subidos/practicas/cartas_asignacion/"));
        assertTrue(ruta.endsWith(".pdf"));

        Path carpetaCartas = directorioTemporal.resolve("practicas/cartas_asignacion");
        assertTrue(Files.exists(carpetaCartas));
    }

    @Test
    @DisplayName("Debe subir matriz caces en ods a su subcarpeta correspondiente")
    void subirArchivoMatrizCacesOds() {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "matriz.ods",
                "application/vnd.oasis.opendocument.spreadsheet",
                "contenido-ods".getBytes()
        );

        String ruta = archivoService.subirArchivo(archivo, (String) null);

        assertNotNull(ruta);
        assertTrue(ruta.startsWith("/archivos_subidos/practicas/matrices_caces/"));
        assertTrue(ruta.endsWith(".ods"));
    }

    @Test
    @DisplayName("Debe fallar al subir archivo general si esta vacio")
    void subirArchivoVacioLanzaExcepcion() {
        MockMultipartFile archivoVacio = new MockMultipartFile(
                "file",
                "vacio.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThrows(
                NegocioException.class,
                () -> archivoService.subirArchivo(archivoVacio, "convenios")
        );
    }

    @Test
    @DisplayName("Debe cargar archivo general existente")
    void cargarArchivoExitoso() throws IOException {
        Path carpetaConvenios = directorioTemporal.resolve("practicas/convenios");
        Files.createDirectories(carpetaConvenios);
        Path archivo = carpetaConvenios.resolve("documento.pdf");
        Files.write(archivo, "prueba".getBytes());

        Resource recurso = archivoService.cargarArchivo("/archivos_subidos/practicas/convenios/documento.pdf");
        assertNotNull(recurso);
        assertTrue(recurso.exists());
    }

    @Test
    @DisplayName("Debe cargar archivo con fallback en subcarpeta si solo se envio el nombre")
    void cargarArchivoFallbackSubcarpeta() throws IOException {
        Path carpetaAvales = directorioTemporal.resolve("practicas/avales");
        Files.createDirectories(carpetaAvales);
        Path archivo = carpetaAvales.resolve("aval_123.pdf");
        Files.write(archivo, "aval".getBytes());

        Resource recurso = archivoService.cargarArchivo("aval_123.pdf");
        assertNotNull(recurso);
        assertTrue(recurso.exists());
    }

    @Test
    @DisplayName("Debe eliminar archivo existente exitosamente")
    void eliminarArchivoExitoso() throws IOException {
        Path carpetaAvatares = directorioTemporal.resolve("general/avatars");
        Files.createDirectories(carpetaAvatares);
        Path archivo = carpetaAvatares.resolve("avatar_viejo.png");
        Files.write(archivo, "datos".getBytes());

        assertTrue(Files.exists(archivo));
        boolean resultado = archivoService.eliminarArchivo("/archivos_subidos/general/avatars/avatar_viejo.png");

        assertTrue(resultado);
        assertFalse(Files.exists(archivo));
    }

    @Test
    @DisplayName("Debe retornar false si el archivo a eliminar no existe")
    void eliminarArchivoInexistenteRetornaFalse() {
        boolean resultado = archivoService.eliminarArchivo("/archivos_subidos/general/avatars/no_existe.png");
        assertFalse(resultado);
    }

    @Test
    @DisplayName("Debe retornar false si la ruta a eliminar es nula o vacia")
    void eliminarArchivoNuloRetornaFalse() {
        assertFalse(archivoService.eliminarArchivo(null));
        assertFalse(archivoService.eliminarArchivo("   "));
    }
}
