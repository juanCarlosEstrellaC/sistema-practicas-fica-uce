package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaRevisionTutorDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsNuevoDto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.EvidenciaAsignacionVcsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/evidencias-vcs")
@RequiredArgsConstructor
public class EvidenciaAsignacionVcsController {

    private final EvidenciaAsignacionVcsService evidenciaAsignacionVcsService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaApi<EvidenciaVcsDto>> buscarPorId(@PathVariable Long id) {
        EvidenciaVcsDto evidencia = evidenciaAsignacionVcsService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Evidencia obtenida con éxito", evidencia));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping
    public ResponseEntity<RespuestaApi<Page<EvidenciaVcsDto>>> buscarConFiltros(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Long asignacionId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Long tutorId,
            @RequestParam(required = false) EstadoRevisionVcs estadoTutor,
            Pageable pageable) {
        Page<EvidenciaVcsDto> evidencias = evidenciaAsignacionVcsService.buscarConFiltros(
                busqueda,
                asignacionId,
                estudianteId,
                tutorId,
                estadoTutor,
                pageable
        );
        return ResponseEntity.ok(new RespuestaApi<>(true, "Evidencias obtenidas con éxito", evidencias));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/asignacion/{asignacionId}")
    public ResponseEntity<RespuestaApi<List<EvidenciaVcsDto>>> listarPorAsignacion(@PathVariable Long asignacionId) {
        List<EvidenciaVcsDto> evidencias = evidenciaAsignacionVcsService.listarPorAsignacion(asignacionId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Evidencias de la asignación obtenidas con éxito", evidencias));
    }

    @PreAuthorize("hasRole('ESTUDIANTE')")
    @PostMapping
    public ResponseEntity<RespuestaApi<EvidenciaVcsDto>> subirEvidencia(
            @Valid @RequestBody EvidenciaVcsNuevoDto dto) {
        EvidenciaVcsDto creada = evidenciaAsignacionVcsService.subirEvidencia(dto, usuarioAutenticadoService.obtenerUsuarioLogueado());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Evidencia subida con éxito", creada));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PatchMapping("/{id}/revision-tutor")
    public ResponseEntity<RespuestaApi<EvidenciaVcsDto>> revisarEvidenciaTutor(
            @PathVariable Long id,
            @Valid @RequestBody EvidenciaRevisionTutorDto dto) {
        EvidenciaVcsDto revisada = evidenciaAsignacionVcsService.revisarEvidenciaTutor(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Evidencia revisada con éxito", revisada));
    }

    @PreAuthorize("hasRole('ESTUDIANTE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<RespuestaApi<Void>> eliminarEvidencia(@PathVariable Long id) {
        evidenciaAsignacionVcsService.eliminarEvidencia(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Evidencia eliminada con éxito", null));
    }
}
