package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.MetricasDashboardDto;
import com.uce.api_pp_uce.entities.Usuario;

public interface MetricasService {
    MetricasDashboardDto obtenerMetricasGlobales(Long periodoId);
    MetricasDashboardDto obtenerMetricasPorCarrera(Integer carreraId, Long periodoId, Long tutorId);
    MetricasDashboardDto obtenerMetricasPorCarrera(Integer carreraId, Long periodoId, Long tutorId, Usuario usuarioAutenticado);
}
