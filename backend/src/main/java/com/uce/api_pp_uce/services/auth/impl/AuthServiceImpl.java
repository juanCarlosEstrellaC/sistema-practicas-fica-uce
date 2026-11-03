package com.uce.api_pp_uce.services.auth.impl;

import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.RespuestaAuthDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.entities.TokenRecuperacionContrasenia;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.excepciones.CredencialesInvalidasException;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import com.uce.api_pp_uce.repositories.TokenRecuperacionContraseniaRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;
import com.uce.api_pp_uce.security.UtilidadesJwt;
import com.uce.api_pp_uce.security.ValidadorContraseniaNist;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.IntentosLoginService;
import com.uce.api_pp_uce.services.auth.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String urlFrontend;

    private final AuthenticationManager gestorAutenticacion;
    private final UtilidadesJwt utilidadesJwt;
    private final PasswordEncoder codificadorContrasenia;
    private final IntentosLoginService servicioIntentosLogin;
    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionContraseniaRepository tokenRecuperacionContraseniaRepository;
    private final CorreoService correoService;
    private final UsuarioMapeador usuarioMapeador;
    private final ValidadorContraseniaNist validadorContraseniaNist;

    @Override
    public RespuestaAuthDto login(LoginDto peticion) {
        String correoNormalizado = peticion.correo() != null ? peticion.correo().trim().toLowerCase() : "";

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correoNormalizado);
        if (usuarioOpt.isEmpty()) {
            throw new CredencialesInvalidasException("El correo ingresado no se encuentra registrado en el sistema.");
        }

        if (usuarioOpt.get().getEstado() == EstadoUsuario.INACTIVO
                && usuarioOpt.get().getRol() != RolUsuario.ESTUDIANTE) {
            throw new CredencialesInvalidasException("Su cuenta se encuentra inactiva. Comuníquese con el administrador del sistema.");
        }

        if (servicioIntentosLogin.estaBloqueado(correoNormalizado)) {
            throw new CredencialesInvalidasException("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Por favor, intente de nuevo en 15 minutos.");
        }

        Authentication autenticacion;
        try {
            autenticacion = gestorAutenticacion.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            correoNormalizado,
                            peticion.clave()
                    )
            );
        } catch (BadCredentialsException ex) {
            servicioIntentosLogin.loginFallido(correoNormalizado);
            int intentosRestantes = servicioIntentosLogin.getIntentosRestantes(correoNormalizado);
            if (intentosRestantes == 0) {
                throw new CredencialesInvalidasException("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Por favor, intente de nuevo en 15 minutos.");
            }
            throw new CredencialesInvalidasException("Correo o contraseña incorrectos. Le quedan " + intentosRestantes + " intentos antes de bloquear 15 minutos.");
        }

        // Login exitoso: se reinician los intentos fallidos
        servicioIntentosLogin.loginExitoso(correoNormalizado);

        DetallesUsuarioImpl detallesUsuario = (DetallesUsuarioImpl) autenticacion.getPrincipal();
        String tokenJwt = utilidadesJwt.generarToken(detallesUsuario);

        Usuario usuario = detallesUsuario.getUsuario();
        UsuarioDto usuarioDto = usuarioMapeador.aDto(usuario);

        return new RespuestaAuthDto(tokenJwt, usuarioDto);
    }

    @Override
    @Transactional
    public void solicitarRestaurarContrasenia(String correo) {
        if (correo == null || correo.trim().isEmpty()) {
            return;
        }

        String correoNormalizado = correo.trim().toLowerCase();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correoNormalizado);
        if (usuarioOpt.isEmpty()) {
            log.info("Solicitud de restablecimiento para correo no registrado: {}", correoNormalizado);
            return;
        }

        Usuario u = usuarioOpt.get();
        if (u.isBorrado() || (u.getEstado() != EstadoUsuario.ACTIVO && u.getRol() != RolUsuario.ESTUDIANTE)) {
            log.warn("Solicitud de restablecimiento para usuario inactivo o borrado: {}", correoNormalizado);
            return;
        }

        TokenRecuperacionContrasenia token;
        Optional<TokenRecuperacionContrasenia> tokenOpt = tokenRecuperacionContraseniaRepository.findByUsuarioId(u.getId());
        if (tokenOpt.isPresent()) {
            token = tokenOpt.get();
            if (!token.estaExpirado() && token.getFechaCreacion() != null) {
                long minutosTranscurridos = ChronoUnit.MINUTES.between(token.getFechaCreacion(), LocalDateTime.now());
                if (minutosTranscurridos >= 0 && minutosTranscurridos < 5) {
                    throw new NegocioException("Por favor espere 5 minutos antes de solicitar otro correo.");
                }
            }
        } else {
            token = new TokenRecuperacionContrasenia();
            token.setUsuario(u);
        }

        String tokenCrudo = UUID.randomUUID().toString();
        String tokenCodificado = hashToken(tokenCrudo);

        token.setToken(tokenCodificado);
        token.setFechaCreacion(LocalDateTime.now());
        token.setFechaExpiracion(LocalDateTime.now().plusHours(1));
        tokenRecuperacionContraseniaRepository.save(token);

        String urlReset = urlFrontend + "/restaurar-contrasenia?token=" + tokenCrudo;

        Map<String, Object> variables = Map.of(
                "nombre", u.getNombres(),
                "urlReset", urlReset,
                "horasExpiracion", 1
        );
        correoService.enviarCorreoHtml(correoNormalizado, "Recuperación de Contraseña - FICA UCE", "email/restaurar-contrasenia", variables);
    }

    @Override
    @Transactional
    public void restaurarContrasenia(RestaurarContraseniaDto dto) {
        validadorContraseniaNist.validar(dto.nuevaContrasenia());

        String tokenLimpio = dto.token() != null ? dto.token().trim() : "";
        String tokenCodificado = hashToken(tokenLimpio);
        TokenRecuperacionContrasenia token = tokenRecuperacionContraseniaRepository.findByToken(tokenCodificado)
                .orElseThrow(() -> new RecursoNoEncontradoException("Token inválido o no encontrado"));

        if (token.estaExpirado()) {
            tokenRecuperacionContraseniaRepository.delete(token);
            throw new NegocioException("El token ha expirado");
        }

        Usuario u = token.getUsuario();
        validadorContraseniaNist.validar(dto.nuevaContrasenia(), u);

        u.setClaveHash(codificadorContrasenia.encode(dto.nuevaContrasenia()));
        u.setVersionToken(u.getVersionToken() != null ? u.getVersionToken() + 1L : 1L);
        usuarioRepository.save(u);

        // Desbloquear intentos fallidos si la cuenta estuviera temporalmente bloqueada
        servicioIntentosLogin.loginExitoso(u.getCorreo());

        tokenRecuperacionContraseniaRepository.delete(token);

        Map<String, Object> variables = Map.of(
                "nombre", u.getNombres()
        );

        correoService.enviarCorreoHtml(u.getCorreo(), "Aviso de Seguridad - Contraseña Cambiada - FICA UCE", "email/contrasenia-cambiada", variables);
    }

    @Override
    @Transactional
    public void enviarTokenActivacion(Usuario usuario) {
        if (usuario == null || usuario.getCorreo() == null) {
            log.warn("No se puede enviar token de activacion: usuario o correo nulo");
            return;
        }

        TokenRecuperacionContrasenia token = tokenRecuperacionContraseniaRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    TokenRecuperacionContrasenia nuevoToken = new TokenRecuperacionContrasenia();
                    nuevoToken.setUsuario(usuario);
                    return nuevoToken;
                });

        String tokenCrudo = UUID.randomUUID().toString();
        String tokenCodificado = hashToken(tokenCrudo);

        token.setToken(tokenCodificado);
        token.setFechaCreacion(LocalDateTime.now());
        token.setFechaExpiracion(LocalDateTime.now().plusHours(48)); // 48 horas segun NIST SP 800-63B
        tokenRecuperacionContraseniaRepository.save(token);

        String urlActivacion = urlFrontend + "/activar-cuenta?token=" + tokenCrudo;

        String nombreCompleto = (usuario.getNombres() + (usuario.getApellidos() != null ? " " + usuario.getApellidos() : "")).trim();
        Map<String, Object> variables = Map.of(
                "nombreCompleto", nombreCompleto,
                "urlActivacion", urlActivacion,
                "horasExpiracion", 48
        );

        correoService.enviarCorreoHtml(usuario.getCorreo(), "Bienvenido al Sistema de Gestión de Prácticas y Vinculación - FICA UCE", "email/activacion-cuenta", variables);
    }

    @Override
    @Transactional
    public void activarCuenta(RestaurarContraseniaDto dto) {
        validadorContraseniaNist.validar(dto.nuevaContrasenia());

        String tokenLimpio = dto.token() != null ? dto.token().trim() : "";
        String tokenCodificado = hashToken(tokenLimpio);
        TokenRecuperacionContrasenia token = tokenRecuperacionContraseniaRepository.findByToken(tokenCodificado)
                .orElseThrow(() -> new RecursoNoEncontradoException("Token de activación inválido o no encontrado"));

        if (token.estaExpirado()) {
            tokenRecuperacionContraseniaRepository.delete(token);
            throw new NegocioException("El enlace de activación ha expirado. Por favor, solicita uno nuevo.");
        }

        Usuario u = token.getUsuario();
        validadorContraseniaNist.validar(dto.nuevaContrasenia(), u);

        u.setClaveHash(codificadorContrasenia.encode(dto.nuevaContrasenia()));
        u.setVersionToken(u.getVersionToken() != null ? u.getVersionToken() + 1L : 1L);
        usuarioRepository.save(u);

        // Desbloquear intentos fallidos si la cuenta estuviera bloqueada
        servicioIntentosLogin.loginExitoso(u.getCorreo());

        tokenRecuperacionContraseniaRepository.delete(token);

        Map<String, Object> variables = Map.of(
                "nombre", u.getNombres(),
                "urlLogin", urlFrontend + "/"
        );

        correoService.enviarCorreoHtml(u.getCorreo(), "Cuenta Activada Exitosamente - FICA UCE", "email/cuenta-activada", variables);
    }

    private String hashToken(String token) {
        try {
            MessageDigest resumen = MessageDigest.getInstance("SHA-256");
            byte[] hashCodificado = resumen.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder cadenaHexadecimal = new StringBuilder(2 * hashCodificado.length);
            for (byte byteActual : hashCodificado) {
                String hexadecimal = Integer.toHexString(0xff & byteActual);
                if (hexadecimal.length() == 1) {
                    cadenaHexadecimal.append('0');
                }
                cadenaHexadecimal.append(hexadecimal);
            }
            return cadenaHexadecimal.toString();
        } catch (NoSuchAlgorithmException excepcion) {
            throw new RuntimeException("Error al generar hash del token", excepcion);
        }
    }
}
