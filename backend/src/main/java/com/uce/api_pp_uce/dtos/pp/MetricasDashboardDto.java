package com.uce.api_pp_uce.dtos.pp;

public record MetricasDashboardDto(
        long totalEstudiantes,
        long estudiantesAsignados,
        long estudiantesEnCurso,
        long estudiantesCompletados,
        long totalConvenios,
        long conveniosPorExpirar,
        long conveniosExpirados,
        long totalTutores,
        long reportesPendientes
) {
}
