package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.NotificacionService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CorreoServiceImpl implements CorreoService {

    private final JavaMailSender remitenteCorreo;
    private final TemplateEngine templateEngine;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    @Value("${spring.mail.username:noreply@uce.edu.ec}")
    private String correoRemitente;

    private String obtenerRemitenteValido() {
        if (correoRemitente == null || correoRemitente.trim().isEmpty()) {
            return "noreply@uce.edu.ec";
        }
        return correoRemitente.trim();
    }

    @Async
    @Override
    public void enviarCorreoConAdjunto(String destinatario, String asunto, String cuerpoTexto, byte[] archivoPdf, String nombreArchivo) {
        if (destinatario == null || destinatario.trim().isEmpty()) {
            log.warn("No se puede enviar el correo, el destinatario está vacío.");
            return;
        }

        try {
            MimeMessage mensaje = remitenteCorreo.createMimeMessage();
            MimeMessageHelper asistente = new MimeMessageHelper(mensaje, true, StandardCharsets.UTF_8.name());

            asistente.setFrom(obtenerRemitenteValido());
            asistente.setTo(destinatario);
            asistente.setSubject(asunto);
            asistente.setText(cuerpoTexto, false);

            if (archivoPdf != null && nombreArchivo != null) {
                ByteArrayResource recursoPdf = new ByteArrayResource(archivoPdf);
                asistente.addAttachment(nombreArchivo, recursoPdf);
            }

            ejecutarEnvioConReintentos(() -> remitenteCorreo.send(mensaje), destinatario, asunto);
        } catch (MessagingException e) {
            log.error("Error de mensajería al preparar el correo para {}: {}", destinatario, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error inesperado al preparar el correo para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    @Async
    @Override
    public void enviarCorreoTexto(String destinatario, String asunto, String cuerpoTexto) {
        if (destinatario == null || destinatario.trim().isEmpty()) {
            log.warn("No se puede enviar el correo, el destinatario está vacío.");
            return;
        }

        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(obtenerRemitenteValido());
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpoTexto);

            ejecutarEnvioConReintentos(() -> remitenteCorreo.send(mensaje), destinatario, asunto);
        } catch (Exception e) {
            log.error("Error al preparar el correo de texto para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    @Async
    @Override
    public void enviarCorreoHtml(String destinatario, String asunto, String rutaPlantilla, Map<String, Object> variables) {
        if (destinatario == null || destinatario.trim().isEmpty()) {
            log.warn("No se puede enviar el correo HTML, el destinatario está vacío.");
            return;
        }

        try {
            ContenidoCorreoRenderizado renderizado = renderizarPlantilla(rutaPlantilla, asunto, variables);

            MimeMessage mensaje = remitenteCorreo.createMimeMessage();
            MimeMessageHelper asistente = new MimeMessageHelper(mensaje, true, StandardCharsets.UTF_8.name());

            asistente.setFrom(obtenerRemitenteValido());
            asistente.setTo(destinatario);
            asistente.setSubject(renderizado.asunto());
            asistente.setText(renderizado.html(), true);

            ejecutarEnvioConReintentos(() -> remitenteCorreo.send(mensaje), destinatario, renderizado.asunto());
        } catch (MessagingException e) {
            log.error("Error de mensajería al preparar correo HTML para {}: {}", destinatario, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error inesperado al preparar correo HTML para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    @Async
    @Override
    public void enviarCorreoHtmlConAdjunto(String destinatario, String asunto, String rutaPlantilla, Map<String, Object> variables, byte[] archivoPdf, String nombreArchivo) {
        if (destinatario == null || destinatario.trim().isEmpty()) {
            log.warn("No se puede enviar el correo HTML con adjunto, el destinatario está vacío.");
            return;
        }

        try {
            ContenidoCorreoRenderizado renderizado = renderizarPlantilla(rutaPlantilla, asunto, variables);

            MimeMessage mensaje = remitenteCorreo.createMimeMessage();
            MimeMessageHelper asistente = new MimeMessageHelper(mensaje, true, StandardCharsets.UTF_8.name());

            asistente.setFrom(obtenerRemitenteValido());
            asistente.setTo(destinatario);
            asistente.setSubject(renderizado.asunto());
            asistente.setText(renderizado.html(), true);

            if (archivoPdf != null && nombreArchivo != null) {
                ByteArrayResource recursoPdf = new ByteArrayResource(archivoPdf);
                asistente.addAttachment(nombreArchivo, recursoPdf);
            }

            ejecutarEnvioConReintentos(() -> remitenteCorreo.send(mensaje), destinatario, renderizado.asunto());
        } catch (MessagingException e) {
            log.error("Error de mensajería al preparar correo HTML con adjunto para {}: {}", destinatario, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error inesperado al preparar correo HTML con adjunto para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    private void ejecutarEnvioConReintentos(Runnable accionEnvio, String destinatario, String asunto) {
        int intentosMaximos = 3;
        long esperaMs = 2000L;

        for (int intento = 1; intento <= intentosMaximos; intento++) {
            try {
                accionEnvio.run();
                log.info("Correo enviado exitosamente a: '{}' [Asunto: '{}'] en el intento {}", destinatario, asunto, intento);
                return;
            } catch (Exception e) {
                log.warn("Fallo en intento {} de {} al enviar correo a '{}' [Asunto: '{}']: {}",
                        intento, intentosMaximos, destinatario, asunto, e.getMessage());

                if (intento < intentosMaximos) {
                    try {
                        Thread.sleep(esperaMs);
                        esperaMs *= 2; // retroceso exponencial: 2s, luego 4s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Reintento de envío de correo interrumpido para {}", destinatario);
                        break;
                    }
                } else {
                    log.error("Se agotaron los {} intentos de envío de correo a '{}'. Notificando al Subdecano/Administradores.", intentosMaximos, destinatario);
                    notificarFalloAAdministradores(destinatario, asunto, e.getMessage());
                }
            }
        }
    }

    private void notificarFalloAAdministradores(String destinatario, String asunto, String motivoError) {
        try {
            String asuntoNormalizado = asunto != null ? asunto.toLowerCase() : "";
            boolean esCartaAsignacion = asuntoNormalizado.contains("carta") && asuntoNormalizado.contains("asignac");

            String titulo = "Fallo de entrega de correo";
            String motivo = motivoError != null ? motivoError : "Error de conexión con el servidor de correo";

            if (esCartaAsignacion) {
                // Notificar al Director de Carrera (DC) responsable de emitir la Carta de Asignación
                List<Usuario> directores = usuarioRepository.findByRol(RolUsuario.DIRECTOR_CARRERA);
                if (directores.isEmpty()) {
                    directores = usuarioRepository.findByRol(RolUsuario.SUBDECANO);
                }

                String mensaje = String.format("No se pudo entregar la Carta de Asignación al Tutor Institucional (%s) tras 3 reintentos. Motivo: %s",
                        destinatario, motivo);
                String accionUrl = "/dashboard/practicas/estudiantes";

                for (Usuario dc : directores) {
                    notificacionService.enviar(dc, titulo, mensaje, TipoNotificacion.ERROR, accionUrl);
                }
            } else {
                // Notificar al Subdecano (S)
                List<Usuario> subdecanos = usuarioRepository.findByRol(RolUsuario.SUBDECANO);
                String mensaje = String.format("No se pudo entregar el correo con asunto '%s' a la dirección '%s' tras 3 reintentos. Motivo: %s",
                        asunto, destinatario, motivo);
                String accionUrl = "/dashboard/usuarios";

                for (Usuario subdecano : subdecanos) {
                    notificacionService.enviar(subdecano, titulo, mensaje, TipoNotificacion.ERROR, accionUrl);
                }
            }
        } catch (Exception ex) {
            log.error("Error al registrar notificación de fallo de entrega de correo: {}", ex.getMessage());
        }
    }

    private ContenidoCorreoRenderizado renderizarPlantilla(String rutaPlantilla, String asunto, Map<String, Object> variables) {
        Context contexto = new Context();
        if (variables != null) {
            contexto.setVariables(variables);
        }
        String htmlFallback = templateEngine.process(rutaPlantilla, contexto);
        return new ContenidoCorreoRenderizado(asunto, htmlFallback);
    }

    private record ContenidoCorreoRenderizado(String asunto, String html) {}
}
