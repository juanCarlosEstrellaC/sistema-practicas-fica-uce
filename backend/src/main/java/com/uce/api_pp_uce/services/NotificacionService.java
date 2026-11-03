package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificacionService {
    Page<NotificacionRespuestaDto> listarPorUsuario(Long usuarioId, Pageable pageable);
    NotificacionRespuestaDto marcarComoLeida(Long id);
    int marcarTodasComoLeidas(Long usuarioId);
    void enviar(Long usuarioId, String titulo, String mensaje, TipoNotificacion tipo, String accionUrl);
    void enviar(Usuario usuario, String titulo, String mensaje, TipoNotificacion tipo, String accionUrl);
}
