package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.enums.pp.EstadoConvenio;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.services.pp.ConvenioService;
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
@RequestMapping("/convenios")
@RequiredArgsConstructor
public class ConvenioController {

    private final ConvenioService convenioService;

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping
    public ResponseEntity<RespuestaApi<Page<ConvenioDto>>> listarConvenios(
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(required = false) EstadoConvenio estado,
            Pageable pageable) {
        Page<ConvenioDto> convenios = convenioService.buscarConFiltros(search, estado, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Convenios obtenidos con éxito", convenios));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaApi<ConvenioDto>> obtenerConvenio(@PathVariable Long id) {
        ConvenioDto convenio = convenioService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Convenio obtenido con éxito", convenio));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @PostMapping
    public ResponseEntity<RespuestaApi<ConvenioDto>> crearConvenio(@Valid @RequestBody NuevoConvenioDto dto) {
        ConvenioDto nuevoConvenio = convenioService.crearConvenio(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Convenio creado con éxito", nuevoConvenio));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaApi<ConvenioDto>> actualizarConvenio(@PathVariable Long id, @Valid @RequestBody NuevoConvenioDto dto) {
        ConvenioDto actualizado = convenioService.actualizarConvenio(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Convenio actualizado con éxito", actualizado));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @DeleteMapping("/{id}")
    public ResponseEntity<RespuestaApi<Void>> eliminarConvenio(@PathVariable Long id) {
        convenioService.eliminarConvenio(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Convenio eliminado con éxito", null));
    }
}
