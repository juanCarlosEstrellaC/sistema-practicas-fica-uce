package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.entities.Notificacion;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.NotificacionMapeador;
import com.uce.api_pp_uce.repositories.NotificacionRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.NotificacionSseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionSseService notificacionSseService;
    private final NotificacionMapeador notificacionMapeador;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificacionRespuestaDto> listarPorUsuario(Long usuarioId, Pageable pageable) {
        return notificacionRepository.findByUsuarioId(usuarioId, pageable)
                .map(notificacionMapeador::aDto);
    }

    @Override
    @Transactional
    public NotificacionRespuestaDto marcarComoLeida(Long id) {
        Notificacion notif = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación no encontrada"));
        notif.setLeida(true);
        return notificacionMapeador.aDto(notificacionRepository.save(notif));
    }

    @Override
    @Transactional
    public int marcarTodasComoLeidas(Long usuarioId) {
        return notificacionRepository.marcarTodasComoLeidas(usuarioId);
    }

    @Override
    @Transactional
    public void enviar(Usuario usuario, String titulo, String mensaje, TipoNotificacion tipo, String accionUrl) {
        if (usuario == null || usuario.getId() == null) {
            return;
        }

        Notificacion notif = new Notificacion();
        notif.setUsuario(usuario);
        notif.setTitulo(titulo);
        notif.setMensaje(mensaje);
        notif.setTipo(tipo);
        notif.setAccionUrl(accionUrl);
        notif.setLeida(false);
        Notificacion guardada = notificacionRepository.save(notif);

        // Emitir notificacion por SSE
        notificacionSseService.emitirNotificacion(usuario.getId(), guardada);
    }

    @Override
    @Transactional
    public void enviar(Long usuarioId, String titulo, String mensaje, TipoNotificacion tipo, String accionUrl) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        enviar(usuario, titulo, mensaje, tipo, accionUrl);
    }
}
