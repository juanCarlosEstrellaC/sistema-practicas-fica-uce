package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.common.RespuestaArchivoUtil;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import com.uce.api_pp_uce.services.pp.MatrizCacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matrices-caces")
@RequiredArgsConstructor
public class MatrizCacesController {

    private final MatrizCacesService matrizCacesService;

    @GetMapping("/carrera/{carreraId}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<Page<MatrizCacesDto>>> listarPorCarrera(
            @PathVariable Integer carreraId,
            Pageable pageable) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Listado por carrera", matrizCacesService.listarPorCarrera(carreraId, pageable)));
    }

    @GetMapping("/periodo/{periodoId}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<Page<MatrizCacesDto>>> listarPorPeriodo(
            @PathVariable Long periodoId,
            @RequestParam(required = false) EstadoMatrizCaces estado,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Listado por periodo", matrizCacesService.listarPorPeriodo(periodoId, estado, search, pageable)));
    }

    @GetMapping("/periodo/{periodoId}/carrera/{carreraId}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<MatrizCacesDto>> obtenerPorPeriodoYCarrera(
            @PathVariable Long periodoId,
            @PathVariable Integer carreraId) {
        MatrizCacesDto dto = matrizCacesService.obtenerPorPeriodoYCarrera(periodoId, carreraId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Matriz obtenida", dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<MatrizCacesDto>> crearOActualizar(
            @RequestParam Long periodoAcademicoId,
            @RequestParam Integer carreraId) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Matriz registrada", matrizCacesService.crearOActualizar(periodoAcademicoId, carreraId)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<MatrizCacesDto>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoMatrizCaces estado,
            @RequestParam(required = false) String observacion) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Estado actualizado", matrizCacesService.cambiarEstado(id, estado, observacion)));
    }

    @GetMapping("/{id}/excel")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<byte[]> descargarExcel(@PathVariable Long id) {
        ArchivoDescargaDto descarga = matrizCacesService.obtenerDescargaExcel(id);
        return RespuestaArchivoUtil.descargar(descarga);
    }

    @PatchMapping("/{id}/archivo-firmado")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<MatrizCacesDto>> subirArchivoFirmado(@PathVariable Long id, @RequestParam String urlArchivo) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Archivo firmado actualizado", matrizCacesService.subirArchivoFirmado(id, urlArchivo)));
    }
}
