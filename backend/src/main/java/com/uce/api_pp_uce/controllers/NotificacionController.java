package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.NotificacionDto;
import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.NotificacionSseService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final NotificacionSseService notificacionSseService;

    @GetMapping("/stream/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    public SseEmitter streamNotificaciones(@PathVariable Long usuarioId) {
        return notificacionSseService.suscribir(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Page<NotificacionRespuestaDto>>> listarPorUsuario(
            @PathVariable Long usuarioId,
            Pageable pageable) {
        Page<NotificacionRespuestaDto> notificaciones = notificacionService.listarPorUsuario(usuarioId, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Notificaciones obtenidas", notificaciones));
    }

    @PatchMapping("/{id}/leer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<NotificacionRespuestaDto>> marcarComoLeida(@PathVariable Long id) {
        NotificacionRespuestaDto notif = notificacionService.marcarComoLeida(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Notificación marcada como leída", notif));
    }

    @PatchMapping("/usuario/{usuarioId}/leer-todas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Integer>> marcarTodasComoLeidas(@PathVariable Long usuarioId) {
        int actualizadas = notificacionService.marcarTodasComoLeidas(usuarioId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Todas las notificaciones marcadas como leídas", actualizadas));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<Void>> crearNotificacion(@RequestBody NotificacionDto dto) {
        notificacionService.enviar(dto.usuarioId(), dto.titulo(), dto.mensaje(), dto.tipo(), dto.accionUrl());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Notificación creada", null));
    }
}
