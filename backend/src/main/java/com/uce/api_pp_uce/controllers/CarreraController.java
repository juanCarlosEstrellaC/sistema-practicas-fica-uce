package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.CarreraDto;
import com.uce.api_pp_uce.services.CarreraService;
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
@RequestMapping("/carreras")
@RequiredArgsConstructor
public class CarreraController {

    private final CarreraService carreraService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Page<CarreraDto>>> obtenerTodas(
            @RequestParam(required = false, name = "search") String search,
            Pageable pageable) {
        Page<CarreraDto> carreras = carreraService.buscarConFiltros(search, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carreras obtenidas exitosamente", carreras));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<CarreraDto>> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carrera obtenida", carreraService.obtenerPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<CarreraDto>> crear(@Valid @RequestBody CarreraDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Carrera creada exitosamente", carreraService.crear(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<CarreraDto>> actualizar(@PathVariable Integer id, @Valid @RequestBody CarreraDto dto) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carrera actualizada", carreraService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> eliminar(@PathVariable Integer id) {
        carreraService.eliminar(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carrera eliminada", null));
    }
}
