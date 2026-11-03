package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.ReporteProyectoVcsService;
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
@RequestMapping("/reportes-proyectos-vcs")
@RequiredArgsConstructor
public class ReporteProyectoVcsController {

    private final ReporteProyectoVcsService reporteProyectoVcsService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaApi<ReporteProyectoDto>> buscarPorId(@PathVariable Long id) {
        ReporteProyectoDto reporte = reporteProyectoVcsService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Reporte obtenido con éxito", reporte));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping
    public ResponseEntity<RespuestaApi<Page<ReporteProyectoDto>>> buscarConFiltros(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Long proyectoId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) TipoReporteProyectoVcs tipo,
            @RequestParam(required = false) EstadoRevisionVcs estadoSubdecanato,
            Pageable pageable) {
        Page<ReporteProyectoDto> reportes = reporteProyectoVcsService.buscarConFiltros(
                busqueda,
                proyectoId,
                periodoId,
                tipo,
                estadoSubdecanato,
                pageable
        );
        return ResponseEntity.ok(new RespuestaApi<>(true, "Reportes obtenidos con éxito", reportes));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping("/proyecto/{proyectoId}")
    public ResponseEntity<RespuestaApi<List<ReporteProyectoDto>>> listarPorProyecto(@PathVariable Long proyectoId) {
        List<ReporteProyectoDto> reportes = reporteProyectoVcsService.listarPorProyecto(proyectoId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Reportes del proyecto obtenidos con éxito", reportes));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PostMapping
    public ResponseEntity<RespuestaApi<ReporteProyectoDto>> subirReporte(
            @Valid @RequestBody ReporteProyectoNuevoDto dto) {
        ReporteProyectoDto creado = reporteProyectoVcsService.subirReporte(dto, usuarioAutenticadoService.obtenerUsuarioLogueado());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Reporte subido con éxito", creado));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @PatchMapping("/{id}/revision")
    public ResponseEntity<RespuestaApi<ReporteProyectoDto>> revisarReporteSubdecanato(
            @PathVariable Long id,
            @Valid @RequestBody ReporteRevisionSubdecanatoDto dto) {
        ReporteProyectoDto revisado = reporteProyectoVcsService.revisarReporteSubdecanato(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Reporte revisado con éxito", revisado));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @DeleteMapping("/{id}")
    public ResponseEntity<RespuestaApi<Void>> eliminarReporte(@PathVariable Long id) {
        reporteProyectoVcsService.eliminarReporte(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Reporte eliminado con éxito", null));
    }
}
