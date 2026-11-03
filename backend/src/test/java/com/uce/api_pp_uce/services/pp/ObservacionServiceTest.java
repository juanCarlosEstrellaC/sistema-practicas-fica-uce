package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.Observacion;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.pp.ObservacionMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.ObservacionRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.impl.ObservacionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ObservacionServiceTest {

    @Mock
    private ObservacionRepository observacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private ObservacionMapeador observacionMapeador;

    @InjectMocks
    private ObservacionServiceImpl observacionService;

    private Usuario remitenteMock;
    private Usuario subdecanoMock;
    private Carrera carreraMock;
    private Observacion observacionMock;
    private ObservacionDto observacionDtoMock;

    @BeforeEach
    void setUp() {
        remitenteMock = new Usuario();
        remitenteMock.setId(10L);
        remitenteMock.setNombres("Juan");
        remitenteMock.setApellidos("Perez");
        remitenteMock.setRol(RolUsuario.ESTUDIANTE);
        remitenteMock.setIdentificacion("1711111111");

        subdecanoMock = new Usuario();
        subdecanoMock.setId(20L);
        subdecanoMock.setNombres("Carlos");
        subdecanoMock.setApellidos("Mendoza");
        subdecanoMock.setRol(RolUsuario.SUBDECANO);
        subdecanoMock.setIdentificacion("1722222222");

        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Ingenieria en Computacion");

        observacionMock = new Observacion();
        observacionMock.setId(100L);
        observacionMock.setRemitente(remitenteMock);
        observacionMock.setCarrera(carreraMock);
        observacionMock.setTipo(TipoObservacion.NUEVA);
        observacionMock.setEmpresa("Tech Corp");
        observacionMock.setContacto("0999999999");
        observacionMock.setCorreo("contacto@techcorp.com");
        observacionMock.setDescripcion("Propuesta de nuevo convenio");
        observacionMock.setEstado(EstadoObservacion.PENDIENTE);

        UsuarioResumenDto resumenMock = new UsuarioResumenDto(
                10L,
                "Juan",
                "Perez",
                "1711111111",
                TipoIdentificacionUsuario.CEDULA,
                "juan@uce.edu.ec",
                "0999999999",
                "Ingenieria en Computacion",
                1,
                null
        );

        observacionDtoMock = new ObservacionDto(
                100L,
                resumenMock,
                10L,
                1,
                "Ingenieria en Computacion",
                null,
                "Tech Corp",
                TipoObservacion.NUEVA,
                "0999999999",
                "contacto@techcorp.com",
                "Propuesta de nuevo convenio",
                EstadoObservacion.PENDIENTE,
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("Debe crear una observacion exitosamente y notificar a subdecano y remitente")
    void crearObservacion_Exitoso() {
        NuevaObservacionDto dto = new NuevaObservacionDto(
                10L,
                1,
                TipoObservacion.NUEVA,
                "Tech Corp",
                "0999999999",
                "contacto@techcorp.com",
                "Propuesta de nuevo convenio"
        );

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(remitenteMock));
        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(observacionMapeador.aEntidad(any(NuevaObservacionDto.class))).thenReturn(observacionMock);
        when(observacionRepository.save(any(Observacion.class))).thenReturn(observacionMock);
        when(usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO)).thenReturn(Optional.of(subdecanoMock));
        when(observacionMapeador.aDto(any(Observacion.class))).thenReturn(observacionDtoMock);

        ObservacionDto resultado = observacionService.crearObservacion(dto);

        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
        assertEquals("Tech Corp", resultado.empresa());

        verify(observacionRepository).save(any(Observacion.class));
        verify(notificacionService).enviar(eq(subdecanoMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
        verify(notificacionService).enviar(eq(remitenteMock), any(String.class), any(String.class), eq(TipoNotificacion.EXITO), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si el remitente no existe")
    void crearObservacion_RemitenteNoExiste() {
        NuevaObservacionDto dto = new NuevaObservacionDto(
                99L,
                1,
                TipoObservacion.NUEVA,
                "Empresa",
                "0999999999",
                "empresa@test.com",
                "Descripcion"
        );

        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> observacionService.crearObservacion(dto));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si la carrera no existe")
    void crearObservacion_CarreraNoExiste() {
        NuevaObservacionDto dto = new NuevaObservacionDto(
                10L,
                99,
                TipoObservacion.NUEVA,
                "Empresa",
                "0999999999",
                "empresa@test.com",
                "Descripcion"
        );

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(remitenteMock));
        when(carreraRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> observacionService.crearObservacion(dto));
    }

    @Test
    @DisplayName("Debe listar observaciones con filtros paginadas")
    void listarTodas_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Observacion> paginaObservaciones = new PageImpl<>(List.of(observacionMock));

        when(observacionRepository.findByFiltros(10L, TipoObservacion.NUEVA, EstadoObservacion.PENDIENTE, "Tech", pageable))
                .thenReturn(paginaObservaciones);
        when(observacionMapeador.aDto(observacionMock)).thenReturn(observacionDtoMock);

        Page<ObservacionDto> resultado = observacionService.listarTodas(10L, TipoObservacion.NUEVA, EstadoObservacion.PENDIENTE, "Tech", pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(100L, resultado.getContent().get(0).id());
    }

    @Test
    @DisplayName("Debe procesar observacion aprobandola y notificando al remitente")
    void procesarObservacion_Aprobada_Exitoso() {
        when(observacionRepository.findById(100L)).thenReturn(Optional.of(observacionMock));
        when(observacionRepository.save(any(Observacion.class))).thenReturn(observacionMock);
        when(observacionMapeador.aDto(any(Observacion.class))).thenReturn(observacionDtoMock);

        ObservacionDto resultado = observacionService.procesarObservacion(100L, EstadoObservacion.APROBADA, null);

        assertNotNull(resultado);
        assertEquals(EstadoObservacion.APROBADA, observacionMock.getEstado());
        verify(notificacionService).enviar(eq(remitenteMock), any(String.class), any(String.class), eq(TipoNotificacion.EXITO), any(String.class));
    }

    @Test
    @DisplayName("Debe procesar observacion rechazandola con motivo")
    void procesarObservacion_RechazadaConMotivo_Exitoso() {
        when(observacionRepository.findById(100L)).thenReturn(Optional.of(observacionMock));
        when(observacionRepository.save(any(Observacion.class))).thenReturn(observacionMock);
        when(observacionMapeador.aDto(any(Observacion.class))).thenReturn(observacionDtoMock);

        observacionService.procesarObservacion(100L, EstadoObservacion.RECHAZADA, "Faltan documentos requeridos");

        assertEquals(EstadoObservacion.RECHAZADA, observacionMock.getEstado());
        assertTrue(observacionMock.getDescripcion().contains("Motivo de rechazo: Faltan documentos requeridos"));
        verify(notificacionService).enviar(eq(remitenteMock), any(String.class), any(String.class), eq(TipoNotificacion.ADVERTENCIA), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException al procesar observacion inexistente")
    void procesarObservacion_NoExiste() {
        when(observacionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                observacionService.procesarObservacion(999L, EstadoObservacion.APROBADA, null));
    }
}
