package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.services.pp.impl.ConvenioServiceImpl;
import com.uce.api_pp_uce.mapeadores.pp.ConvenioMapeador;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConvenioServiceTest {

    @Mock
    private ConvenioRepository convenioRepository;

    @Mock
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Spy
    private ConvenioMapeador convenioMapeador = Mappers.getMapper(ConvenioMapeador.class);

    @InjectMocks
    private ConvenioServiceImpl convenioService;

    private Convenio convenioMock;
    private NuevoConvenioDto nuevoConvenioDtoMock;

    @BeforeEach
    void setUp() {
        convenioMock = new Convenio();
        convenioMock.setId(1L);
        convenioMock.setInstitucion("Ministerio de Telecomunicaciones");
        convenioMock.setTipo(TipoConvenio.PUBLICO);
        convenioMock.setDireccion("Av. 6 de Diciembre y Colón");
        convenioMock.setFechaInicio(LocalDate.now().minusMonths(2));
        convenioMock.setFechaFin(LocalDate.now().plusMonths(10));
        convenioMock.setCuposDisponibles(5);
        convenioMock.setEstado(EstadoConvenio.ACTIVO);
        convenioMock.setTutorInstitucional("Ing. Roberto Gomez");
        convenioMock.setCorreoTutor("roberto.gomez@mintel.gob.ec");
        convenioMock.setTelefonoTutor("0991234567");

        nuevoConvenioDtoMock = new NuevoConvenioDto(
                "Ministerio de Telecomunicaciones",
                TipoConvenio.PUBLICO,
                new BigDecimal("10.5"),
                "Av. 6 de Diciembre y Colón",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusMonths(12),
                "Ing. Roberto Gomez",
                "roberto.gomez@mintel.gob.ec",
                "0991234567",
                5,
                "/archivos_subidos/convenios/convenio_mintel.pdf",
                "Convenio_MINTEL.pdf",
                EstadoConvenio.ACTIVO
        );
    }

    @Test
    @DisplayName("Deberia crear un convenio exitosamente (Caso Feliz)")
    void crearConvenio_Exitoso() {
        when(convenioRepository.save(any(Convenio.class))).thenReturn(convenioMock);
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(eq(1L), eq(EstadoAsignacion.EN_CURSO))).thenReturn(1L);

        ConvenioDto resultado = convenioService.crearConvenio(nuevoConvenioDtoMock);

        assertNotNull(resultado);
        assertEquals(convenioMock.getId(), resultado.id());
        assertEquals("Ministerio de Telecomunicaciones", resultado.institucion());
        assertEquals(1, resultado.ocupados());
        verify(convenioRepository, times(1)).save(any(Convenio.class));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si fecha fin es anterior a fecha inicio (Caso Limite)")
    void crearConvenio_FechaFinInvalida_LanzaExcepcion() {
        NuevoConvenioDto dtoInvalido = new NuevoConvenioDto(
                "Empresa Invalida",
                TipoConvenio.PRIVADO,
                new BigDecimal("5.0"),
                "Calle Falsa 123",
                LocalDate.now().plusMonths(2),
                LocalDate.now().plusMonths(1), // Fecha fin anterior a fecha inicio
                "Tutor X",
                "tutor@x.com",
                "0990000000",
                3,
                null,
                null,
                EstadoConvenio.ACTIVO
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                convenioService.crearConvenio(dtoInvalido));

        assertTrue(ex.getMessage().contains("estrictamente posterior"));
        verify(convenioRepository, never()).save(any(Convenio.class));
    }

    @Test
    @DisplayName("Deberia buscar convenio por ID existente (Caso Feliz)")
    void buscarPorId_Exitoso() {
        when(convenioRepository.findById(1L)).thenReturn(Optional.of(convenioMock));
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(eq(1L), eq(EstadoAsignacion.EN_CURSO))).thenReturn(2L);

        ConvenioDto resultado = convenioService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals(2, resultado.ocupados());
        verify(convenioRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el convenio no existe por ID (Caso Limite)")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(convenioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                convenioService.buscarPorId(999L));
    }

    @Test
    @DisplayName("Deberia actualizar convenio exitosamente (Caso Feliz)")
    void actualizarConvenio_Exitoso() {
        when(convenioRepository.findById(1L)).thenReturn(Optional.of(convenioMock));
        when(convenioRepository.save(any(Convenio.class))).thenReturn(convenioMock);
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(eq(1L), eq(EstadoAsignacion.EN_CURSO))).thenReturn(0L);

        ConvenioDto resultado = convenioService.actualizarConvenio(1L, nuevoConvenioDtoMock);

        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        verify(convenioRepository, times(1)).save(convenioMock);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al actualizar convenio inexistente (Caso Limite)")
    void actualizarConvenio_NoEncontrado_LanzaExcepcion() {
        when(convenioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                convenioService.actualizarConvenio(999L, nuevoConvenioDtoMock));
    }

    @Test
    @DisplayName("Deberia eliminar convenio existente (Caso Feliz)")
    void eliminarConvenio_Exitoso() {
        when(convenioRepository.findById(1L)).thenReturn(Optional.of(convenioMock));
        doNothing().when(convenioRepository).delete(convenioMock);

        assertDoesNotThrow(() -> convenioService.eliminarConvenio(1L));
        verify(convenioRepository, times(1)).delete(convenioMock);
    }

    @Test
    @DisplayName("Deberia actualizar estados de convenios programado a EXPIRADO o POR_EXPIRAR (Caso Limite Cron)")
    void actualizarEstadosConvenios_Programado() {
        Convenio convenioPorExpirar = new Convenio();
        convenioPorExpirar.setId(2L);
        convenioPorExpirar.setEstado(EstadoConvenio.ACTIVO);
        convenioPorExpirar.setFechaFin(LocalDate.now().plusMonths(3)); // Menor o igual a 6 meses

        Convenio convenioExpirado = new Convenio();
        convenioExpirado.setId(3L);
        convenioExpirado.setEstado(EstadoConvenio.ACTIVO);
        convenioExpirado.setFechaFin(LocalDate.now().minusDays(1)); // Ya pasó la fecha fin

        when(convenioRepository.findByEstadoIn(anyList())).thenReturn(List.of(convenioPorExpirar, convenioExpirado));

        convenioService.actualizarEstadosConvenios();

        assertEquals(EstadoConvenio.POR_EXPIRAR, convenioPorExpirar.getEstado());
        assertEquals(EstadoConvenio.EXPIRADO, convenioExpirado.getEstado());
        verify(convenioRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Deberia listar convenios activos y con cupos disponibles (Caso Feliz)")
    void buscarConveniosActivosYCuposDisponibles_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Convenio> pagina = new PageImpl<>(List.of(convenioMock));

        when(convenioRepository.findByEstadoAndCuposDisponibles(eq(EstadoConvenio.ACTIVO), eq(0), eq(pageable)))
                .thenReturn(pagina);
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(eq(1L), eq(EstadoAsignacion.EN_CURSO))).thenReturn(1L);

        Page<ConvenioDto> resultado = convenioService.buscarConveniosActivosYCuposDisponibles(pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("Ministerio de Telecomunicaciones", resultado.getContent().get(0).institucion());
    }
}
