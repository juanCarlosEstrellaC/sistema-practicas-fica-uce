package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.entities.Notificacion;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.mapeadores.NotificacionMapeador;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificacionSseService {

    private final NotificacionMapeador notificacionMapeador;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final Map<Long, List<SseEmitter>> emisores = new ConcurrentHashMap<>();

    public NotificacionSseService(NotificacionMapeador notificacionMapeador, UsuarioAutenticadoService usuarioAutenticadoService) {
        this.notificacionMapeador = notificacionMapeador;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
    }

    public SseEmitter suscribir(Long usuarioId) {
        Usuario usuario = usuarioAutenticadoService.obtenerUsuarioLogueado();
        if (usuario != null && !usuario.getId().equals(usuarioId)) {
            throw new NegocioException("No tienes permiso para acceder a las notificaciones de otro usuario");
        }
        // Timeout de 30 minutos (1800000ms)
        SseEmitter emisor = new SseEmitter(1800000L);
        emisores.computeIfAbsent(usuarioId, k -> new CopyOnWriteArrayList<>()).add(emisor);

        emisor.onCompletion(() -> eliminarEmisor(usuarioId, emisor));
        emisor.onTimeout(() -> eliminarEmisor(usuarioId, emisor));
        emisor.onError((e) -> eliminarEmisor(usuarioId, emisor));

        try {
            // Enviar evento inicial de confirmación de conexión
            emisor.send(SseEmitter.event().name("INIT").data("Connected"));
        } catch (IOException e) {
            eliminarEmisor(usuarioId, emisor);
        }

        return emisor;
    }

    public void emitirNotificacion(Long usuarioId, Notificacion notificacion) {
        emitirNotificacion(usuarioId, notificacionMapeador.aDto(notificacion));
    }

    public void emitirNotificacion(Long usuarioId, NotificacionRespuestaDto notificacion) {
        List<SseEmitter> emisoresUsuario = emisores.get(usuarioId);
        if (emisoresUsuario != null) {
            List<SseEmitter> emisoresInactivos = new ArrayList<>();
            emisoresUsuario.forEach(emisor -> {
                try {
                    emisor.send(SseEmitter.event().name("NOTIFICACION").data(notificacion));
                } catch (IOException e) {
                    emisoresInactivos.add(emisor);
                }
            });
            emisoresUsuario.removeAll(emisoresInactivos);
        }
    }

    /**
     * Envia un ping heartbeat cada 35 segundos para mantener vivas las conexiones SSE activas.
     */
    @Scheduled(fixedRate = 35000)
    public void enviarHeartbeat() {
        if (emisores.isEmpty()) return;

        emisores.forEach((usuarioId, listaEmisores) -> {
            List<SseEmitter> emisoresInactivos = new ArrayList<>();
            for (SseEmitter emisor : listaEmisores) {
                try {
                    emisor.send(SseEmitter.event().name("PING").data("keep-alive"));
                } catch (Exception e) {
                    emisoresInactivos.add(emisor);
                }
            }
            if (!emisoresInactivos.isEmpty()) {
                listaEmisores.removeAll(emisoresInactivos);
            }
        });
    }

    private void eliminarEmisor(Long usuarioId, SseEmitter emisor) {
        List<SseEmitter> emisoresUsuario = emisores.get(usuarioId);
        if (emisoresUsuario != null) {
            emisoresUsuario.remove(emisor);
            if (emisoresUsuario.isEmpty()) {
                emisores.remove(usuarioId);
            }
        }
    }
}
