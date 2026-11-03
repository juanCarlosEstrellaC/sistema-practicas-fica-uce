package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.services.ArchivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/archivos")
@RequiredArgsConstructor
public class ArchivoController {

    private final ArchivoService archivoService;

    @PostMapping("/subir")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<String>> subirArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "carpeta", required = false) String carpeta,
            @RequestParam(value = "tipo", required = false) TipoArchivoSubido tipo) {
        String carpetaDestino = tipo != null ? tipo.getSubcarpeta() : carpeta;
        String rutaUrl = archivoService.subirArchivo(archivo, carpetaDestino);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Archivo subido exitosamente", rutaUrl));
    }

    @PostMapping("/subir/matrices-caces")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<String>> subirMatrizCaces(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.MATRICES_CACES);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Matriz CACES subida exitosamente", rutaUrl));
    }

    @PostMapping("/subir/cartas-asignacion")
    @PreAuthorize("hasAnyRole('DIRECTOR_CARRERA', 'SUBDECANO')")
    public ResponseEntity<RespuestaApi<String>> subirCartaAsignacion(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.CARTAS_ASIGNACION);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carta de asignacion subida exitosamente", rutaUrl));
    }

    @PostMapping("/subir/avales")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<String>> subirAval(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.AVALES);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Aval subido exitosamente", rutaUrl));
    }

    @PostMapping("/subir/convenios")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<String>> subirConvenio(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.CONVENIOS);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Convenio subido exitosamente", rutaUrl));
    }

    @PostMapping("/subir/portafolios")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<String>> subirPortafolio(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.PORTAFOLIOS);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documento de portafolio subido exitosamente", rutaUrl));
    }

    @PostMapping("/subir/vinculacion")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR_ACADEMICO', 'COORDINADOR_PRACTICAS', 'SUBDECANO')")
    public ResponseEntity<RespuestaApi<String>> subirVinculacion(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.VINCULACION);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documento de vinculacion subido exitosamente", rutaUrl));
    }

    @PostMapping("/subir/otros")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<String>> subirOtro(
            @RequestParam("archivo") MultipartFile archivo) {
        String rutaUrl = archivoService.subirArchivo(archivo, TipoArchivoSubido.OTROS);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Archivo subido exitosamente", rutaUrl));
    }

    @GetMapping("/categorias")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<List<Map<String, String>>>> listarCategorias() {
        List<Map<String, String>> categorias = Arrays.stream(TipoArchivoSubido.values())
                .map(tipo -> Map.of(
                        "codigo", tipo.name(),
                        "subcarpeta", tipo.getSubcarpeta(),
                        "descripcion", tipo.getDescripcion()
                ))
                .toList();
        return ResponseEntity.ok(new RespuestaApi<>(true, "Categorias obtenidas exitosamente", categorias));
    }
}
