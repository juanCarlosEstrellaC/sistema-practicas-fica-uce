package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.dtos.pp.MetricasDashboardDto;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.services.pp.MetricasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MetricasServiceImpl implements MetricasService {

    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final ConvenioRepository convenioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public MetricasDashboardDto obtenerMetricasGlobales(Long periodoId) {
        long totalEstudiantes = usuarioRepository.countByRol(RolUsuario.ESTUDIANTE);
        long estudiantesAsignados = asignacionPracticaRepository.countByFiltros(null, periodoId, null, null);
        long estudiantesEnCurso = asignacionPracticaRepository.countByFiltros(null, periodoId, null, EstadoAsignacion.EN_CURSO);
        long estudiantesCompletados = asignacionPracticaRepository.countByFiltros(null, periodoId, null, EstadoAsignacion.APROBADO);
        long totalConvenios = convenioRepository.count();
        long conveniosPorExpirar = convenioRepository.countByEstado(EstadoConvenio.POR_EXPIRAR);
        long conveniosExpirados = convenioRepository.countByEstado(EstadoConvenio.EXPIRADO);
        long totalTutores = usuarioRepository.countByRol(RolUsuario.TUTOR_ACADEMICO);
        long reportesPendientes = 0; // Se puede implementar luego

        return new MetricasDashboardDto(
                totalEstudiantes,
                estudiantesAsignados,
                estudiantesEnCurso,
                estudiantesCompletados,
                totalConvenios,
                conveniosPorExpirar,
                conveniosExpirados,
                totalTutores,
                reportesPendientes
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MetricasDashboardDto obtenerMetricasPorCarrera(Integer carreraId, Long periodoId, Long tutorId) {
        long totalEstudiantes = usuarioRepository.countByRolAndCarreraId(RolUsuario.ESTUDIANTE, carreraId);
        long estudiantesAsignados = asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, null);
        long estudiantesEnCurso = asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, EstadoAsignacion.EN_CURSO);
        long estudiantesCompletados = asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, EstadoAsignacion.APROBADO);
        long totalConvenios = convenioRepository.count(); // Convenios son globales
        long conveniosPorExpirar = convenioRepository.countByEstado(EstadoConvenio.POR_EXPIRAR);
        long conveniosExpirados = convenioRepository.countByEstado(EstadoConvenio.EXPIRADO);
        long totalTutores = usuarioRepository.countByRolAndCarreraId(RolUsuario.TUTOR_ACADEMICO, carreraId);
        long reportesPendientes = 0;

        return new MetricasDashboardDto(
                totalEstudiantes,
                estudiantesAsignados,
                estudiantesEnCurso,
                estudiantesCompletados,
                totalConvenios,
                conveniosPorExpirar,
                conveniosExpirados,
                totalTutores,
                reportesPendientes
        );
    }
}
