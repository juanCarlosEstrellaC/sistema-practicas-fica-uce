package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.OlvidoContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.entities.TokenRecuperacionContrasenia;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.repositories.TokenRecuperacionContraseniaRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;
import com.uce.api_pp_uce.services.IntentosLoginService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class ControladorAutenticacionTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private AuthenticationManager gestorAutenticacion;

    @MockitoBean
    private IntentosLoginService intentosLoginService;

    @MockitoBean
    private TokenRecuperacionContraseniaRepository tokenRecuperacionContraseniaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private PasswordEncoder codificadorContrasenia;

    @MockitoBean
    private JavaMailSender mailSender;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        MimeMessage mensajeMime = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mensajeMime);
    }

    @Test
    @DisplayName("Deberia rechazar login si la cuenta esta bloqueada por intentos fallidos")
    void testLoginBloqueado() throws Exception {
        LoginDto peticion = new LoginDto("test@uce.edu.ec", "123456");

        Mockito.when(usuarioRepository.findByCorreo(eq("test@uce.edu.ec"))).thenReturn(Optional.of(new Usuario()));
        Mockito.when(intentosLoginService.estaBloqueado(eq("test@uce.edu.ec"))).thenReturn(true);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Por favor, intente de nuevo en 15 minutos."));
    }

    @Test
    @DisplayName("Deberia rechazar login si el correo no esta registrado en el sistema")
    void testLoginUsuarioNoExiste() throws Exception {
        LoginDto peticion = new LoginDto("noexiste@uce.edu.ec", "clave123");

        Mockito.when(usuarioRepository.findByCorreo(eq("noexiste@uce.edu.ec"))).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos."));

        Mockito.verify(intentosLoginService, Mockito.never()).loginFallido("noexiste@uce.edu.ec");
    }

    @Test
    @DisplayName("Deberia rechazar login con credenciales invalidas")
    void testLoginCredencialesInvalidas() throws Exception {
        LoginDto peticion = new LoginDto("test@uce.edu.ec", "mala_clave");

        Mockito.when(usuarioRepository.findByCorreo(eq("test@uce.edu.ec"))).thenReturn(Optional.of(new Usuario()));
        Mockito.when(intentosLoginService.estaBloqueado(eq("test@uce.edu.ec"))).thenReturn(false);
        Mockito.when(gestorAutenticacion.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));
        Mockito.when(intentosLoginService.getIntentosRestantes(eq("test@uce.edu.ec"))).thenReturn(3);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos. Le quedan 3 intentos antes de bloquear 15 minutos."));

        Mockito.verify(intentosLoginService).loginFallido("test@uce.edu.ec");
    }

    @Test
    @DisplayName("Deberia activar cuenta exitosamente mediante endpoint publico")
    void testActivarCuentaExitoso() throws Exception {
        RestaurarContraseniaDto peticion = new RestaurarContraseniaDto("token-valido-123", "Segura#2026!Abc");

        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setCorreo("test@uce.edu.ec");
        usuario.setNombres("Usuario");

        TokenRecuperacionContrasenia tokenEntidad = new TokenRecuperacionContrasenia();
        tokenEntidad.setUsuario(usuario);
        tokenEntidad.setFechaExpiracion(LocalDateTime.now().plusHours(24));

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.of(tokenEntidad));
        when(codificadorContrasenia.encode("Segura#2026!Abc")).thenReturn("$2a$10$hashPrueba");

        mockMvc.perform(post("/auth/activar-cuenta")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Cuenta activada exitosamente"));
    }

    @Test
    @DisplayName("Deberia retornar error al activar cuenta con token invalido o no encontrado")
    void testActivarCuentaTokenInvalido() throws Exception {
        RestaurarContraseniaDto peticion = new RestaurarContraseniaDto("token-inexistente", "Segura#2026!Abc");

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/activar-cuenta")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Token de activación inválido o no encontrado"));
    }

    @Test
    @DisplayName("Deberia restaurar contrasenia exitosamente")
    void testRestaurarContraseniaExitoso() throws Exception {
        RestaurarContraseniaDto peticion = new RestaurarContraseniaDto("token-recuperacion", "NuevaClave@2026!");

        Usuario usuario = new Usuario();
        usuario.setId(2L);
        usuario.setCorreo("docente@uce.edu.ec");
        usuario.setNombres("Docente");

        TokenRecuperacionContrasenia tokenEntidad = new TokenRecuperacionContrasenia();
        tokenEntidad.setUsuario(usuario);
        tokenEntidad.setFechaExpiracion(LocalDateTime.now().plusHours(1));

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.of(tokenEntidad));
        when(codificadorContrasenia.encode("NuevaClave@2026!")).thenReturn("$2a$10$hashDocente");

        mockMvc.perform(post("/auth/restaurar-contrasenia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Contraseña actualizada exitosamente"));
    }

    @Test
    @DisplayName("Deberia solicitar envio de correo de olvido de contrasenia")
    void testOlvidoContraseniaExitoso() throws Exception {
        OlvidoContraseniaDto peticion = new OlvidoContraseniaDto("usuario@uce.edu.ec");

        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setCorreo("usuario@uce.edu.ec");
        usuario.setNombres("Usuario");

        when(usuarioRepository.findByCorreo("usuario@uce.edu.ec")).thenReturn(Optional.of(usuario));
        when(tokenRecuperacionContraseniaRepository.findByUsuarioId(3L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/olvido-contrasenia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Si el correo coincide con una cuenta activa, recibirás un mensaje con las instrucciones."));
    }

    @Test
    @DisplayName("Deberia permitir login de usuario Z aunque usuarios X e Y fallen 5 veces desde la misma IP")
    void testLoginUsuarioZNoBloqueadoPorFallosDeXeY() throws Exception {
        String ipCompartida = "198.51.100.50";
        Usuario usuarioZ = new Usuario();
        usuarioZ.setId(99L);
        usuarioZ.setCorreo("usuarioz@uce.edu.ec");
        usuarioZ.setNombres("Usuario Z");
        usuarioZ.setRol(RolUsuario.DIRECTOR_CARRERA);
        usuarioZ.setEstado(EstadoUsuario.ACTIVO);
        usuarioZ.setVersionToken(1L);

        DetallesUsuarioImpl detallesZ = new DetallesUsuarioImpl(usuarioZ);
        Authentication autenticacionZ = new UsernamePasswordAuthenticationToken(detallesZ, null, detallesZ.getAuthorities());

        when(usuarioRepository.findByCorreo("usuariox@uce.edu.ec")).thenReturn(Optional.of(new Usuario()));
        when(usuarioRepository.findByCorreo("usuarioy@uce.edu.ec")).thenReturn(Optional.of(new Usuario()));
        when(usuarioRepository.findByCorreo("usuarioz@uce.edu.ec")).thenReturn(Optional.of(usuarioZ));
        when(intentosLoginService.estaBloqueado(anyString())).thenReturn(false);
        when(intentosLoginService.getIntentosRestantes(anyString())).thenReturn(2);
        when(gestorAutenticacion.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenThrow(new BadCredentialsException("Bad credentials"))
                .thenReturn(autenticacionZ);

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                    .header("CF-Connecting-IP", ipCompartida)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new LoginDto("usuariox@uce.edu.ec", "mala"))))
                    .andExpect(status().isUnauthorized());
        }

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                    .header("CF-Connecting-IP", ipCompartida)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new LoginDto("usuarioy@uce.edu.ec", "mala"))))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/auth/login")
                .header("CF-Connecting-IP", ipCompartida)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginDto("usuarioz@uce.edu.ec", "claveCorrecta"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));
    }

    @Test
    @DisplayName("Deberia responder 429 en login al superar 30 intentos desde la misma IP")
    void testLoginRateLimitPorIp() throws Exception {
        String ipAtacante = "198.51.100.60";
        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());

        for (int i = 0; i < 30; i++) {
            mockMvc.perform(post("/auth/login")
                    .header("CF-Connecting-IP", ipAtacante)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new LoginDto("usuario" + i + "@uce.edu.ec", "clave"))))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/auth/login")
                .header("CF-Connecting-IP", ipAtacante)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginDto("usuario31@uce.edu.ec", "clave"))))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"))
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("Deberia responder 429 en olvido-contrasenia por correo y por IP")
    void testOlvidoContraseniaRateLimitPorCorreoEIp() throws Exception {
        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", "198.51.100.70")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("saturado@uce.edu.ec"))))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/auth/olvido-contrasenia")
                .header("CF-Connecting-IP", "198.51.100.70")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("saturado@uce.edu.ec"))))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "300"))
                .andExpect(jsonPath("$.exito").value(false));

        String ipAtacante = "198.51.100.80";
        for (int i = 0; i < 15; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", ipAtacante)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("correo" + i + "@uce.edu.ec"))))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/auth/olvido-contrasenia")
                .header("CF-Connecting-IP", ipAtacante)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("correo16@uce.edu.ec"))))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"))
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("Vector adversarial DoS Remoto: IP bloqueada en olvido-contrasenia no agota fichas de correo ajeno")
    void testOlvidoContraseniaIpBloqueadaNoBloqueaVictimaEnOtraIp() throws Exception {
        String ipAtacante = "198.51.100.110";
        String ipVictima = "203.0.113.50";
        String correoVictima = "victima.recuperacion@uce.edu.ec";
        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());

        for (int i = 0; i < 15; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", ipAtacante)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("sondeo" + i + "@uce.edu.ec"))))
                    .andExpect(status().isOk());
        }

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", ipAtacante)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto(correoVictima))))
                    .andExpect(status().isTooManyRequests())
                    .andExpect(header().string("Retry-After", "60"));
        }

        mockMvc.perform(post("/auth/olvido-contrasenia")
                .header("CF-Connecting-IP", ipVictima)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto(correoVictima))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));
    }

    @Test
    @DisplayName("Vector adversarial Cross-User Lab DoS: rechazos por correo no consumen cuota de IP compartida")
    void testOlvidoContraseniaUsuarioImpacienteNoBloqueaLaboratorio() throws Exception {
        String ipLaboratorio = "198.51.100.90";
        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());

        // Usuario 1 hace 10 solicitudes repetidas para su mismo correo: 1..3 pasan (200), 4..10 rechazan por correo (429)
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", ipLaboratorio)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("impaciente@uce.edu.ec"))))
                    .andExpect(status().isOk());
        }

        for (int i = 0; i < 7; i++) {
            mockMvc.perform(post("/auth/olvido-contrasenia")
                    .header("CF-Connecting-IP", ipLaboratorio)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("impaciente@uce.edu.ec"))))
                    .andExpect(status().isTooManyRequests());
        }

        // Usuario 2 en el mismo laboratorio solicita para su correo y debe pasar (quedan tokens de IP)
        mockMvc.perform(post("/auth/olvido-contrasenia")
                .header("CF-Connecting-IP", ipLaboratorio)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OlvidoContraseniaDto("companiero@uce.edu.ec"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));
    }

    @Test
    @DisplayName("Vector adversarial Cabecera Malformada: X-Forwarded-For con segmentos vacios resuelve IP real")
    void testCabeceraXForwardedForMalformadaResuelveIpReal() throws Exception {
        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());

        for (int i = 0; i < 30; i++) {
            mockMvc.perform(post("/auth/login")
                    .header("X-Forwarded-For", " , , 198.51.100.95 , 172.70.0.1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new LoginDto("prueba" + i + "@uce.edu.ec", "clave"))))
                    .andExpect(status().isUnauthorized());
        }

        // El intento 31 con la IP limpia coincide con la misma cubeta y debe bloquear con 429
        mockMvc.perform(post("/auth/login")
                .header("X-Forwarded-For", "198.51.100.95")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginDto("prueba31@uce.edu.ec", "clave"))))
                .andExpect(status().isTooManyRequests());
    }
}
