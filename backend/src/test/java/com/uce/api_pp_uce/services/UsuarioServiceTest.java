package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.ActualizarPerfilDto;
import com.uce.api_pp_uce.dtos.auth.CambiarContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.excepciones.CredencialesInvalidasException;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.security.ValidadorContraseniaNist;
import com.uce.api_pp_uce.services.auth.AuthService;
import com.uce.api_pp_uce.services.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private PasswordEncoder codificadorContrasenia;

    @Mock
    private AuthService authService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Spy
    private UsuarioMapeador usuarioMapeador = Mappers.getMapper(UsuarioMapeador.class);

    @Spy
    private ValidadorContraseniaNist validadorContraseniaNist = new ValidadorContraseniaNist();

    @Mock
    private CorreoService correoService;

    @Mock
    private ArchivoService archivoService;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    @BeforeEach
    void setUp() {
        validadorContraseniaNist.cargarListaNegra();
    }

    @Test
    @DisplayName("Deberia iniciar sesion exitosamente con credenciales correctas")
    void loginExitoso() {
        // Arrange (Preparar datos)
        String correo = "test@uce.edu.ec";
        String clave = "password123";
        String claveHash = "$2a$10$hashedPasswordPlaceholder";

        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setCorreo(correo);
        usuario.setClaveHash(claveHash);
        usuario.setNombres("Usuario");
        usuario.setApellidos("Prueba");
        usuario.setRol(RolUsuario.ESTUDIANTE);

        LoginDto request = new LoginDto(correo, clave);

        // Mocking
        when(usuarioRepository.findByCorreo(correo)).thenReturn(Optional.of(usuario));
        when(codificadorContrasenia.matches(clave, claveHash)).thenReturn(true);

        // Act (Ejecutar)
        UsuarioDto resultado = usuarioService.login(request);

        // Assert (Verificar)
        assertNotNull(resultado);
        assertEquals(correo, resultado.correo());
        verify(usuarioRepository, times(1)).findByCorreo(correo);
        verify(codificadorContrasenia, times(1)).matches(clave, claveHash);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si la clave es incorrecta")
    void loginClaveIncorrecta() {
        // Arrange
        String correo = "test@uce.edu.ec";
        String claveIncorrecta = "wrongpass";
        String claveHash = "$2a$10$hashedPasswordPlaceholder";

        Usuario usuario = new Usuario();
        usuario.setCorreo(correo);
        usuario.setClaveHash(claveHash);

        LoginDto request = new LoginDto(correo, claveIncorrecta);

        when(usuarioRepository.findByCorreo(correo)).thenReturn(Optional.of(usuario));
        when(codificadorContrasenia.matches(claveIncorrecta, claveHash)).thenReturn(false);

        // Act & Assert
        assertThrows(CredencialesInvalidasException.class, () -> usuarioService.login(request));
        verify(codificadorContrasenia, times(1)).matches(claveIncorrecta, claveHash);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el usuario no existe")
    void loginUsuarioNoEncontrado() {
        // Arrange
        String correo = "noexiste@uce.edu.ec";
        LoginDto request = new LoginDto(correo, "1234");

        when(usuarioRepository.findByCorreo(correo)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(CredencialesInvalidasException.class, () -> usuarioService.login(request));
    }

    @Test
    @DisplayName("Deberia reenviar token de activacion a usuario existente")
    void reenviarTokenActivacionExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(99L);
        usuario.setCorreo("docente@uce.edu.ec");
        usuario.setRol(RolUsuario.ESTUDIANTE);

        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(usuario));

        usuarioService.reenviarTokenActivacion(99L);

        verify(usuarioRepository, times(1)).findById(99L);
        verify(authService, times(1)).enviarTokenActivacion(usuario);
    }

    @Test
    @DisplayName("Deberia permitir reenviar activacion a un Subdecano")
    void reenviarTokenActivacionSubdecanoExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(99L);
        usuario.setCorreo("subdecano@uce.edu.ec");
        usuario.setRol(RolUsuario.SUBDECANO);

        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(usuario));

        usuarioService.reenviarTokenActivacion(99L);

        verify(authService, times(1)).enviarTokenActivacion(usuario);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al reenviar activacion si el usuario no existe")
    void reenviarTokenActivacionUsuarioNoEncontrado() {
        when(usuarioRepository.findById(888L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> usuarioService.reenviarTokenActivacion(888L));
        verify(usuarioRepository, times(1)).findById(888L);
    }

    @Test
    @DisplayName("Deberia cambiar contrasenia exitosamente cuando cumple NIST")
    void cambiarContraseniaExitoso() {
        CambiarContraseniaDto dto = new CambiarContraseniaDto("ClaveVieja123!", "Segura#2026!Abc");
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setCorreo("user@uce.edu.ec");
        usuario.setNombres("Usuario");
        usuario.setClaveHash("$2a$10$hashViejo");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(codificadorContrasenia.matches("ClaveVieja123!", "$2a$10$hashViejo")).thenReturn(true);
        when(codificadorContrasenia.encode("Segura#2026!Abc")).thenReturn("$2a$10$hashNuevo");

        assertDoesNotThrow(() -> usuarioService.cambiarContrasenia(10L, dto));

        verify(usuarioRepository, times(1)).save(usuario);
        verify(correoService, times(1)).enviarCorreoHtml(eq("user@uce.edu.ec"), anyString(), eq("email/contrasenia-cambiada"), any());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al cambiar contrasenia si es debil segun NIST")
    void cambiarContraseniaDebilLanzaExcepcion() {
        CambiarContraseniaDto dto = new CambiarContraseniaDto("ClaveVieja123!", "debil");

        NegocioException ex = assertThrows(NegocioException.class, () -> usuarioService.cambiarContrasenia(10L, dto));
        assertEquals("La contraseña debe tener al menos 8 caracteres.", ex.getMessage());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al intentar eliminar el propio usuario autenticado")
    void eliminarPropioUsuarioLanzaExcepcion() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuario);

        NegocioException excepcion = assertThrows(NegocioException.class, () -> usuarioService.eliminar(10L));
        assertEquals("No es posible eliminar su propia cuenta de usuario en sesion.", excepcion.getMessage());
        verify(usuarioRepository, times(0)).delete(usuario);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al intentar eliminar el unico Subdecano activo")
    void eliminarUnicoSubdecanoActivoLanzaExcepcion() {
        Usuario subdecano = new Usuario();
        subdecano.setId(10L);
        subdecano.setRol(RolUsuario.SUBDECANO);
        subdecano.setEstado(EstadoUsuario.ACTIVO);

        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(20L);

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(subdecano));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(otroUsuario);
        when(usuarioRepository.countByRolAndEstado(RolUsuario.SUBDECANO, EstadoUsuario.ACTIVO)).thenReturn(1L);

        NegocioException excepcion = assertThrows(NegocioException.class, () -> usuarioService.eliminar(10L));
        assertEquals("No se puede eliminar al unico Subdecano activo del sistema. Debe existir al menos un Subdecano.", excepcion.getMessage());
        verify(usuarioRepository, times(0)).delete(subdecano);
    }

    @Test
    @DisplayName("Deberia eliminar un usuario cuando no es el propio ni el unico Subdecano activo")
    void eliminarUsuarioValidoExitoso() {
        Usuario estudiante = new Usuario();
        estudiante.setId(30L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        estudiante.setEstado(EstadoUsuario.ACTIVO);

        Usuario subdecanoLogueado = new Usuario();
        subdecanoLogueado.setId(10L);

        when(usuarioRepository.findById(30L)).thenReturn(Optional.of(estudiante));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecanoLogueado);

        usuarioService.eliminar(30L);

        verify(usuarioRepository, times(1)).delete(estudiante);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al intentar cambiar el propio rol en sesion")
    void actualizarPropioRolLanzaExcepcion() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setRol(RolUsuario.SUBDECANO);
        usuario.setEstado(EstadoUsuario.ACTIVO);

        UsuarioDto dtoCambioRol = new UsuarioDto(
                10L, "correo@uce.edu.ec", "Nombre", "Apellido", "1711111111",
                TipoIdentificacionUsuario.CEDULA, RolUsuario.TUTOR_ACADEMICO, null, null, null,
                EstadoUsuario.ACTIVO, null, null
        );

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuario);

        NegocioException excepcion = assertThrows(NegocioException.class, () -> usuarioService.actualizar(10L, dtoCambioRol));
        assertEquals("No es posible cambiar su propio rol de usuario en sesion.", excepcion.getMessage());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al intentar desactivar la propia cuenta en sesion")
    void actualizarPropiaCuentaInactivarLanzaExcepcion() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setRol(RolUsuario.SUBDECANO);
        usuario.setEstado(EstadoUsuario.ACTIVO);

        UsuarioDto dtoInactivar = new UsuarioDto(
                10L, "correo@uce.edu.ec", "Nombre", "Apellido", "1711111111",
                TipoIdentificacionUsuario.CEDULA, RolUsuario.SUBDECANO, null, null, null,
                EstadoUsuario.INACTIVO, null, null
        );

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuario);

        NegocioException excepcion = assertThrows(NegocioException.class, () -> usuarioService.actualizar(10L, dtoInactivar));
        assertEquals("No es posible desactivar su propia cuenta en sesion.", excepcion.getMessage());
    }

    @Test
    @DisplayName("Deberia actualizar avatar y eliminar el anterior si existia")
    void actualizarAvatarEliminaAnterior() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUrlAvatar("/archivos_subidos/avatars/1_antiguo.png");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        usuarioService.actualizarAvatar(1L, "/archivos_subidos/avatars/1_nuevo.png");

        assertEquals("/archivos_subidos/avatars/1_nuevo.png", usuario.getUrlAvatar());
        verify(usuarioRepository).save(usuario);
        verify(archivoService).eliminarArchivo("/archivos_subidos/avatars/1_antiguo.png");
    }

    @Test
    @DisplayName("Deberia actualizar avatar sin llamar a eliminar si no habia avatar previo")
    void actualizarAvatarSinPrevioNoLlamaEliminar() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUrlAvatar(null);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        usuarioService.actualizarAvatar(1L, "/archivos_subidos/avatars/1_nuevo.png");

        assertEquals("/archivos_subidos/avatars/1_nuevo.png", usuario.getUrlAvatar());
        verify(usuarioRepository).save(usuario);
        verify(archivoService, never()).eliminarArchivo(anyString());
    }

    @Test
    @DisplayName("Deberia actualizar telefono de perfil exitosamente para el propio usuario")
    void actualizarPerfilExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setCorreo("test@uce.edu.ec");
        usuario.setNombres("Juan");
        usuario.setApellidos("Perez");
        usuario.setIdentificacion("1712345678");
        usuario.setRol(RolUsuario.ESTUDIANTE);
        usuario.setTelefono("0990000000");

        ActualizarPerfilDto dto = new ActualizarPerfilDto("0991234567");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuario);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDto resultado = usuarioService.actualizarPerfil(10L, dto);

        assertNotNull(resultado);
        assertEquals("0991234567", usuario.getTelefono());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si usuario no existe al actualizar perfil")
    void actualizarPerfilUsuarioNoExisteLanzaExcepcion() {
        ActualizarPerfilDto dto = new ActualizarPerfilDto("0991234567");
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> usuarioService.actualizarPerfil(999L, dto));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si usuario sin rol subdecano intenta modificar otro perfil")
    void actualizarPerfilSinPermisosLanzaExcepcion() {
        Usuario usuarioObjetivo = new Usuario();
        usuarioObjetivo.setId(10L);
        usuarioObjetivo.setRol(RolUsuario.ESTUDIANTE);

        Usuario usuarioSesion = new Usuario();
        usuarioSesion.setId(20L);
        usuarioSesion.setRol(RolUsuario.ESTUDIANTE);

        ActualizarPerfilDto dto = new ActualizarPerfilDto("0991234567");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuarioObjetivo));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioSesion);

        NegocioException ex = assertThrows(NegocioException.class, () -> usuarioService.actualizarPerfil(10L, dto));
        assertEquals("No tiene permisos para modificar el perfil de otro usuario.", ex.getMessage());
    }

    @Test
    @DisplayName("Deberia permitir actualizar perfil de otro usuario si quien edita es Subdecano")
    void actualizarPerfilPorSubdecanoExitoso() {
        Usuario usuarioObjetivo = new Usuario();
        usuarioObjetivo.setId(10L);
        usuarioObjetivo.setCorreo("estudiante@uce.edu.ec");
        usuarioObjetivo.setNombres("Estudiante");
        usuarioObjetivo.setApellidos("Prueba");
        usuarioObjetivo.setRol(RolUsuario.ESTUDIANTE);

        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        ActualizarPerfilDto dto = new ActualizarPerfilDto("0987654321");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuarioObjetivo));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecano);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDto resultado = usuarioService.actualizarPerfil(10L, dto);

        assertNotNull(resultado);
        assertEquals("0987654321", usuarioObjetivo.getTelefono());
        verify(usuarioRepository).save(usuarioObjetivo);
    }

    @Test
    @DisplayName("Deberia transferir el Subdecanato atomicamente degradando al saliente a Tutor Academico e incrementando versionToken")
    void transferirSubdecanatoExitoso() {
        Usuario subdecanoActual = new Usuario();
        subdecanoActual.setId(1L);
        subdecanoActual.setRol(RolUsuario.SUBDECANO);
        subdecanoActual.setEstado(EstadoUsuario.ACTIVO);
        subdecanoActual.setVersionToken(1L);

        Usuario nuevoSubdecano = new Usuario();
        nuevoSubdecano.setId(2L);
        nuevoSubdecano.setNombres("Nuevo");
        nuevoSubdecano.setApellidos("Subdecano");
        nuevoSubdecano.setCorreo("nuevo.sub@uce.edu.ec");
        nuevoSubdecano.setRol(RolUsuario.TUTOR_ACADEMICO);
        nuevoSubdecano.setEstado(EstadoUsuario.ACTIVO);
        nuevoSubdecano.setVersionToken(3L);

        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(nuevoSubdecano));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(subdecanoActual));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecanoActual);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDto resultado = usuarioService.transferirSubdecanato(2L);

        assertNotNull(resultado);
        assertEquals(RolUsuario.SUBDECANO, nuevoSubdecano.getRol());
        assertEquals(4L, nuevoSubdecano.getVersionToken());
        assertEquals(RolUsuario.TUTOR_ACADEMICO, subdecanoActual.getRol());
        assertEquals(2L, subdecanoActual.getVersionToken());
    }

    @Test
    @DisplayName("Deberia degradar automaticamente al Director de Carrera anterior a Tutor Academico cuando se asigna uno nuevo")
    void actualizarRelevoDirectorCarreraAutomatico() {
        Usuario directorAnterior = new Usuario();
        directorAnterior.setId(50L);
        directorAnterior.setRol(RolUsuario.DIRECTOR_CARRERA);
        directorAnterior.setEstado(EstadoUsuario.ACTIVO);
        directorAnterior.setVersionToken(1L);

        Carrera carrera = new Carrera();
        carrera.setId(5);
        carrera.setNombre("Sistemas");
        carrera.setDirector(directorAnterior);

        Usuario nuevoDirector = new Usuario();
        nuevoDirector.setId(60L);
        nuevoDirector.setCorreo("nuevo.dc@uce.edu.ec");
        nuevoDirector.setNombres("Nuevo");
        nuevoDirector.setApellidos("Director");
        nuevoDirector.setRol(RolUsuario.TUTOR_ACADEMICO);
        nuevoDirector.setEstado(EstadoUsuario.ACTIVO);
        nuevoDirector.setVersionToken(0L);

        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        UsuarioDto dtoActualizacion = new UsuarioDto(
                60L, "nuevo.dc@uce.edu.ec", "Nuevo", "Director", "1712345678",
                TipoIdentificacionUsuario.CEDULA, RolUsuario.DIRECTOR_CARRERA, 5, "0999999999", null,
                EstadoUsuario.ACTIVO, null, null
        );

        when(usuarioRepository.findById(60L)).thenReturn(Optional.of(nuevoDirector));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecano);
        when(carreraRepository.findById(5)).thenReturn(Optional.of(carrera));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDto resultado = usuarioService.actualizar(60L, dtoActualizacion);

        assertNotNull(resultado);
        assertEquals(RolUsuario.DIRECTOR_CARRERA, nuevoDirector.getRol());
        assertEquals(1L, nuevoDirector.getVersionToken());
        assertEquals(RolUsuario.TUTOR_ACADEMICO, directorAnterior.getRol());
        assertEquals(2L, directorAnterior.getVersionToken());
        assertEquals(nuevoDirector, carrera.getDirector());
    }

    @Test
    @DisplayName("Deberia degradar automaticamente al Subdecano en sesion a Tutor Academico cuando actualiza a otro usuario a Subdecano")
    void actualizarRelevoSubdecanoDesdeFormularioExitoso() {
        Usuario subdecanoActual = new Usuario();
        subdecanoActual.setId(1L);
        subdecanoActual.setRol(RolUsuario.SUBDECANO);
        subdecanoActual.setEstado(EstadoUsuario.ACTIVO);
        subdecanoActual.setVersionToken(5L);

        Usuario docente = new Usuario();
        docente.setId(70L);
        docente.setCorreo("docente.sub@uce.edu.ec");
        docente.setNombres("Docente");
        docente.setApellidos("Entrante");
        docente.setRol(RolUsuario.TUTOR_ACADEMICO);
        docente.setEstado(EstadoUsuario.ACTIVO);
        docente.setVersionToken(2L);

        UsuarioDto dtoActualizacion = new UsuarioDto(
                70L, "docente.sub@uce.edu.ec", "Docente", "Entrante", "1712345679",
                TipoIdentificacionUsuario.CEDULA, RolUsuario.SUBDECANO, null, "0999999999", null,
                EstadoUsuario.ACTIVO, null, null
        );

        when(usuarioRepository.findById(70L)).thenReturn(Optional.of(docente));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(subdecanoActual));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecanoActual);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioDto resultado = usuarioService.actualizar(70L, dtoActualizacion);

        assertNotNull(resultado);
        assertEquals(RolUsuario.SUBDECANO, docente.getRol());
        assertEquals(3L, docente.getVersionToken());
        assertEquals(RolUsuario.TUTOR_ACADEMICO, subdecanoActual.getRol());
        assertEquals(6L, subdecanoActual.getVersionToken());
    }
}
