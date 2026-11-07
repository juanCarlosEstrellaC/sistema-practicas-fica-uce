package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.NotificacionSseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificacionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private NotificacionSseService notificacionSseService;

    @InjectMocks
    private NotificacionController notificacionController;

    private NotificacionRespuestaDto notificacionDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificacionController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        notificacionDtoMock = new NotificacionRespuestaDto(
                100L, 10L, "Aviso", "Mensaje", TipoNotificacion.INFORMACION, null, false, LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /notificaciones/usuario/{usuarioId} - Debe listar notificaciones del usuario")
    void listarPorUsuario_Exitoso() throws Exception {
        when(notificacionService.listarPorUsuario(eq(10L), any()))
                .thenReturn(new PageImpl<>(List.of(notificacionDtoMock), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/notificaciones/usuario/10?page=0&size=10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(100));

        verify(notificacionService).listarPorUsuario(eq(10L), any());
    }

    @Test
    @DisplayName("PATCH /notificaciones/{id}/leer - Debe marcar notificacion como leida")
    void marcarComoLeida_Exitoso() throws Exception {
        when(notificacionService.marcarComoLeida(100L)).thenReturn(notificacionDtoMock);

        mockMvc.perform(patch("/notificaciones/100/leer")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));

        verify(notificacionService).marcarComoLeida(100L);
    }

    @Test
    @DisplayName("PATCH /notificaciones/usuario/{usuarioId}/leer-todas - Debe marcar todas como leidas")
    void marcarTodasComoLeidas_Exitoso() throws Exception {
        when(notificacionService.marcarTodasComoLeidas(10L)).thenReturn(5);

        mockMvc.perform(patch("/notificaciones/usuario/10/leer-todas")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data").value(5));

        verify(notificacionService).marcarTodasComoLeidas(10L);
    }

    @Test
    @DisplayName("GET /notificaciones/stream/{usuarioId} - Debe delegar a notificacionSseService")
    void streamNotificaciones_Exitoso() throws Exception {
        when(notificacionSseService.suscribir(10L)).thenReturn(new SseEmitter());

        mockMvc.perform(get("/notificaciones/stream/10"))
                .andExpect(status().isOk());

        verify(notificacionSseService).suscribir(10L);
    }
}
