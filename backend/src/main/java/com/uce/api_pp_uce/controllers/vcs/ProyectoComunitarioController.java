package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.common.RespuestaArchivoUtil;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.services.vcs.ProyectoComunitarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/proyectos-comunitarios")
@RequiredArgsConstructor
public class ProyectoComunitarioController {

    private final ProyectoComunitarioService proyectoComunitarioService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<ProyectoComunitarioDto>> buscarPorId(
            @PathVariable Long id,
            @RequestParam(required = false) Long periodoId) {
        ProyectoComunitarioDto proyecto = periodoId != null
                ? proyectoComunitarioService.buscarPorId(id, periodoId)
                : proyectoComunitarioService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyecto comunitario obtenido con éxito", proyecto));
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<byte[]> previsualizarDocumento(@PathVariable Long id) {
        ArchivoDescargaDto descarga = proyectoComunitarioService.obtenerProyectoDescarga(id);
        return RespuestaArchivoUtil.previsualizar(descarga);
    }

    @GetMapping("/{id}/descargar")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<byte[]> descargarDocumento(@PathVariable Long id) {
        ArchivoDescargaDto descarga = proyectoComunitarioService.obtenerProyectoDescarga(id);
        return RespuestaArchivoUtil.descargar(descarga);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<Page<ProyectoComunitarioDto>>> buscarConFiltros(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long tutorId,
            @RequestParam(required = false) EstadoProyecto estado,
            @RequestParam(required = false) Long periodoId,
            Pageable pageable) {
        Page<ProyectoComunitarioDto> proyectos = periodoId != null
                ? proyectoComunitarioService.buscarConFiltros(busqueda, carreraId, tutorId, estado, periodoId, pageable)
                : proyectoComunitarioService.buscarConFiltros(busqueda, carreraId, tutorId, estado, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyectos comunitarios obtenidos con éxito", proyectos));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<ProyectoComunitarioDto>> crearProyecto(@Valid @RequestBody ProyectoComunitarioNuevoDto dto) {
        ProyectoComunitarioDto nuevoProyecto = proyectoComunitarioService.crearProyecto(dto);
        return ResponseEntity.status(HttpStatus.CREATED) //201 Created
                .body(new RespuestaApi<>(true, "Proyecto comunitario creado con éxito", nuevoProyecto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<ProyectoComunitarioDto>> actualizarProyecto(
            @PathVariable Long id,
            @Valid @RequestBody ProyectoComunitarioActualizarDto dto) {
        ProyectoComunitarioDto actualizado = proyectoComunitarioService.actualizarProyecto(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyecto comunitario actualizado con éxito", actualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> eliminarProyecto(@PathVariable Long id) {
        proyectoComunitarioService.eliminarProyecto(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyecto comunitario eliminado con éxito", null));
    }
}
