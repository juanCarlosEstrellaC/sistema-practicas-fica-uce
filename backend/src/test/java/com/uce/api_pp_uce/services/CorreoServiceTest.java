package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.services.impl.CorreoServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CorreoServiceTest {

    @Mock
    private JavaMailSender remitenteCorreo;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NotificacionService notificacionService;

    @InjectMocks
    private CorreoServiceImpl correoService;

    @Test
    @DisplayName("Deberia enviar correo de texto exitosamente al primer intento")
    void enviarCorreoTextoExitosoPrimerIntento() {
        doNothing().when(remitenteCorreo).send(any(SimpleMailMessage.class));

        correoService.enviarCorreoTexto("estudiante@uce.edu.ec", "Bienvenido", "Contenido");

        verify(remitenteCorreo, times(1)).send(any(SimpleMailMessage.class));
        verify(notificacionService, times(0)).enviar(any(Usuario.class), anyString(), anyString(), any(TipoNotificacion.class), anyString());
    }

    @Test
    @DisplayName("Deberia reintentar y notificar a subdecanos si se agotan todos los intentos")
    void enviarCorreoTextoAgotadoNotificaSubdecanos() {
        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);
        subdecano.setNombres("Subdecano");
        subdecano.setCorreo("subdecano@uce.edu.ec");

        doThrow(new MailSendException("Fallo conexion SMTP")).when(remitenteCorreo).send(any(SimpleMailMessage.class));
        when(usuarioRepository.findByRol(RolUsuario.SUBDECANO)).thenReturn(List.of(subdecano));

        correoService.enviarCorreoTexto("estudiante@uce.edu.ec", "Activacion", "Contenido");

        // 3 intentos maximos
        verify(remitenteCorreo, times(3)).send(any(SimpleMailMessage.class));
        // Notificacion interna enviada al subdecano con TipoNotificacion.ERROR
        verify(notificacionService, times(1)).enviar(
                eq(subdecano),
                eq("Fallo de entrega de correo"),
                anyString(),
                eq(TipoNotificacion.ERROR),
                eq("/dashboard/usuarios")
        );
    }

    @Test
    @DisplayName("Deberia notificar al Director de Carrera (DC) cuando falla la entrega de Carta de Asignacion")
    void enviarCartaAsignacionAgotadoNotificaDirectoresCarrera() {
        Usuario dc = new Usuario();
        dc.setId(2L);
        dc.setRol(RolUsuario.DIRECTOR_CARRERA);
        dc.setNombres("Director");
        dc.setCorreo("dc@uce.edu.ec");

        doThrow(new MailSendException("Fallo conexion SMTP")).when(remitenteCorreo).send(any(SimpleMailMessage.class));
        when(usuarioRepository.findByRol(RolUsuario.DIRECTOR_CARRERA)).thenReturn(List.of(dc));

        correoService.enviarCorreoTexto("tutor.inst@empresa.com", "Carta de Asignación - Prácticas Preprofesionales", "Cuerpo");

        verify(remitenteCorreo, times(3)).send(any(SimpleMailMessage.class));
        verify(notificacionService, times(1)).enviar(
                eq(dc),
                eq("Fallo de entrega de correo"),
                anyString(),
                eq(TipoNotificacion.ERROR),
                eq("/dashboard/practicas/estudiantes")
        );
    }
}
