package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.common.Utilitarios;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto; 
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.ProyectoComunitarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProyectoComunitarioServiceImpl implements ProyectoComunitarioService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento = "archivos_subidos";

    private final ProyectoComunitarioRepository proyectoComunitarioRepository;
    private final CarreraRepository carreraRepository;
    private final UsuarioRepository usuarioRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final ProyectoComunitarioMapeador proyectoComunitarioMapeador;
    private final NotificacionService notificacionService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    private Usuario obtenerUsuarioAutenticadoActual() {
        return usuarioAutenticadoService != null ? usuarioAutenticadoService.obtenerUsuarioLogueado() : null;
    }

    private void validarAccesoProyecto(ProyectoComunitario entidad) {
        validarAccesoProyecto(entidad, obtenerUsuarioAutenticadoActual());
    }

    private void validarAccesoProyecto(ProyectoComunitario entidad, Usuario usuario) {
        if (usuario == null || entidad == null) {
            return;
        }
        RolUsuario rol = usuario.getRol();
        if (rol == null || rol == RolUsuario.SUBDECANO) {
            return;
        }
        if (rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.COORDINADOR_PRACTICAS) {
            Integer miCarreraId = usuario.getCarrera() != null ? usuario.getCarrera().getId() : null;
            Integer carreraProyecto = entidad.getCarrera() != null ? entidad.getCarrera().getId() : null;
            if (miCarreraId != null && carreraProyecto != null && !miCarreraId.equals(carreraProyecto)) {
                throw new AccessDeniedException("No tiene permisos para acceder a proyectos de otra carrera.");
            }
            return;
        }
        if (rol == RolUsuario.TUTOR_ACADEMICO) {
            Long miId = usuario.getId();
            Long tutorProyectoId = entidad.getTutorAcademico() != null ? entidad.getTutorAcademico().getId() : null;
            if (tutorProyectoId == null || miId == null || !miId.equals(tutorProyectoId)) {
                throw new AccessDeniedException("No tiene permisos para acceder a proyectos donde no es el tutor asignado.");
            }
            return;
        }
        if (rol == RolUsuario.ESTUDIANTE) {
            boolean estaAsignado = usuario.getId() != null
                    && entidad.getId() != null
                    && asignacionProyectoComunitarioRepository
                            .existsByProyectoComunitarioIdAndProcesoVinculacionEstudianteId(
                                    entidad.getId(), usuario.getId());
            if (!estaAsignado) {
                throw new AccessDeniedException("No tiene permisos para acceder a un proyecto al que no está asignado.");
            }
            return;
        }
        throw new AccessDeniedException("No tiene permisos para acceder a este proyecto comunitario.");
    }

    private ProyectoComunitarioDto enmascararUrlDocumento(ProyectoComunitario entidad, ProyectoComunitarioDto dto) {
        if (dto != null && entidad != null && entidad.getId() != null
                && entidad.getUrlDocumento() != null && !entidad.getUrlDocumento().isBlank()) {
            return new ProyectoComunitarioDto(
                    dto.id(),
                    dto.nombre(),
                    dto.descripcion(),
                    dto.carreraId(),
                    dto.nombreCarrera(),
                    dto.tutorAcademicoId(),
                    dto.nombreCompletoTutor(),
                    dto.correoTutor(),
                    dto.estado(),
                    dto.fechaInicio(),
                    dto.fechaFin(),
                    "/proyectos-comunitarios/" + entidad.getId() + "/preview",
                    dto.nombreDocumento(),
                    dto.fechaCreacion(),
                    dto.iniciado()
            );
        }
        return dto;
    }

    private boolean esUrlPreviewProyecto(String url) {
        return url.matches("^(/api/proxy)?/proyectos-comunitarios/\\d+/(preview|descargar)(\\?.*)?$");
    }

    private Long resolverPeriodoReferencia(Long periodoId) {
        if (periodoId != null) {
            return periodoId;
        }
        List<PeriodoAcademico> activos = periodoAcademicoRepository.findByEstado(EstadoPeriodo.ACTIVO);
        if (activos != null && !activos.isEmpty()) {
            return activos.get(0).getId();
        }
        return null;
    }

    private ProyectoComunitarioDto mapearConEstadoInicio(ProyectoComunitario entidad, Long periodoId) {
        Long periodoRef = resolverPeriodoReferencia(periodoId);
        boolean iniciado = periodoRef != null
                ? asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndPeriodoAcademicoIdAndFaseActualNot(
                        entidad.getId(), periodoRef, FaseActualAsignacion.ASIGNACION)
                : asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndFaseActualNot(
                        entidad.getId(), FaseActualAsignacion.ASIGNACION);
        return enmascararUrlDocumento(entidad, proyectoComunitarioMapeador.aDto(entidad, iniciado));
    }

    private Pageable mapearPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            return pageable;
        }
        List<Sort.Order> ordenes = new ArrayList<>();
        for (Sort.Order orden : pageable.getSort()) {
            String propiedad = orden.getProperty();
            String propiedadMapeada = switch (propiedad) {
                case "carrera", "carreraNombre" -> "carrera.nombre";
                case "tutor", "tutorAcademico" -> "tutorAcademico.nombres";
                default -> propiedad;
            };
            ordenes.add(new Sort.Order(orden.getDirection(), propiedadMapeada));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(ordenes));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId, EstadoProyecto estado, Long periodoId, Pageable pageable) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        Integer carreraFiltro = carreraId;
        Long tutorFiltro = tutorId;

        Usuario usuario = usuarioAutenticadoService.obtenerUsuarioLogueado();
        if (usuario != null) {
            RolUsuario rol = usuario.getRol();
            if ((rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.COORDINADOR_PRACTICAS)
                    && usuario.getCarrera() != null) {
                carreraFiltro = usuario.getCarrera().getId();
            } else if (rol == RolUsuario.TUTOR_ACADEMICO) {
                tutorFiltro = usuario.getId();
                if (usuario.getCarrera() != null) {
                    carreraFiltro = usuario.getCarrera().getId();
                }
            }
        }

        Pageable pageableMapeado = mapearPageable(pageable);
        return proyectoComunitarioRepository.buscarConFiltros(busquedaLimpia, carreraFiltro, tutorFiltro, estado, pageableMapeado)
                .map(entidad -> mapearConEstadoInicio(entidad, periodoId));
    }

    @Override
    @Transactional(readOnly = true)
    public ProyectoComunitarioDto buscarPorId(Long id, Long periodoId) {
        ProyectoComunitario entidad = proyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id));
        validarAccesoProyecto(entidad);
        return mapearConEstadoInicio(entidad, periodoId);
    }

    @Override
    @Transactional
    public ProyectoComunitarioDto crearProyecto(ProyectoComunitarioNuevoDto dto) {
        Utilitarios.validarRangoFechas(dto.fechaInicio(), dto.fechaFin());

        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada con ID: " + dto.carreraId()));

        if (proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraId(dto.nombre().trim(), dto.carreraId())) {
            throw new NegocioException("Ya existe un proyecto comunitario con el nombre '" + dto.nombre().trim() + "' en esta carrera.");
        }

        Usuario tutorAcademico = null;
        if (dto.tutorAcademicoId() != null) {
            tutorAcademico = usuarioRepository.findById(dto.tutorAcademicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor académico no encontrado con ID: " + dto.tutorAcademicoId()));

            long proyectosTutor = proyectoComunitarioRepository.countByTutorAcademicoIdAndEstadoNot(dto.tutorAcademicoId(), EstadoProyecto.CANCELADO);
            if (proyectosTutor >= 2) {
                throw new NegocioException("El tutor académico seleccionado ya tiene 2 proyectos asignados. No puede tener más de 2 proyectos asociados.");
            }
        }

        ProyectoComunitario nuevaEntidad = proyectoComunitarioMapeador.aEntidad(dto);
        nuevaEntidad.setCarrera(carrera);
        nuevaEntidad.setTutorAcademico(tutorAcademico);

        ProyectoComunitario guardado = proyectoComunitarioRepository.save(nuevaEntidad);

        if (tutorAcademico != null) {
            notificacionService.enviar(
                    tutorAcademico.getId(),
                    "Designación como Tutor de Proyecto",
                    "Has sido designado como Tutor Académico del proyecto comunitario: " + guardado.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios"
            );
        }

        return enmascararUrlDocumento(guardado, proyectoComunitarioMapeador.aDto(guardado));
    }

    @Override
    @Transactional
    public ProyectoComunitarioDto actualizarProyecto(Long id, ProyectoComunitarioActualizarDto dto) {
        Utilitarios.validarRangoFechas(dto.fechaInicio(), dto.fechaFin());

        ProyectoComunitario entidadExistente = proyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id));

        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada con ID: " + dto.carreraId()));

        // Validar que NO exista OTRO proyecto con el mismo nombre en la misma carrera
        if (proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot(dto.nombre().trim(), dto.carreraId(), id)) {
            throw new NegocioException("Ya existe otro proyecto comunitario con el nombre '" + dto.nombre().trim() + "' en esta carrera.");
        }

        Usuario tutorAcademico = null;
        if (dto.tutorAcademicoId() != null) {
            tutorAcademico = usuarioRepository.findById(dto.tutorAcademicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor académico no encontrado con ID: " + dto.tutorAcademicoId()));

            long proyectosTutor = proyectoComunitarioRepository.countByTutorAcademicoIdAndIdNotAndEstadoNot(dto.tutorAcademicoId(), id, EstadoProyecto.CANCELADO);
            if (proyectosTutor >= 2) {
                throw new NegocioException("El tutor académico seleccionado ya tiene 2 proyectos asignados. No puede tener más de 2 proyectos asociados.");
            }
        }

        Usuario tutorAnterior = entidadExistente.getTutorAcademico();
        Long idTutorAnterior = tutorAnterior != null ? tutorAnterior.getId() : null;
        String urlDocumentoAnterior = entidadExistente.getUrlDocumento();
        String nombreDocumentoAnterior = entidadExistente.getNombreDocumento();

        proyectoComunitarioMapeador.actualizarEntidadDesdeDto(dto, entidadExistente);
        if (dto.urlDocumento() != null) {
            String urlDto = dto.urlDocumento().trim();
            if (urlDto.isEmpty()) {
                entidadExistente.setUrlDocumento(null);
                entidadExistente.setNombreDocumento(null);
            } else if (esUrlPreviewProyecto(urlDto)) {
                entidadExistente.setUrlDocumento(urlDocumentoAnterior);
                if (dto.nombreDocumento() == null || dto.nombreDocumento().isBlank()) {
                    entidadExistente.setNombreDocumento(nombreDocumentoAnterior);
                }
            }
        }
        entidadExistente.setCarrera(carrera);
        if (dto.tutorAcademicoId() != null) {
            entidadExistente.setTutorAcademico(tutorAcademico);
        }

        ProyectoComunitario actualizado = proyectoComunitarioRepository.save(entidadExistente);

        if (tutorAcademico != null && (idTutorAnterior == null || !idTutorAnterior.equals(tutorAcademico.getId()))) {
            notificacionService.enviar(
                    tutorAcademico.getId(),
                    "Designación como Tutor de Proyecto",
                    "Has sido designado como Tutor Académico del proyecto comunitario: " + actualizado.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios"
            );
        }

        return enmascararUrlDocumento(actualizado, proyectoComunitarioMapeador.aDto(actualizado));
    }

    @Override
    @Transactional
    public void eliminarProyecto(Long id) {
        if (!proyectoComunitarioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id);
        }
        proyectoComunitarioRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ArchivoDescargaDto obtenerProyectoDescarga(Long id) {
        return obtenerProyectoDescarga(id, obtenerUsuarioAutenticadoActual());
    }

    @Override
    @Transactional(readOnly = true)
    public ArchivoDescargaDto obtenerProyectoDescarga(Long id, Usuario usuarioAutenticado) {
        Usuario actor = usuarioAutenticado != null ? usuarioAutenticado : obtenerUsuarioAutenticadoActual();
        ProyectoComunitario proyecto = proyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id));

        validarAccesoProyecto(proyecto, actor);

        if (proyecto.getUrlDocumento() == null || proyecto.getUrlDocumento().isBlank()) {
            throw new RecursoNoEncontradoException("El proyecto comunitario no tiene un documento asociado");
        }

        String rutaLimpia = proyecto.getUrlDocumento().trim();
        int idxArchivos = rutaLimpia.indexOf("/archivos_subidos/");
        if (idxArchivos != -1) {
            rutaLimpia = rutaLimpia.substring(idxArchivos + "/archivos_subidos/".length());
        } else {
            if (rutaLimpia.startsWith("/")) {
                rutaLimpia = rutaLimpia.substring(1);
            }
            if (rutaLimpia.startsWith("archivos_subidos/")) {
                rutaLimpia = rutaLimpia.substring("archivos_subidos/".length());
            }
        }

        String baseConfig = rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos";
        Path carpetaBase = Paths.get(baseConfig).toAbsolutePath().normalize();
        if (!Files.exists(carpetaBase) && Files.exists(Paths.get("backend", baseConfig))) {
            carpetaBase = Paths.get("backend", baseConfig).toAbsolutePath().normalize();
        }
        Path filePath = carpetaBase.resolve(rutaLimpia).normalize().toAbsolutePath();

        if (!filePath.startsWith(carpetaBase)) {
            throw new NegocioException("Acceso no permitido: ruta de archivo invalida");
        }

        if (!Files.exists(filePath)) {
            Path nombrePlano = Paths.get(rutaLimpia).getFileName();
            if (nombrePlano != null) {
                for (String sub : List.of("vinculacion", "vinculacion/proyectos")) {
                    Path posible = carpetaBase.resolve(sub).resolve(nombrePlano).normalize().toAbsolutePath();
                    if (posible.startsWith(carpetaBase) && Files.exists(posible)) {
                        filePath = posible;
                        break;
                    }
                }
            }
            if (!Files.exists(filePath)) {
                throw new RecursoNoEncontradoException("El archivo físico del proyecto no existe en el servidor: " + filePath.getFileName());
            }
        }

        byte[] contenido;
        try {
            contenido = Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo del proyecto del disco", e);
        }

        String nombreDescarga = proyecto.getNombreDocumento() != null && !proyecto.getNombreDocumento().isBlank()
                ? proyecto.getNombreDocumento()
                : filePath.getFileName().toString();
        if (!nombreDescarga.toLowerCase().endsWith(".pdf")) {
            nombreDescarga += ".pdf";
        }

        return new ArchivoDescargaDto(contenido, nombreDescarga, "application/pdf");
    }
}
