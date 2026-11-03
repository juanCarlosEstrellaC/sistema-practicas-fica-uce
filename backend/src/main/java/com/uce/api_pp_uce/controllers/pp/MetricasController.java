package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.pp.MetricasDashboardDto;
import com.uce.api_pp_uce.services.pp.MetricasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/metricas")
@RequiredArgsConstructor
public class MetricasController {

    private final MetricasService metricasService;

    @GetMapping("/globales")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<MetricasDashboardDto>> obtenerMetricasGlobales(@RequestParam(required = false) Long periodoId) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Métricas globales obtenidas exitosamente", metricasService.obtenerMetricasGlobales(periodoId)));
    }

    @GetMapping("/carrera/{carreraId}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<MetricasDashboardDto>> obtenerMetricasPorCarrera(@PathVariable Integer carreraId, @RequestParam(required = false) Long periodoId, @RequestParam(required = false) Long tutorId) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Métricas por carrera obtenidas exitosamente", metricasService.obtenerMetricasPorCarrera(carreraId, periodoId, tutorId)));
    }
}
