package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import com.uce.api_pp_uce.services.pp.ObservacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/observaciones")
@RequiredArgsConstructor
public class ObservacionController {

    private final ObservacionService observacionService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<ObservacionDto>> sugerir(@Valid @RequestBody NuevaObservacionDto solicitud) {
        ObservacionDto observacion = observacionService.crearObservacion(solicitud);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Observación enviada", observacion));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<Page<ObservacionDto>>> listar(
            @RequestParam(required = false) Long remitenteId,
            @RequestParam(required = false) TipoObservacion tipo,
            @RequestParam(required = false) EstadoObservacion estado,
            @RequestParam(required = false, name = "search") String busqueda,
            Pageable pageable) {
        Page<ObservacionDto> observaciones = observacionService.listarTodas(remitenteId, tipo, estado, busqueda, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Observaciones obtenidas", observaciones));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<ObservacionDto>> obtenerPorId(@PathVariable Long id) {
        ObservacionDto observacion = observacionService.obtenerPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Observación obtenida", observacion));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<ObservacionDto>> procesar(
        @PathVariable Long id, @RequestParam EstadoObservacion estado, @RequestParam(required = false) String motivoRechazo) {
        ObservacionDto observacion = observacionService.procesarObservacion(id, estado, motivoRechazo);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Observación procesada", observacion));
    }
}
