package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.dtos.ActualizarPerfilDto;
import com.uce.api_pp_uce.dtos.TutorResumenDto;
import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.auth.CambiarContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.excepciones.CredencialesInvalidasException;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.security.ValidadorContraseniaNist;
import com.uce.api_pp_uce.services.ArchivoService;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.UsuarioService;
import com.uce.api_pp_uce.services.auth.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CarreraRepository carreraRepository;
    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final ProcesoPracticaRepository procesoPracticaRepository;
    private final UsuarioMapeador usuarioMapeador;
    private final PasswordEncoder codificadorContrasenia;
    private final AuthService authService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ValidadorContraseniaNist validadorContraseniaNist;
    private final CorreoService correoService;
    private final ArchivoService archivoService;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDto> buscarTodos(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDto> buscarConFiltros(String search, RolUsuario rol, Integer carreraId, Integer sinAsignacionEnPeriodoId, EstadoUsuario estado, Pageable pageable) {
        return usuarioRepository.buscarConFiltros(search, rol, carreraId, sinAsignacionEnPeriodoId, estado, pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDto buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + id));
        return mapToDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorResumenDto> obtenerResumenTutores(Integer carreraId, String search, Long periodoId) {
        List<Usuario> tutores = usuarioRepository.findTutoresParaResumen(carreraId, search);
        if (tutores.isEmpty()) return List.of();
        
        List<Long> tutorIds = tutores.stream().map(Usuario::getId).toList();
        List<AsignacionPractica> asignaciones = asignacionPracticaRepository.findByTutorAcademicoIdInAndPeriodoAcademicoId(tutorIds, periodoId);
        
        return tutores.stream().map(t -> {
            List<AsignacionPractica> asignacionesTutor = asignaciones.stream()
                .filter(a -> a.getTutorAcademico().getId().equals(t.getId()))
                .toList();
            
            List<UsuarioResumenDto> estudiantes = asignacionesTutor.stream()
                .map(a -> usuarioMapeador.aDtoResumen(a.getEstudiante()))
                .toList();
                
            return usuarioMapeador.aTutorResumenDto(t, (long) asignacionesTutor.size(), estudiantes);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDto login(LoginDto solicitud) {
        Usuario usuario = usuarioRepository.findByCorreo(solicitud.correo())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales invalidas: El correo no existe."));

        if (!codificadorContrasenia.matches(solicitud.clave(), usuario.getClaveHash())) {
            throw new CredencialesInvalidasException("Credenciales invalidas: La contrasenia es incorrecta.");
        }

        return mapToDto(usuario);
    }

    @Override
    @Transactional
    public UsuarioDto crear(UsuarioDto dto) {
        if (dto.correo() != null && !dto.correo().isBlank()) {
            String correoNorm = dto.correo().trim().toLowerCase();
            if (usuarioRepository.findByCorreo(correoNorm).isPresent()) {
                throw new NegocioException("El correo ingresado ya se encuentra registrado.");
            }
        }
        if (dto.identificacion() != null && !dto.identificacion().isBlank()) {
            String idNorm = dto.identificacion().trim();
            if (usuarioRepository.findByIdentificacion(idNorm).isPresent()) {
                throw new NegocioException("La identificación ingresada ya se encuentra registrada.");
            }
        }

        Usuario u = usuarioMapeador.aEntidad(dto);
        if (u.getTipoIdentificacion() == null) {
            u.setTipoIdentificacion(TipoIdentificacionUsuario.CEDULA);
        }
        if (u.getEstado() == null) {
            u.setEstado(EstadoUsuario.ACTIVO);
        }
        u.setClaveHash(codificadorContrasenia.encode(UUID.randomUUID().toString()));
        
        if (dto.carreraId() != null && u.getRol() != RolUsuario.SUBDECANO) {
            u.setCarrera(carreraRepository.findById(dto.carreraId()).orElse(null));
        } else {
            u.setCarrera(null);
        }
        u = usuarioRepository.save(u);
        
        sincronizarAutoridadCarreraAlAsignar(u);
        
        authService.enviarTokenActivacion(u);
        return mapToDto(u);
    }

    @Override
    @Transactional
    public UsuarioDto actualizar(Long id, UsuarioDto dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Usuario usuarioAutenticado = usuarioAutenticadoService.obtenerUsuarioLogueado();

        if (dto.correo() != null && !dto.correo().isBlank()) {
            String correoNorm = dto.correo().trim().toLowerCase();
            usuarioRepository.findByCorreo(correoNorm)
                    .filter(existente -> !existente.getId().equals(id))
                    .ifPresent(existente -> {
                        throw new NegocioException("El correo ingresado ya se encuentra registrado.");
                    });
        }
        if (dto.identificacion() != null && !dto.identificacion().isBlank()) {
            String idNorm = dto.identificacion().trim();
            usuarioRepository.findByIdentificacion(idNorm)
                    .filter(existente -> !existente.getId().equals(id))
                    .ifPresent(existente -> {
                        throw new NegocioException("La identificación ingresada ya se encuentra registrada.");
                    });
        }

        if (usuarioAutenticado != null && usuarioAutenticado.getId().equals(id)) {
            if (dto.rol() != null && dto.rol() != u.getRol()) {
                throw new NegocioException("No es posible cambiar su propio rol de usuario en sesion.");
            }
            if (dto.estado() != null && dto.estado() == EstadoUsuario.INACTIVO && u.getEstado() != EstadoUsuario.INACTIVO) {
                throw new NegocioException("No es posible desactivar su propia cuenta en sesion.");
            }
        }

        RolUsuario rolAnterior = u.getRol();
        EstadoUsuario estadoAnterior = u.getEstado();

        if (rolAnterior == RolUsuario.SUBDECANO && estadoAnterior == EstadoUsuario.ACTIVO) {
            boolean cambiaRol = dto.rol() != null && dto.rol() != RolUsuario.SUBDECANO;
            boolean seInactiva = dto.estado() != null && dto.estado() == EstadoUsuario.INACTIVO;
            if (cambiaRol || seInactiva) {
                long subdecanosActivos = usuarioRepository.countByRolAndEstado(RolUsuario.SUBDECANO, EstadoUsuario.ACTIVO);
                if (subdecanosActivos <= 1) {
                    throw new NegocioException("No se puede desactivar o cambiar el rol al unico Subdecano activo del sistema.");
                }
            }
        }

        desvincularAutoridadDeCarreras(u);

        usuarioMapeador.actualizarEntidadDesdeDto(dto, u);

        boolean cambioRol = dto.rol() != null && dto.rol() != rolAnterior;
        boolean cambioEstado = dto.estado() != null && dto.estado() != estadoAnterior;
        if (cambioRol || cambioEstado) {
            incrementarVersionToken(u);
        }

        if (dto.carreraId() != null && u.getRol() != RolUsuario.SUBDECANO) {
            u.setCarrera(carreraRepository.findById(dto.carreraId()).orElse(null));
        } else {
            u.setCarrera(null);
        }
        u = usuarioRepository.save(u);

        if (u.getEstado() == EstadoUsuario.ACTIVO) {
            sincronizarAutoridadCarreraAlAsignar(u);
            if (u.getRol() == RolUsuario.SUBDECANO && rolAnterior != RolUsuario.SUBDECANO) {
                reemplazarSubdecanoAnteriorSiCorresponde(u, usuarioAutenticado);
            }
        }

        return mapToDto(u);
    }

    @Override
    @Transactional
    public UsuarioDto transferirSubdecanato(Long nuevoSubdecanoId) {
        Usuario nuevoSubdecano = usuarioRepository.findById(nuevoSubdecanoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario destinatario no encontrado"));

        Usuario subdecanoActual = usuarioAutenticadoService.obtenerUsuarioLogueado();
        if (subdecanoActual == null || subdecanoActual.getRol() != RolUsuario.SUBDECANO) {
            throw new NegocioException("Solo el Subdecano en funciones puede transferir el cargo.");
        }

        if (subdecanoActual.getId().equals(nuevoSubdecano.getId())) {
            throw new NegocioException("No puede transferir el cargo a su propia cuenta.");
        }

        if (nuevoSubdecano.getEstado() == EstadoUsuario.INACTIVO) {
            throw new NegocioException("No se puede transferir el Subdecanato a un usuario inactivo.");
        }

        if (nuevoSubdecano.getRol() == RolUsuario.ESTUDIANTE) {
            throw new NegocioException("No se puede transferir el Subdecanato a un estudiante.");
        }

        // Si el nuevo subdecano era autoridad de una carrera (DC o CPP), desvincularlo de la carrera
        desvincularAutoridadDeCarreras(nuevoSubdecano);

        // Promover al nuevo Subdecano
        nuevoSubdecano.setRol(RolUsuario.SUBDECANO);
        nuevoSubdecano.setCarrera(null);
        incrementarVersionToken(nuevoSubdecano);
        usuarioRepository.save(nuevoSubdecano);

        // Relevar al Subdecano saliente pasandolo a Tutor Academico e invalidando su sesion
        Usuario salientePersistido = usuarioRepository.findById(subdecanoActual.getId())
                .orElse(subdecanoActual);
        salientePersistido.setRol(RolUsuario.TUTOR_ACADEMICO);
        incrementarVersionToken(salientePersistido);
        usuarioRepository.save(salientePersistido);

        return mapToDto(nuevoSubdecano);
    }

    private void desvincularAutoridadDeCarreras(Usuario u) {
        if (u == null || u.getId() == null || carreraRepository == null) {
            return;
        }
        Carrera carreraAnterior = u.getCarrera();
        if (carreraAnterior != null) {
            boolean modificada = false;
            if (carreraAnterior.getDirector() != null && carreraAnterior.getDirector().getId().equals(u.getId())) {
                carreraAnterior.setDirector(null);
                modificada = true;
            }
            if (carreraAnterior.getCoordinador() != null && carreraAnterior.getCoordinador().getId().equals(u.getId())) {
                carreraAnterior.setCoordinador(null);
                modificada = true;
            }
            if (modificada) {
                carreraRepository.save(carreraAnterior);
            }
        }
        carreraRepository.findByDirectorId(u.getId()).ifPresent(c -> {
            c.setDirector(null);
            carreraRepository.save(c);
        });
        carreraRepository.findByCoordinadorId(u.getId()).ifPresent(c -> {
            c.setCoordinador(null);
            carreraRepository.save(c);
        });
    }

    private void sincronizarAutoridadCarreraAlAsignar(Usuario u) {
        if (u.getCarrera() == null || carreraRepository == null) {
            return;
        }
        Carrera carrera = u.getCarrera();
        if (u.getRol() == RolUsuario.DIRECTOR_CARRERA) {
            Usuario directorAnterior = carrera.getDirector();
            if (directorAnterior != null && !directorAnterior.getId().equals(u.getId())) {
                degradarAutoridadSalienteATutor(directorAnterior);
            }
            usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA, carrera.getId())
                    .filter(existente -> !existente.getId().equals(u.getId()))
                    .ifPresent(this::degradarAutoridadSalienteATutor);
            carrera.setDirector(u);
            carreraRepository.save(carrera);
        } else if (u.getRol() == RolUsuario.COORDINADOR_PRACTICAS) {
            Usuario coordinadorAnterior = carrera.getCoordinador();
            if (coordinadorAnterior != null && !coordinadorAnterior.getId().equals(u.getId())) {
                degradarAutoridadSalienteATutor(coordinadorAnterior);
            }
            usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS, carrera.getId())
                    .filter(existente -> !existente.getId().equals(u.getId()))
                    .ifPresent(this::degradarAutoridadSalienteATutor);
            carrera.setCoordinador(u);
            carreraRepository.save(carrera);
        }
    }

    private void degradarAutoridadSalienteATutor(Usuario autoridadAnterior) {
        if (autoridadAnterior.getRol() == RolUsuario.DIRECTOR_CARRERA || autoridadAnterior.getRol() == RolUsuario.COORDINADOR_PRACTICAS) {
            autoridadAnterior.setRol(RolUsuario.TUTOR_ACADEMICO);
            incrementarVersionToken(autoridadAnterior);
            usuarioRepository.save(autoridadAnterior);
        }
    }

    private void reemplazarSubdecanoAnteriorSiCorresponde(Usuario nuevoSubdecano, Usuario usuarioAutenticado) {
        if (usuarioAutenticado != null
                && usuarioAutenticado.getRol() == RolUsuario.SUBDECANO
                && !usuarioAutenticado.getId().equals(nuevoSubdecano.getId())) {
            Usuario salientePersistido = usuarioRepository.findById(usuarioAutenticado.getId())
                    .orElse(usuarioAutenticado);
            salientePersistido.setRol(RolUsuario.TUTOR_ACADEMICO);
            incrementarVersionToken(salientePersistido);
            usuarioRepository.save(salientePersistido);
        }
    }

    private void incrementarVersionToken(Usuario u) {
        u.setVersionToken(u.getVersionToken() != null ? u.getVersionToken() + 1L : 1L);
    }

    @Override
    @Transactional
    public UsuarioDto actualizarPerfil(Long id, ActualizarPerfilDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + id));

        Usuario usuarioAutenticado = usuarioAutenticadoService.obtenerUsuarioLogueado();
        if (usuarioAutenticado != null && !usuarioAutenticado.getId().equals(id) && usuarioAutenticado.getRol() != RolUsuario.SUBDECANO) {
            throw new NegocioException("No tiene permisos para modificar el perfil de otro usuario.");
        }

        if (dto.telefono() != null) {
            String telefonoLimpio = dto.telefono().trim();
            usuario.setTelefono(telefonoLimpio.isEmpty() ? null : telefonoLimpio);
        }

        usuario = usuarioRepository.save(usuario);
        return mapToDto(usuario);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Usuario usuarioAutenticado = usuarioAutenticadoService.obtenerUsuarioLogueado();
        if (usuarioAutenticado != null && usuarioAutenticado.getId().equals(id)) {
            throw new NegocioException("No es posible eliminar su propia cuenta de usuario en sesion.");
        }

        if (u.getRol() == RolUsuario.SUBDECANO && u.getEstado() == EstadoUsuario.ACTIVO) {
            long subdecanosActivos = usuarioRepository.countByRolAndEstado(RolUsuario.SUBDECANO, EstadoUsuario.ACTIVO);
            if (subdecanosActivos <= 1) {
                throw new NegocioException("No se puede eliminar al unico Subdecano activo del sistema. Debe existir al menos un Subdecano.");
            }
        }

        desvincularAutoridadDeCarreras(u);
        incrementarVersionToken(u);
        usuarioRepository.delete(u);
    }

    @Override
    @Transactional
    public List<UsuarioDto> cargaMasivaCsv(MultipartFile archivo) {
        List<Usuario> nuevosUsuarios = new ArrayList<>();
        Set<String> correosProcesados = new HashSet<>();
        Set<String> identificacionesProcesadas = new HashSet<>();
        Map<Integer, Carrera> carrerasCache = new HashMap<>();

        // Pre-calcular una clave temporal codificada para no ejecutar BCrypt por cada fila
        String claveHashTemporal = codificadorContrasenia.encode(UUID.randomUUID().toString());

        try (BufferedReader br = new BufferedReader(new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            String linea;
            boolean primeraLinea = true;
            while ((linea = br.readLine()) != null) {
                if (primeraLinea) {
                    primeraLinea = false;
                    continue; // Saltar cabecera
                }
                String[] datos = linea.split(",", -1);
                if (datos.length >= 5) {
                    
                    // Verificar si la identificacion o correo ya existen
                    String correo = datos[2].trim();
                    String identificacion = datos[3].trim();
                    
                    if (correo.isEmpty() || identificacion.isEmpty()) {
                        continue;
                    }

                    // Evitar duplicados dentro del mismo archivo CSV
                    if (!correosProcesados.add(correo.toLowerCase()) || !identificacionesProcesadas.add(identificacion)) {
                        continue;
                    }

                    // Verificar en base de datos si ya existen
                    if (usuarioRepository.findByCorreo(correo).isPresent() || usuarioRepository.findByIdentificacion(identificacion).isPresent()) {
                        continue; // Omitir duplicados ya registrados
                    }

                    // nombres,apellidos,correo,identificacion,tipo_identificacion,rol,carrera_id
                    Usuario u = new Usuario();
                    u.setNombres(datos[0].trim());
                    u.setApellidos(datos[1].trim());
                    u.setCorreo(correo);
                    u.setIdentificacion(identificacion);

                    // Manejar formato flexible para tipo de identificación y rol
                    TipoIdentificacionUsuario tipoIdentificacion = TipoIdentificacionUsuario.CEDULA;
                    RolUsuario rol = RolUsuario.ESTUDIANTE;
                    int indiceCarrera = 6;

                    if (datos.length >= 6) {
                        try {
                            tipoIdentificacion = TipoIdentificacionUsuario.valueOf(datos[4].trim().toUpperCase());
                            rol = RolUsuario.valueOf(datos[5].trim().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            // En caso de CSV sin columna tipo_identificacion: datos[4] es rol
                            try {
                                rol = RolUsuario.valueOf(datos[4].trim().toUpperCase());
                                indiceCarrera = 5;
                            } catch (IllegalArgumentException ignored) {
                            }
                        }
                    }

                    u.setTipoIdentificacion(tipoIdentificacion);
                    u.setRol(rol);
                    
                    if (rol != RolUsuario.SUBDECANO && datos.length > indiceCarrera && !datos[indiceCarrera].trim().isEmpty()) {
                        try {
                            Integer carreraId = Integer.parseInt(datos[indiceCarrera].trim());
                            u.setCarrera(carrerasCache.computeIfAbsent(carreraId, id -> carreraRepository.findById(id).orElse(null)));
                        } catch (NumberFormatException ignored) {
                        }
                    }

                    u.setEstado(EstadoUsuario.ACTIVO);
                    u.setClaveHash(claveHashTemporal);
                    nuevosUsuarios.add(u);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el archivo CSV: " + e.getMessage(), e);
        }
        
        List<Usuario> guardados = usuarioRepository.saveAll(nuevosUsuarios);
        
        for (Usuario usr : guardados) {
            sincronizarAutoridadCarreraAlAsignar(usr);
            authService.enviarTokenActivacion(usr);
        }
        
        return guardados.stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional
    public void cambiarContrasenia(Long id, CambiarContraseniaDto dto) {
        validadorContraseniaNist.validar(dto.nuevaContrasenia());

        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        
        if (!codificadorContrasenia.matches(dto.contraseniaActual(), u.getClaveHash())) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }

        validadorContraseniaNist.validar(dto.nuevaContrasenia(), u);
        
        u.setClaveHash(codificadorContrasenia.encode(dto.nuevaContrasenia()));
        incrementarVersionToken(u);
        usuarioRepository.save(u);

        Map<String, Object> variables = Map.of(
                "nombre", u.getNombres()
        );
        correoService.enviarCorreoHtml(u.getCorreo(), "Aviso de Seguridad - Contraseña Cambiada - FICA UCE", "email/contrasenia-cambiada", variables);
    }

    @Override
    public boolean validarContrasenia(Long id, String contrasenia) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        return codificadorContrasenia.matches(contrasenia, u.getClaveHash());
    }

    @Override
    @Transactional
    public void actualizarAvatar(Long id, String urlAvatar) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        String urlAnterior = usuario.getUrlAvatar();
        usuario.setUrlAvatar(urlAvatar);
        usuarioRepository.save(usuario);

        if (urlAnterior != null && !urlAnterior.trim().isEmpty() && !urlAnterior.equals(urlAvatar)) {
            archivoService.eliminarArchivo(urlAnterior);
        }
    }

    @Override
    @Transactional
    public void reenviarTokenActivacion(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        authService.enviarTokenActivacion(usuario);
    }

    private UsuarioDto mapToDto(Usuario u) {
        Integer carreraId = (u.getCarrera() != null) ? u.getCarrera().getId() : null;
        Integer horasRequeridas = null;
        Integer horasAcumuladas = null;

        if (u.getRol() == RolUsuario.ESTUDIANTE && carreraId != null && procesoPracticaRepository != null) {
            Optional<ProcesoPractica> procesoOpt = procesoPracticaRepository.findByEstudianteIdAndCarreraId(u.getId(), carreraId);
            if (procesoOpt.isPresent()) {
                horasRequeridas = procesoOpt.get().getHorasRequeridas();
                horasAcumuladas = procesoOpt.get().getHorasAcumuladas();
            } else {
                horasRequeridas = u.getCarrera().getHorasPractica() != null ? u.getCarrera().getHorasPractica() : 240;
                horasAcumuladas = 0;
            }
        }

        return usuarioMapeador.aDto(u, horasRequeridas, horasAcumuladas);
    }
}
