package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.entities.Notificacion;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.mapeadores.NotificacionMapeador;
import com.uce.api_pp_uce.repositories.NotificacionRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.services.impl.NotificacionServiceImpl;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NotificacionSseService notificacionSseService;

    @Mock
    private NotificacionMapeador notificacionMapeador;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private NotificacionServiceImpl notificacionService;

    private Usuario usuarioMock;
    private Notificacion notificacionMock;
    private NotificacionRespuestaDto notificacionDtoMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(10L);
        usuarioMock.setCorreo("test@uce.edu.ec");

        notificacionMock = new Notificacion();
        notificacionMock.setId(100L);
        notificacionMock.setUsuario(usuarioMock);
        notificacionMock.setTitulo("Aviso");
        notificacionMock.setMensaje("Mensaje de prueba");
        notificacionMock.setTipo(TipoNotificacion.INFORMACION);
        notificacionMock.setLeida(false);

        notificacionDtoMock = new NotificacionRespuestaDto(
                100L, 10L, "Aviso", "Mensaje de prueba", TipoNotificacion.INFORMACION, null, false, LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("listarPorUsuario - Permite consultar notificaciones propias")
    void listarPorUsuario_Propio_Exitoso() {
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioMock);
        when(notificacionRepository.findByUsuarioId(10L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(notificacionMock)));
        when(notificacionMapeador.aDto(notificacionMock)).thenReturn(notificacionDtoMock);

        Page<NotificacionRespuestaDto> resultado = notificacionService.listarPorUsuario(10L, PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    @DisplayName("listarPorUsuario - Lanza NegocioException si intenta consultar notificaciones de otro usuario")
    void listarPorUsuario_UsuarioAjeno_LanzaNegocioException() {
        Usuario usuarioAjeno = new Usuario();
        usuarioAjeno.setId(99L);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioAjeno);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                notificacionService.listarPorUsuario(10L, PageRequest.of(0, 10)));
        assertTrue(ex.getMessage().contains("otro usuario"));
    }

    @Test
    @DisplayName("marcarComoLeida - Lanza NegocioException si la notificación pertenece a otro usuario")
    void marcarComoLeida_NotificacionAjena_LanzaNegocioException() {
        Usuario usuarioAjeno = new Usuario();
        usuarioAjeno.setId(99L);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioAjeno);
        when(notificacionRepository.findById(100L)).thenReturn(Optional.of(notificacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                notificacionService.marcarComoLeida(100L));
        assertTrue(ex.getMessage().contains("otro usuario"));
    }

    @Test
    @DisplayName("marcarComoLeida - Marca como leída exitosamente para el propio usuario")
    void marcarComoLeida_Propio_Exitoso() {
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioMock);
        when(notificacionRepository.findById(100L)).thenReturn(Optional.of(notificacionMock));
        when(notificacionRepository.save(any(Notificacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(notificacionMapeador.aDto(any(Notificacion.class))).thenReturn(notificacionDtoMock);

        NotificacionRespuestaDto resultado = notificacionService.marcarComoLeida(100L);

        assertNotNull(resultado);
        assertTrue(notificacionMock.getLeida());
        verify(notificacionRepository).save(notificacionMock);
    }
}
