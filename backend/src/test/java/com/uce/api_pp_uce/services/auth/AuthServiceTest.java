package com.uce.api_pp_uce.services.auth;

import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.RespuestaAuthDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.TokenRecuperacionContrasenia;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.excepciones.CredencialesInvalidasException;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import com.uce.api_pp_uce.repositories.TokenRecuperacionContraseniaRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;
import com.uce.api_pp_uce.security.UtilidadesJwt;
import com.uce.api_pp_uce.security.ValidadorContraseniaNist;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.IntentosLoginService;
import com.uce.api_pp_uce.services.auth.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TokenRecuperacionContraseniaRepository tokenRecuperacionContraseniaRepository;

    @Mock
    private PasswordEncoder codificadorContrasenia;

    @Mock
    private CorreoService correoService;

    @Mock
    private IntentosLoginService servicioIntentosLogin;

    @Mock
    private UsuarioMapeador usuarioMapeador;

    @Mock
    private ProcesoPracticaRepository procesoPracticaRepository;

    @Mock
    private AuthenticationManager gestorAutenticacion;

    @Mock
    private UtilidadesJwt utilidadesJwt;

    @Spy
    private ValidadorContraseniaNist validadorContraseniaNist = new ValidadorContraseniaNist();

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        validadorContraseniaNist.cargarListaNegra();
        ReflectionTestUtils.setField(authService, "urlFrontend", "http://localhost:3000");
    }

    @Test
    @DisplayName("Deberia activar cuenta exitosamente cuando el token es valido y la clave cumple NIST")
    void activarCuentaExitoso() {
        String tokenCrudo = "token-secreto-123";
        String claveFuerte = "Segura#2026!Abc";
        RestaurarContraseniaDto dto = new RestaurarContraseniaDto(tokenCrudo, claveFuerte);

        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setCorreo("estudiante@uce.edu.ec");
        usuario.setNombres("Carlos");
        usuario.setVersionToken(1L);

        TokenRecuperacionContrasenia tokenEntidad = new TokenRecuperacionContrasenia();
        tokenEntidad.setUsuario(usuario);
        tokenEntidad.setFechaExpiracion(LocalDateTime.now().plusHours(24));

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.of(tokenEntidad));
        when(codificadorContrasenia.encode(claveFuerte)).thenReturn("$2a$10$hashCodificado");

        assertDoesNotThrow(() -> authService.activarCuenta(dto));

        verify(usuarioRepository, times(1)).save(usuario);
        assertEquals(2L, usuario.getVersionToken());
        verify(tokenRecuperacionContraseniaRepository, times(1)).delete(tokenEntidad);
        verify(correoService, times(1)).enviarCorreoHtml(eq("estudiante@uce.edu.ec"), anyString(), eq("email/cuenta-activada"), any());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al activar cuenta si la contrasenia no cumple estandar NIST")
    void activarCuentaClaveDebil() {
        RestaurarContraseniaDto dto = new RestaurarContraseniaDto("token-123", "clave_debil");

        NegocioException excepcion = assertThrows(NegocioException.class, () -> authService.activarCuenta(dto));
        assertEquals("La contraseña debe contener al menos una letra mayúscula.", excepcion.getMessage());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el token de activacion esta expirado")
    void activarCuentaTokenExpirado() {
        String tokenCrudo = "token-expirado";
        String claveFuerte = "Segura#2026!Abc";
        RestaurarContraseniaDto dto = new RestaurarContraseniaDto(tokenCrudo, claveFuerte);

        Usuario usuario = new Usuario();
        usuario.setId(10L);

        TokenRecuperacionContrasenia tokenEntidad = new TokenRecuperacionContrasenia();
        tokenEntidad.setUsuario(usuario);
        tokenEntidad.setFechaExpiracion(LocalDateTime.now().minusHours(1));

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.of(tokenEntidad));

        assertThrows(NegocioException.class, () -> authService.activarCuenta(dto));
        verify(tokenRecuperacionContraseniaRepository, times(1)).delete(tokenEntidad);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el token no existe en el sistema")
    void activarCuentaTokenNoEncontrado() {
        RestaurarContraseniaDto dto = new RestaurarContraseniaDto("token-inexistente", "Segura#2026!Abc");

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> authService.activarCuenta(dto));
    }

    @Test
    @DisplayName("Deberia restaurar contrasenia exitosamente y enviar notificacion de seguridad")
    void restaurarContraseniaExitoso() {
        String tokenCrudo = "token-recuperacion";
        String claveFuerte = "Segura#2026!";
        RestaurarContraseniaDto dto = new RestaurarContraseniaDto(tokenCrudo, claveFuerte);

        Usuario usuario = new Usuario();
        usuario.setId(5L);
        usuario.setCorreo("docente@uce.edu.ec");
        usuario.setNombres("Ana");

        TokenRecuperacionContrasenia tokenEntidad = new TokenRecuperacionContrasenia();
        tokenEntidad.setUsuario(usuario);
        tokenEntidad.setFechaExpiracion(LocalDateTime.now().plusHours(1));

        when(tokenRecuperacionContraseniaRepository.findByToken(anyString())).thenReturn(Optional.of(tokenEntidad));
        when(codificadorContrasenia.encode(claveFuerte)).thenReturn("$2a$10$hashDocente");

        assertDoesNotThrow(() -> authService.restaurarContrasenia(dto));

        verify(usuarioRepository, times(1)).save(usuario);
        verify(tokenRecuperacionContraseniaRepository, times(1)).delete(tokenEntidad);
        verify(correoService, times(1)).enviarCorreoHtml(eq("docente@uce.edu.ec"), anyString(), eq("email/contrasenia-cambiada"), any());
    }

    @Test
    @DisplayName("Deberia generar y enviar token de activacion a usuario valido")
    void enviarTokenActivacionExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(20L);
        usuario.setCorreo("nuevo@uce.edu.ec");
        usuario.setNombres("Pedro");
        usuario.setApellidos("Perez");

        when(tokenRecuperacionContraseniaRepository.findByUsuarioId(20L)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.enviarTokenActivacion(usuario));

        verify(tokenRecuperacionContraseniaRepository, times(1)).save(any(TokenRecuperacionContrasenia.class));
        verify(correoService, times(1)).enviarCorreoHtml(eq("nuevo@uce.edu.ec"), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Deberia solicitar restaurar contrasenia exitosamente para usuario existente")
    void solicitarRestaurarContraseniaExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(30L);
        usuario.setCorreo("alumno@uce.edu.ec");
        usuario.setNombres("Mateo");

        when(usuarioRepository.findByCorreo("alumno@uce.edu.ec")).thenReturn(Optional.of(usuario));
        when(tokenRecuperacionContraseniaRepository.findByUsuarioId(30L)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.solicitarRestaurarContrasenia("alumno@uce.edu.ec"));

        verify(tokenRecuperacionContraseniaRepository, times(1)).save(any(TokenRecuperacionContrasenia.class));
        verify(correoService, times(1)).enviarCorreoHtml(eq("alumno@uce.edu.ec"), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Deberia omitir el reenvio silenciosamente si se solicita restauracion antes de los 5 minutos de cooldown")
    void solicitarRestaurarContraseniaBloqueadoPorCooldown() {
        Usuario usuario = new Usuario();
        usuario.setId(30L);
        usuario.setCorreo("alumno@uce.edu.ec");

        TokenRecuperacionContrasenia tokenExistente = new TokenRecuperacionContrasenia();
        tokenExistente.setUsuario(usuario);
        tokenExistente.setFechaCreacion(LocalDateTime.now().minusMinutes(2));
        tokenExistente.setFechaExpiracion(LocalDateTime.now().plusMinutes(58));

        when(usuarioRepository.findByCorreo("alumno@uce.edu.ec")).thenReturn(Optional.of(usuario));
        when(tokenRecuperacionContraseniaRepository.findByUsuarioId(30L)).thenReturn(Optional.of(tokenExistente));

        assertDoesNotThrow(() -> authService.solicitarRestaurarContrasenia("alumno@uce.edu.ec"));

        verify(tokenRecuperacionContraseniaRepository, times(0)).save(any());
        verify(correoService, times(0)).enviarCorreoHtml(anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Deberia no lanzar excepcion ni enviar correo si el usuario no existe para evitar enumeracion")
    void solicitarRestaurarContraseniaUsuarioNoExiste() {
        when(usuarioRepository.findByCorreo("noexiste@uce.edu.ec")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.solicitarRestaurarContrasenia("noexiste@uce.edu.ec"));

        verify(tokenRecuperacionContraseniaRepository, times(0)).save(any());
        verify(correoService, times(0)).enviarCorreoHtml(anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Deberia resolver horasRequeridas y horasAcumuladas desde ProcesoPractica al iniciar sesion un estudiante")
    void loginEstudianteConProcesoPractica() {
        LoginDto dto = new LoginDto("estudiante@uce.edu.ec", "Clave123!");

        Carrera carrera = new Carrera();
        carrera.setId(1);
        carrera.setHorasPractica(240);

        Usuario estudiante = new Usuario();
        estudiante.setId(50L);
        estudiante.setCorreo("estudiante@uce.edu.ec");
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        estudiante.setEstado(EstadoUsuario.ACTIVO);
        estudiante.setCarrera(carrera);

        ProcesoPractica proceso = new ProcesoPractica();
        proceso.setHorasRequeridas(240);
        proceso.setHorasAcumuladas(80);

        Authentication authMock = mock(Authentication.class);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);
        when(authMock.getPrincipal()).thenReturn(detalles);

        when(usuarioRepository.findByCorreo("estudiante@uce.edu.ec")).thenReturn(Optional.of(estudiante));
        when(gestorAutenticacion.authenticate(any())).thenReturn(authMock);
        when(utilidadesJwt.generarToken(detalles)).thenReturn("jwt-token");
        when(procesoPracticaRepository.findByEstudianteIdAndCarreraId(50L, 1)).thenReturn(Optional.of(proceso));

        UsuarioDto usuarioDtoMock = mock(UsuarioDto.class);
        when(usuarioMapeador.aDto(estudiante, 240, 80)).thenReturn(usuarioDtoMock);

        RespuestaAuthDto respuesta = authService.login(dto);

        assertNotNull(respuesta);
        verify(usuarioMapeador, times(1)).aDto(estudiante, 240, 80);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el correo no existe al iniciar sesion sin contar intento")
    void loginUsuarioNoExiste() {
        LoginDto dto = new LoginDto("noexiste@uce.edu.ec", "Clave123!");
        when(usuarioRepository.findByCorreo("noexiste@uce.edu.ec")).thenReturn(Optional.empty());

        CredencialesInvalidasException ex = assertThrows(CredencialesInvalidasException.class, () -> authService.login(dto));
        assertEquals("Correo o contraseña incorrectos.", ex.getMessage());
        verify(servicioIntentosLogin, never()).loginFallido(anyString());
    }
}
