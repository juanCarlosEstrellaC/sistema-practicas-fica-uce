package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.PeriodoAcademicoDto;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.services.PeriodoAcademicoService;
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
@RequestMapping("/periodos-academicos")
@RequiredArgsConstructor
public class PeriodoAcademicoController {

    private final PeriodoAcademicoService periodoAcademicoService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Page<PeriodoAcademicoDto>>> listarTodos(
            @RequestParam(required = false, name = "search") String busqueda,
            @RequestParam(required = false, name = "estado") EstadoPeriodo estado,
            Pageable pageable) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Periodos obtenidos", periodoAcademicoService.buscarConFiltros(busqueda, estado, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<PeriodoAcademicoDto>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Periodo obtenido", periodoAcademicoService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<PeriodoAcademicoDto>> crear(@Valid @RequestBody PeriodoAcademicoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Periodo creado exitosamente", periodoAcademicoService.crear(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<PeriodoAcademicoDto>> actualizar(@PathVariable Long id, @Valid @RequestBody PeriodoAcademicoDto dto) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Periodo actualizado exitosamente", periodoAcademicoService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> eliminar(@PathVariable Long id) {
        periodoAcademicoService.eliminar(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Periodo eliminado exitosamente", null));
    }
}
