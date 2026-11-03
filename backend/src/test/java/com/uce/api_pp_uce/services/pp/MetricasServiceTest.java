package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.MetricasDashboardDto;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.services.pp.impl.MetricasServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetricasServiceTest {

    @Mock
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Mock
    private ConvenioRepository convenioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private MetricasServiceImpl metricasService;

    @Test
    @DisplayName("Debe calcular metricas globales correctamente")
    void obtenerMetricasGlobales_Exitoso() {
        Long periodoId = 1L;

        when(usuarioRepository.countByRol(RolUsuario.ESTUDIANTE)).thenReturn(100L);
        when(asignacionPracticaRepository.countByFiltros(null, periodoId, null, null)).thenReturn(80L);
        when(asignacionPracticaRepository.countByFiltros(null, periodoId, null, EstadoAsignacion.EN_CURSO)).thenReturn(50L);
        when(asignacionPracticaRepository.countByFiltros(null, periodoId, null, EstadoAsignacion.APROBADO)).thenReturn(30L);
        when(convenioRepository.count()).thenReturn(15L);
        when(convenioRepository.countByEstado(EstadoConvenio.POR_EXPIRAR)).thenReturn(2L);
        when(convenioRepository.countByEstado(EstadoConvenio.EXPIRADO)).thenReturn(1L);
        when(usuarioRepository.countByRol(RolUsuario.TUTOR_ACADEMICO)).thenReturn(10L);

        MetricasDashboardDto resultado = metricasService.obtenerMetricasGlobales(periodoId);

        assertNotNull(resultado);
        assertEquals(100L, resultado.totalEstudiantes());
        assertEquals(80L, resultado.estudiantesAsignados());
        assertEquals(50L, resultado.estudiantesEnCurso());
        assertEquals(30L, resultado.estudiantesCompletados());
        assertEquals(15L, resultado.totalConvenios());
        assertEquals(2L, resultado.conveniosPorExpirar());
        assertEquals(1L, resultado.conveniosExpirados());
        assertEquals(10L, resultado.totalTutores());
        assertEquals(0L, resultado.reportesPendientes());

        verify(usuarioRepository).countByRol(RolUsuario.ESTUDIANTE);
        verify(convenioRepository).count();
    }

    @Test
    @DisplayName("Debe calcular metricas por carrera correctamente")
    void obtenerMetricasPorCarrera_Exitoso() {
        Integer carreraId = 5;
        Long periodoId = 2L;
        Long tutorId = 12L;

        when(usuarioRepository.countByRolAndCarreraId(RolUsuario.ESTUDIANTE, carreraId)).thenReturn(40L);
        when(asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, null)).thenReturn(35L);
        when(asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, EstadoAsignacion.EN_CURSO)).thenReturn(20L);
        when(asignacionPracticaRepository.countByFiltros(carreraId, periodoId, tutorId, EstadoAsignacion.APROBADO)).thenReturn(15L);
        when(convenioRepository.count()).thenReturn(15L);
        when(convenioRepository.countByEstado(EstadoConvenio.POR_EXPIRAR)).thenReturn(3L);
        when(convenioRepository.countByEstado(EstadoConvenio.EXPIRADO)).thenReturn(2L);
        when(usuarioRepository.countByRolAndCarreraId(RolUsuario.TUTOR_ACADEMICO, carreraId)).thenReturn(6L);

        MetricasDashboardDto resultado = metricasService.obtenerMetricasPorCarrera(carreraId, periodoId, tutorId);

        assertNotNull(resultado);
        assertEquals(40L, resultado.totalEstudiantes());
        assertEquals(35L, resultado.estudiantesAsignados());
        assertEquals(20L, resultado.estudiantesEnCurso());
        assertEquals(15L, resultado.estudiantesCompletados());
        assertEquals(15L, resultado.totalConvenios());
        assertEquals(3L, resultado.conveniosPorExpirar());
        assertEquals(2L, resultado.conveniosExpirados());
        assertEquals(6L, resultado.totalTutores());
        assertEquals(0L, resultado.reportesPendientes());

        verify(usuarioRepository).countByRolAndCarreraId(RolUsuario.ESTUDIANTE, carreraId);
        verify(usuarioRepository).countByRolAndCarreraId(RolUsuario.TUTOR_ACADEMICO, carreraId);
    }
}
