package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.dtos.AsignacionStatsDto;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.ArchivoService;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.repositories.pp.DocumentoPortafolioRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.repositories.vcs.ProcesoVinculacionRepository;
import com.uce.api_pp_uce.mapeadores.pp.AsignacionPracticaMapeador;
import com.uce.api_pp_uce.exportadores.pp.CartaAsignacionPdfExportador;
import com.uce.api_pp_uce.exportadores.pp.AvalCumplimientoPdfExportador;
import com.uce.api_pp_uce.services.pp.AsignacionPracticaService;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import java.util.ArrayList;
import java.util.List;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsignacionPracticaServiceImpl implements AsignacionPracticaService {

        private final AsignacionPracticaRepository asignacionPracticaRepository;
        private final UsuarioRepository usuarioRepository;
        private final ConvenioRepository convenioRepository;
        private final DocumentoPortafolioRepository documentoRepository;
        private final NotificacionService notificacionService;
        private final PeriodoAcademicoRepository periodoAcademicoRepository;
        private final ProcesoPracticaRepository procesoPracticaRepository;
        private final ProcesoVinculacionRepository procesoVinculacionRepository;
        private final CartaAsignacionPdfExportador cartaAsignacionPdfExportador;
        private final AvalCumplimientoPdfExportador avalCumplimientoPdfExportador;
        private final CorreoService correoService;
        private final AsignacionPracticaMapeador asignacionPracticaMapeador;
        private final ArchivoService archivoService;

        @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
        private String rutaBaseAlmacenamiento = "archivos_subidos";

        private Pageable mapearPageable(Pageable pageable) {
                if (pageable == null || pageable.getSort().isUnsorted()) {
                        return pageable;
                }
                List<Sort.Order> ordenes = new ArrayList<>();
                for (Sort.Order orden : pageable.getSort()) {
                        String propiedad = orden.getProperty();
                        String propiedadMapeada = switch (propiedad) {
                                case "estudiante", "estudiante.nombres", "nombreEstudiante" ->
                                        "procesoPractica.estudiante.nombres";
                                case "estudiante.apellidos", "apellidos" -> "procesoPractica.estudiante.apellidos";
                                case "carrera", "carreraNombre", "estudiante.carrera.nombre" ->
                                        "procesoPractica.estudiante.carrera.nombre";
                                case "convenio", "institucion", "convenio.institucion" -> "convenio.institucion";
                                case "tutor", "tutorAcademico", "tutor.nombres" -> "tutorAcademico.nombres";
                                default -> propiedad;
                        };
                        ordenes.add(new Sort.Order(orden.getDirection(), propiedadMapeada));
                }
                return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(ordenes));
        }

        @Override
        @Transactional(readOnly = true)
        public Page<AsignacionPracticaDetalleDto> buscarConFiltros(String busqueda, EstadoAsignacion estado,
                        FaseActualPractica fase, Integer carreraId, Long periodoId, Long tutorId, Long estudianteId,
                        Boolean requiereCarta, Pageable pageable) {
                Pageable pageableMapeado = mapearPageable(pageable);
                return asignacionPracticaRepository
                                .findByFiltros(busqueda, estado, fase, carreraId, periodoId, tutorId, estudianteId,
                                                requiereCarta,
                                                pageableMapeado)
                                .map(this::mapToDetalleDto);
        }

        @Override
        @Transactional(readOnly = true)
        public AsignacionPracticaDetalleDto buscarDetallePorId(Long id) {
                AsignacionPractica asignacion = asignacionPracticaRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Asignacion no encontrada con ID: " + id));
                return mapToDetalleDto(asignacion);
        }

        @Override
        @Transactional(readOnly = true)
        public AsignacionStatsDto obtenerEstadisticas() {
                long total = asignacionPracticaRepository.count();
                long conTutor = asignacionPracticaRepository.countByTutorAcademicoIsNotNull();
                long sinTutor = asignacionPracticaRepository.countByTutorAcademicoIsNull();
                long enProgreso = asignacionPracticaRepository.countByEstado(EstadoAsignacion.EN_CURSO);
                return new AsignacionStatsDto(total, conTutor, sinTutor, enProgreso);
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto asignarTutorYConvenio(Long estudianteId, Long convenioId, Long tutorId,
                        String tutorInstitucional, Integer horas, Long periodoAcademicoId) {

                if (estudianteId == null)
                        throw new IllegalArgumentException(
                                        "El estudianteId es null. Payload recibido puede estar fallando en la conversión.");
                if (convenioId == null)
                        throw new IllegalArgumentException("El convenioId es null.");
                if (tutorId == null)
                        throw new IllegalArgumentException("El tutorId es null.");
                if (periodoAcademicoId == null)
                        throw new IllegalArgumentException("El periodoAcademicoId es null.");

                validarPeriodoActivo(periodoAcademicoId);

                Usuario estudiante = usuarioRepository.findById(estudianteId)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Estudiante no encontrado"));

                if (estudiante.getEstado() != EstadoUsuario.ACTIVO) {
                        throw new NegocioException("El estudiante " + estudiante.getNombreCompleto() + " no se encuentra en estado activo para nuevas asignaciones");
                }

                Convenio convenio = convenioRepository.findById(convenioId)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado"));

                Usuario tutor = usuarioRepository.findById(tutorId)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Tutor no encontrado"));

                if (asignacionPracticaRepository.existsByProcesoPracticaEstudianteIdAndPeriodoAcademicoIdAndEstadoNot(
                                estudianteId, periodoAcademicoId, EstadoAsignacion.CANCELADO)) {
                        throw new NegocioException("El estudiante ya cuenta con una asignación activa en el periodo académico seleccionado");
                }

                long cargaTutor = asignacionPracticaRepository.countByTutorAcademicoIdAndPeriodoAcademicoId(tutorId,
                                periodoAcademicoId);
                if (cargaTutor >= 10) {
                        throw new IllegalArgumentException(
                                        "El Tutor Académico seleccionado ya ha alcanzado el límite máximo de 10 estudiantes.");
                }

                long ocupados = asignacionPracticaRepository.countByConvenioIdAndEstado(convenioId,
                                EstadoAsignacion.EN_CURSO);
                if (convenio.getCuposDisponibles() != null && (convenio.getCuposDisponibles() - ocupados) <= 0) {
                        throw new IllegalArgumentException("El convenio seleccionado ya no tiene cupos disponibles.");
                }

                if (estudiante.getCarrera() == null) {
                        throw new IllegalArgumentException("El estudiante no tiene una carrera asignada.");
                }

                ProcesoPractica proceso = procesoPracticaRepository
                                .findByEstudianteIdAndCarreraId(estudiante.getId(), estudiante.getCarrera().getId())
                                .orElseGet(() -> {
                                        ProcesoPractica nuevo = new ProcesoPractica();
                                        nuevo.setEstudiante(estudiante);
                                        nuevo.setCarrera(estudiante.getCarrera());
                                        nuevo.setHorasRequeridas(estudiante.getCarrera().getHorasPractica() != null
                                                        ? estudiante.getCarrera().getHorasPractica()
                                                        : 240);
                                        nuevo.setHorasAcumuladas(0);
                                        nuevo.setEstado(EstadoProceso.EN_CURSO);
                                        return procesoPracticaRepository.save(nuevo);
                                });

                AsignacionPractica asignacion = new AsignacionPractica();
                asignacion.setProcesoPractica(proceso);
                asignacion.setConvenio(convenio);
                asignacion.setTutorAcademico(tutor);
                asignacion.setTutorInstitucional(tutorInstitucional);
                if (horas == null || horas <= 0) {
                        throw new IllegalArgumentException("Las horas asignadas deben ser mayores a 0.");
                }
                Integer maxHorasCarrera = (estudiante.getCarrera() != null
                                && estudiante.getCarrera().getHorasPractica() != null)
                                                ? estudiante.getCarrera().getHorasPractica()
                                                : 240;
                int horasAcumuladasActuales = proceso.getHorasAcumuladas() != null ? proceso.getHorasAcumuladas() : 0;
                int horasRequeridasProceso = proceso.getHorasRequeridas() != null ? proceso.getHorasRequeridas() : maxHorasCarrera;
                if (proceso.getEstado() == EstadoProceso.COMPLETADO || horasAcumuladasActuales >= horasRequeridasProceso) {
                        throw new NegocioException("El estudiante ya tiene su proceso de prácticas preprofesionales completado.");
                }
                if (horasAcumuladasActuales + horas > horasRequeridasProceso) {
                        throw new IllegalArgumentException("Las horas asignadas (" + horas
                                        + "h) exceden las horas restantes requeridas para el proceso (" + (horasRequeridasProceso - horasAcumuladasActuales) + "h disponibles de " + horasRequeridasProceso + "h).");
                }
                asignacion.setHorasAsignadas(horas);
                asignacion.setHorasCompletadas(0);
                asignacion.setSemestre(8); // Mock
                asignacion.setPeriodoAcademico(periodoAcademicoRepository.findById(periodoAcademicoId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Periodo académico no encontrado")));
                asignacion.setFechaInicio(LocalDate.now());
                asignacion.setFase(FaseActualPractica.ASIGNACION);
                asignacion.setEstado(EstadoAsignacion.EN_CURSO);

                asignacion = asignacionPracticaRepository.save(asignacion);

                // Vincular los documentos subidos a esta nueva asignación
                List<DocumentoPortafolio> documentos = documentoRepository
                                .findByEstudianteIdOrderByIdDesc(estudiante.getId());
                for (DocumentoPortafolio doc : documentos) {
                        if (doc.getAsignacion() == null) {
                                doc.setAsignacion(asignacion);
                                doc.setProcesoPractica(proceso);
                                documentoRepository.save(doc);
                        } else if (doc.getProcesoPractica() == null
                                        && doc.getAsignacion().getProcesoPractica() != null) {
                                // Si son documentos antiguos que ya tienen asignación pero no proceso,
                                // los actualizamos con el proceso de su PROPIA asignación (no el proceso nuevo)
                                doc.setProcesoPractica(doc.getAsignacion().getProcesoPractica());
                                documentoRepository.save(doc);
                        }
                }

                // Notificación al Director de Carrera si existe
                Usuario directorCarrera = null;
                if (estudiante.getCarrera() != null) {
                        directorCarrera = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        estudiante.getCarrera().getId()).orElse(null);
                }

                if (directorCarrera != null) {
                        enviarNotificacion(directorCarrera, "Emisión de Carta de Asignación",
                                        "Emitir carta de asignación al estudiante "
                                                        + asignacion.getEstudiante().getNombres() + " "
                                                        + asignacion.getEstudiante().getApellidos(),
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                return mapToDetalleDto(asignacion);
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto emitirCartaAsignacion(Long asignacionId, String urlCartaFirmada) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                byte[] pdfBytes;
                String pdfUrl;
                boolean firmado;

                if (urlCartaFirmada != null && !urlCartaFirmada.isBlank()) {
                        pdfUrl = urlCartaFirmada;
                        firmado = true;
                        pdfBytes = obtenerBytesCarta(urlCartaFirmada, asignacionId);
                } else {
                        pdfBytes = generarPdfCartaAsignacion(asignacionId);
                        pdfUrl = archivoService.guardarArchivoBytes(pdfBytes,
                                        "Carta_Asignacion_" + asignacionId + ".pdf",
                                        TipoArchivoSubido.CARTAS_ASIGNACION);
                        firmado = false;
                }

                crearDocumento(asignacion.getEstudiante(), asignacion, TipoDocumento.CARTA_ASIGNACION,
                                "Carta_Asignacion.pdf", pdfUrl, firmado);

                asignacion.setCartaAsignacionEnviada(true);
                asignacion = asignacionPracticaRepository.save(asignacion);
                AsignacionPracticaDetalleDto detalleDto = mapToDetalleDto(asignacion);

                enviarNotificacion(asignacion.getEstudiante(), "Carta de Asignación Disponible",
                                "Tu carta ha sido emitida.",
                                TipoNotificacion.EXITO,
                                "/dashboard/practicas/mi-practica?highlight=doc_asignacion&asignacionId="
                                                + asignacion.getId());

                if (asignacion.getTutorAcademico() != null) {
                        enviarNotificacion(asignacion.getTutorAcademico(), "Nuevo estudiante asignado",
                                        "El estudiante " + asignacion.getEstudiante().getNombres() + " "
                                                        + asignacion.getEstudiante().getApellidos()
                                                        + " ha sido asignado a su cargo y su carta de asignación ha sido emitida.",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                try {
                        String nombreEstudiante = detalleDto.estudiante() != null
                                        ? detalleDto.estudiante().nombres() + " " + detalleDto.estudiante().apellidos()
                                        : "Estudiante";

                        String correoTutorInst = asignacion.getConvenio() != null
                                        ? asignacion.getConvenio().getCorreoTutor()
                                        : null;
                        if (correoTutorInst != null && !correoTutorInst.isEmpty()) {
                                Map<String, Object> variables = Map.of(
                                                "tutorInstitucional",
                                                detalleDto.tutorInstitucional() != null
                                                                ? detalleDto.tutorInstitucional()
                                                                : "Tutor Institucional",
                                                "nombreEstudiante", nombreEstudiante);

                                correoService.enviarCorreoHtmlConAdjunto(correoTutorInst,
                                                "Carta de Asignación - Prácticas Preprofesionales",
                                                "email/carta-asignacion", variables, pdfBytes,
                                                nombreEstudiante + " - Carta de Asignacion.pdf");
                        }
                } catch (Exception e) {
                        log.error("Error al generar o enviar la carta de asignación por correo: {}", e.getMessage(), e);
                }

                return detalleDto;
        }

        private byte[] obtenerBytesCarta(String urlCartaFirmada, Long asignacionId) {
                if (urlCartaFirmada != null && urlCartaFirmada.contains("/archivos_subidos/")) {
                        try {
                                String rutaRelativa = urlCartaFirmada
                                                .substring(urlCartaFirmada.indexOf("/archivos_subidos/")
                                                                + "/archivos_subidos/".length());
                                Path carpetaBase = Paths.get(System.getProperty("user.dir"),
                                                rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento
                                                                : "archivos_subidos");
                                Path filePath = carpetaBase.resolve(rutaRelativa);
                                if (!Files.exists(filePath) && !rutaRelativa.contains("/")) {
                                        Path posible = carpetaBase.resolve("cartas_asignacion")
                                                        .resolve(rutaRelativa);
                                        if (Files.exists(posible)) {
                                                filePath = posible;
                                        }
                                }
                                return Files.readAllBytes(filePath);
                        } catch (Exception e) {
                                log.error("Error al leer el archivo firmado: {}", e.getMessage());
                        }
                }
                return generarPdfCartaAsignacion(asignacionId);
        }

        @Override
        @Transactional(readOnly = true)
        public void reenviarCartaAsignacion(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);

                String correoTutorInst = asignacion.getConvenio() != null ? asignacion.getConvenio().getCorreoTutor()
                                : null;
                if (correoTutorInst == null || correoTutorInst.trim().isEmpty()) {
                        throw new NegocioException(
                                        "No se puede reenviar la carta: el convenio no tiene un correo de tutor institucional registrado.");
                }

                DocumentoPortafolio documento = documentoRepository
                                .findByAsignacionIdAndTipo(asignacionId, TipoDocumento.CARTA_ASIGNACION)
                                .orElse(null);

                byte[] pdfBytes;
                try {
                        if (documento != null && documento.getUrl() != null) {
                                String rutaLimpia = documento.getUrl().trim();
                                if (rutaLimpia.startsWith("/")) {
                                        rutaLimpia = rutaLimpia.substring(1);
                                }
                                if (rutaLimpia.startsWith("archivos_subidos/")) {
                                        rutaLimpia = rutaLimpia.substring("archivos_subidos/".length());
                                }

                                Path carpetaBase = Paths.get(System.getProperty("user.dir"),
                                                rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos");
                                Path filePath = carpetaBase.resolve(rutaLimpia);

                                if (!Files.exists(filePath)) {
                                        Path posible = carpetaBase.resolve("cartas_asignacion")
                                                        .resolve(Paths.get(rutaLimpia).getFileName());
                                        if (Files.exists(posible)) {
                                                filePath = posible;
                                        } else {
                                                throw new RecursoNoEncontradoException(
                                                                "El archivo físico no existe en: " + filePath);
                                        }
                                }
                                pdfBytes = Files.readAllBytes(filePath);
                        } else {
                                pdfBytes = generarPdfCartaAsignacion(asignacionId);
                        }
                } catch (Exception e) {
                        log.error("Error al leer el archivo firmado desde el disco: {}. Generando PDF de respaldo...",
                                        e.getMessage());
                        pdfBytes = generarPdfCartaAsignacion(asignacionId);
                }

                String nombreEstudiante = asignacion.getEstudiante() != null
                                ? asignacion.getEstudiante().getNombres() + " "
                                                + asignacion.getEstudiante().getApellidos()
                                : "Estudiante";

                String tutorInstitucional = asignacion.getConvenio() != null
                                && asignacion.getConvenio().getTutorInstitucional() != null
                                                ? asignacion.getConvenio().getTutorInstitucional()
                                                : "Tutor Institucional";

                Map<String, Object> variables = Map.of(
                                "tutorInstitucional", tutorInstitucional,
                                "nombreEstudiante", nombreEstudiante);

                String nombreAdjunto = (documento != null && documento.getNombre() != null)
                                ? documento.getNombre()
                                : "Carta_Asignacion_" + nombreEstudiante.replace(" ", "_") + ".pdf";

                correoService.enviarCorreoHtmlConAdjunto(correoTutorInst,
                                "Carta de Asignación - Prácticas Preprofesionales",
                                "email/carta-asignacion", variables, pdfBytes,
                                nombreAdjunto);
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto iniciarDesarrolloPracticas(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                if (!Boolean.TRUE.equals(asignacion.getCartaAsignacionEnviada())) {
                        throw new NegocioException(
                                        "No se puede iniciar el desarrollo: la Carta de Asignación aún no ha sido emitida por el Coordinador de Prácticas.");
                }
                asignacion.setFase(FaseActualPractica.DESARROLLO);
                asignacion.setReunionRealizada(true);

                enviarNotificacion(asignacion.getEstudiante(), "Inicio de Prácticas Confirmado",
                                "Tu tutor ha confirmado el inicio.",
                                TipoNotificacion.EXITO,
                                "/dashboard/practicas/mi-practica?asignacionId=" + asignacion.getId());

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto avanzarHoras(Long asignacionId, Integer horas) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                int nuevasHoras = Math.min(asignacion.getHorasCompletadas() + horas, asignacion.getHorasAsignadas());
                asignacion.setHorasCompletadas(nuevasHoras);

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto firmarRegistroDesarrollo(Long asignacionId, String urlInforme,
                        String urlCertificado, String urlSeguimiento, LocalDate fechaFin) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                LocalDate fechaInicio = asignacion.getFechaInicio();
                if (fechaFin != null && fechaInicio != null && fechaFin.isBefore(fechaInicio)) {
                        throw new IllegalArgumentException(
                                        "La fecha de fin no puede ser menor a la fecha de inicio de la práctica ("
                                                        + fechaInicio + ").");
                }

                asignacion.setFase(FaseActualPractica.FINALIZACION);
                asignacion.setHorasCompletadas(
                                asignacion.getHorasAsignadas() != null ? asignacion.getHorasAsignadas() : 240);
                if (fechaFin != null) {
                        asignacion.setFechaFin(fechaFin);
                }
                crearDocumento(asignacion.getEstudiante(), asignacion, TipoDocumento.INFORME_FINAL,
                                "Informe_Final.pdf", urlInforme, true);
                crearDocumento(asignacion.getEstudiante(), asignacion, TipoDocumento.CERTIFICADO_CUMPLIMIENTO,
                                "Certificado_Cumplimiento.pdf", urlCertificado, true);
                crearDocumento(asignacion.getEstudiante(), asignacion, TipoDocumento.SEGUIMIENTO_TA,
                                "Monitoreo_Seguimiento.pdf", urlSeguimiento, true);

                Usuario cpp = null;
                if (asignacion.getEstudiante().getCarrera() != null) {
                        cpp = usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (cpp != null) {
                        String nombreCompleto = asignacion.getEstudiante().getNombres() + " "
                                        + asignacion.getEstudiante().getApellidos();
                        enviarNotificacion(cpp, "Validación de Documentos Pendiente",
                                        "El estudiante " + nombreCompleto
                                                        + " completó sus prácticas. Revisar documentación de cierre.",
                                        TipoNotificacion.ADVERTENCIA,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto validarCpp(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                asignacion.setValidadoCpp(true);

                Usuario subdecano = usuarioRepository.findAll().stream()
                                .filter(u -> u.getRol() == RolUsuario.SUBDECANO)
                                .findFirst().orElse(null);
                if (subdecano != null) {
                        String nombreCompleto = asignacion.getEstudiante().getNombres() + " "
                                        + asignacion.getEstudiante().getApellidos();
                        enviarNotificacion(subdecano, "Aval de Cumplimiento Pendiente",
                                        "El estudiante " + nombreCompleto + " requiere Aval de Cumplimiento.",
                                        TipoNotificacion.ADVERTENCIA,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto generarAval(Long asignacionId, String urlAvalFirmado) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                if (!Boolean.TRUE.equals(asignacion.getValidadoCpp())) {
                        throw new NegocioException("No se puede generar el Aval de Cumplimiento sin la validacion previa del Coordinador de Practicas.");
                }

                if (asignacion.getEstado() == EstadoAsignacion.APROBADO
                                || documentoRepository.existsByAsignacionIdAndTipo(asignacionId, TipoDocumento.AVAL)) {
                        throw new NegocioException("El Aval de Cumplimiento ya ha sido generado para esta asignación.");
                }

                asignacion.setEstado(EstadoAsignacion.APROBADO);
                if (asignacion.getFechaFin() == null) {
                        asignacion.setFechaFin(LocalDate.now());
                }

                ProcesoPractica proceso = asignacion.getProcesoPractica();
                if (proceso != null) {
                        proceso.setHorasAcumuladas(
                                        (proceso.getHorasAcumuladas() != null ? proceso.getHorasAcumuladas() : 0)
                                                        + (asignacion.getHorasCompletadas() != null
                                                                        ? asignacion.getHorasCompletadas()
                                                                        : asignacion.getHorasAsignadas()));
                        if (proceso.getHorasAcumuladas() >= proceso.getHorasRequeridas()) {
                                proceso.setEstado(EstadoProceso.COMPLETADO);
                                if (asignacion.getEstudiante() != null) {
                                        boolean vinculacionCulminada = procesoVinculacionRepository
                                                        .findByEstudianteId(asignacion.getEstudiante().getId())
                                                        .map(pv -> pv.getEstado() == EstadoProcesoVcs.COMPLETADO ||
                                                                        (pv.getHorasAcumuladas() != null
                                                                                        && pv.getHorasAcumuladas() >= pv
                                                                                                        .getHorasRequeridas()))
                                                        .orElse(false);

                                        if (vinculacionCulminada) {
                                                asignacion.getEstudiante().setEstado(EstadoUsuario.INACTIVO);
                                                usuarioRepository.save(asignacion.getEstudiante());
                                        }
                                }
                        }
                        procesoPracticaRepository.save(proceso);
                }

                String pdfUrl;
                boolean firmado;
                if (urlAvalFirmado != null && !urlAvalFirmado.isBlank()) {
                        pdfUrl = urlAvalFirmado;
                        firmado = true;
                } else {
                        Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);


                        String subdecanoNombre = subdecano != null && subdecano.getNombreCompleto() != null && !subdecano.getNombreCompleto().isBlank() ? subdecano.getNombreCompleto() : "Subdecano FICA";
                        String subdecanoCedula = subdecano != null && subdecano.getIdentificacion() != null && !subdecano.getIdentificacion().isBlank() ? subdecano.getIdentificacion() : "1700000000";
                        String subdecanoTelefono = subdecano != null && subdecano.getTelefono() != null && !subdecano.getTelefono().isBlank() ? subdecano.getTelefono() : "0999999999";
                        String subdecanoCorreo = subdecano != null && subdecano.getCorreo() != null && !subdecano.getCorreo().isBlank() ? subdecano.getCorreo() : "subdecano@uce.edu.ec";

                        byte[] pdfBytes = generarPdfAval(asignacionId, subdecanoNombre, subdecanoCedula,
                                        subdecanoTelefono, subdecanoCorreo);
                        pdfUrl = archivoService.guardarArchivoBytes(pdfBytes,
                                        "Aval_Cumplimiento_" + asignacionId + ".pdf",
                                        TipoArchivoSubido.AVALES);
                        firmado = false;
                }

                crearDocumento(asignacion.getEstudiante(), asignacion, TipoDocumento.AVAL,
                                "Aval_Cumplimiento_Practica.pdf",
                                pdfUrl, firmado);

                enviarNotificacion(asignacion.getEstudiante(), "Aval de Cumplimiento Generado",
                                "Tu proceso de prácticas pre profesionales ha concluido exitosamente.",
                                TipoNotificacion.EXITO,
                                "/dashboard/practicas/mi-practica?asignacionId=" + asignacion.getId());

                if (asignacion.getTutorAcademico() != null) {
                        enviarNotificacion(asignacion.getTutorAcademico(), "Aval de Cumplimiento Firmado",
                                        "El estudiante " + asignacion.getEstudiante().getNombres()
                                                        + " ha finalizado el proceso de Prácticas Preprofesionales.",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                Usuario cpp = null;
                if (asignacion.getEstudiante().getCarrera() != null) {
                        cpp = usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (cpp != null) {
                        enviarNotificacion(cpp, "Aval de Cumplimiento Firmado",
                                        "El estudiante " + asignacion.getEstudiante().getNombres()
                                                        + " ha finalizado el proceso de Prácticas Preprofesionales.",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                Usuario dc = null;
                if (asignacion.getEstudiante().getCarrera() != null) {
                        dc = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (dc != null) {
                        enviarNotificacion(dc, "Aval de Cumplimiento Firmado",
                                        "El estudiante " + asignacion.getEstudiante().getNombres()
                                                        + " ha finalizado el proceso de Prácticas Preprofesionales.",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + asignacion.getEstudiante().getId()
                                                        + "&periodoId=" + asignacion.getPeriodoAcademico().getId());
                }

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto actualizarDatosCaces(Long asignacionId, String observacionesCaces) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                asignacion.setObservacionesCaces(observacionesCaces);

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto validarSiiu(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                asignacion.setValidadoSiiu(true);

                return mapToDetalleDto(asignacionPracticaRepository.save(asignacion));
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto reprobarAsignacion(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                if (asignacion.getEstado() != EstadoAsignacion.EN_CURSO) {
                        throw new NegocioException("Solo se pueden reprobar prácticas que se encuentren en curso");
                }

                asignacion.setEstado(EstadoAsignacion.REPROBADO);
                asignacion.setHorasCompletadas(0);
                AsignacionPractica guardada = asignacionPracticaRepository.save(asignacion);

                Usuario estudiante = asignacion.getEstudiante();
                if (estudiante != null) {
                        enviarNotificacion(
                                        estudiante,
                                        "Práctica Reprobada",
                                        "Tu práctica preprofesional ha sido reprobada por el Tutor Académico. Las horas completadas se han registrado en 0.",
                                        TipoNotificacion.ADVERTENCIA,
                                        "/dashboard/practicas/mi-practica"
                        );
                }

                Usuario dc = null;
                if (asignacion.getEstudiante() != null && asignacion.getEstudiante().getCarrera() != null) {
                        dc = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (dc != null) {
                        enviarNotificacion(
                                        dc,
                                        "Práctica de Estudiante Reprobada",
                                        "El Tutor Académico ha reprobado la práctica del estudiante "
                                                        + (estudiante != null ? estudiante.getNombreCompleto() : "") + ".",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes"
                        );
                }

                return mapToDetalleDto(guardada);
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto cancelarAsignacion(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);

                if (asignacion.getEstado() == EstadoAsignacion.APROBADO) {
                        throw new NegocioException("No se puede cancelar una práctica cuyas horas ya fueron aprobadas");
                }
                if (asignacion.getEstado() == EstadoAsignacion.CANCELADO) {
                        throw new NegocioException("La práctica ya se encuentra cancelada");
                }

                asignacion.setEstado(EstadoAsignacion.CANCELADO);
                asignacion.setHorasCompletadas(0);
                AsignacionPractica guardada = asignacionPracticaRepository.save(asignacion);

                Usuario estudiante = asignacion.getEstudiante();
                if (estudiante != null) {
                        enviarNotificacion(
                                        estudiante,
                                        "Práctica Cancelada",
                                        "Tu práctica preprofesional ha sido cancelada por la Coordinación de Prácticas Preprofesionales.",
                                        TipoNotificacion.ADVERTENCIA,
                                        "/dashboard/practicas/mi-practica"
                        );
                }

                Usuario tutor = asignacion.getTutorAcademico();
                if (tutor != null) {
                        enviarNotificacion(
                                        tutor,
                                        "Práctica de Estudiante Cancelada",
                                        "La práctica del estudiante " + (estudiante != null ? estudiante.getNombreCompleto() : "") + " ha sido cancelada.",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes"
                        );
                }

                Usuario directorCarrera = null;
                if (asignacion.getEstudiante() != null && asignacion.getEstudiante().getCarrera() != null) {
                        directorCarrera = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (directorCarrera != null) {
                        enviarNotificacion(
                                        directorCarrera,
                                        "Práctica de Estudiante Cancelada",
                                        "El Coordinador de Prácticas ha cancelado la práctica del estudiante "
                                                        + (estudiante != null ? estudiante.getNombreCompleto() : "") + ".",
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes"
                        );
                }

                return mapToDetalleDto(guardada);
        }

        @Override
        @Transactional
        public void eliminarAsignacion(Long asignacionId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                if (documentoRepository.existsByAsignacionIdAndTipo(asignacionId, TipoDocumento.CARTA_ASIGNACION)) {
                        throw new IllegalStateException(
                                        "No se puede eliminar la asignación porque ya se ha emitido la carta de asignación.");
                }

                // Esto activará el @SQLDelete
                asignacionPracticaRepository.delete(asignacion);

                Usuario directorCarrera = null;
                if (asignacion.getEstudiante() != null && asignacion.getEstudiante().getCarrera() != null) {
                        directorCarrera = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        asignacion.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (directorCarrera != null) {
                        enviarNotificacion(directorCarrera, "Asignación Eliminada",
                                        "El Coordinador de Prácticas ha eliminado la asignación del estudiante "
                                                        + asignacion.getEstudiante().getNombres() + " "
                                                        + asignacion.getEstudiante().getApellidos(),
                                        TipoNotificacion.ADVERTENCIA,
                                        "/dashboard/practicas/estudiantes");
                }
                // Comprobar si el proceso debe ser eliminado (si ya no tiene asignaciones)
                // Un borrado lógico en la asignación no elimina automáticamente el proceso,
                // pero podríamos querer limpiarlo o dejarlo así.
        }

        @Override
        @Transactional
        public AsignacionPracticaDetalleDto actualizarAsignacion(Long asignacionId, Long convenioId, Long tutorId,
                        Integer horas, Long periodoAcademicoId) {
                AsignacionPractica asignacion = buscarEntidadPorId(asignacionId);
                validarPeriodoActivoDeAsignacion(asignacion);
                if (documentoRepository.existsByAsignacionIdAndTipo(asignacionId, TipoDocumento.CARTA_ASIGNACION)) {
                        throw new IllegalStateException(
                                        "No se puede actualizar la asignación porque ya se ha emitido la carta de asignación.");
                }

                if (convenioId != null
                                && (asignacion.getConvenio() == null
                                                || !asignacion.getConvenio().getId().equals(convenioId))) {
                        Convenio convenio = convenioRepository.findById(convenioId)
                                        .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado"));
                        asignacion.setConvenio(convenio);
                }

                if (tutorId != null && (asignacion.getTutorAcademico() == null
                                || !asignacion.getTutorAcademico().getId().equals(tutorId))) {
                        Usuario tutor = usuarioRepository.findById(tutorId)
                                        .orElseThrow(() -> new RecursoNoEncontradoException("Tutor no encontrado"));
                        asignacion.setTutorAcademico(tutor);
                }

                // El periodo académico no puede ser actualizado una vez creada la asignación

                if (horas != null) {
                        if (horas <= 0) {
                                throw new NegocioException("Las horas asignadas deben ser mayores a 0.");
                        }
                        if (asignacion.getHorasCompletadas() != null && horas < asignacion.getHorasCompletadas()) {
                                throw new NegocioException(
                                                "Las horas asignadas no pueden ser menores a las horas ya completadas ("
                                                                + asignacion.getHorasCompletadas() + "h).");
                        }
                        Integer maxHorasPermitidas = 240;
                        if (asignacion.getProcesoPractica() != null
                                        && asignacion.getProcesoPractica().getHorasRequeridas() != null) {
                                maxHorasPermitidas = asignacion.getProcesoPractica().getHorasRequeridas();
                        } else if (asignacion.getEstudiante() != null
                                        && asignacion.getEstudiante().getCarrera() != null
                                        && asignacion.getEstudiante().getCarrera().getHorasPractica() != null) {
                                maxHorasPermitidas = asignacion.getEstudiante().getCarrera().getHorasPractica();
                        }
                        int horasAcumuladasActuales = (asignacion.getProcesoPractica() != null
                                        && asignacion.getProcesoPractica().getHorasAcumuladas() != null)
                                                        ? asignacion.getProcesoPractica().getHorasAcumuladas()
                                                        : 0;
                        int maxHorasRestantes = Math.max(1, maxHorasPermitidas - horasAcumuladasActuales);
                        if (horas > maxHorasRestantes) {
                                throw new NegocioException("Las horas asignadas (" + horas
                                                + "h) exceden el límite máximo restante permitido para el estudiante ("
                                                + maxHorasRestantes + "h).");
                        }
                        asignacion.setHorasAsignadas(horas);
                }

                AsignacionPractica guardada = asignacionPracticaRepository.save(asignacion);

                Usuario directorCarrera = null;
                if (guardada.getEstudiante() != null && guardada.getEstudiante().getCarrera() != null) {
                        directorCarrera = usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA,
                                        guardada.getEstudiante().getCarrera().getId()).orElse(null);
                }
                if (directorCarrera != null) {
                        enviarNotificacion(directorCarrera, "Asignación Actualizada",
                                        "El Coordinador de Prácticas ha actualizado la asignación del estudiante "
                                                        + guardada.getEstudiante().getNombres() + " "
                                                        + guardada.getEstudiante().getApellidos(),
                                        TipoNotificacion.INFORMACION,
                                        "/dashboard/practicas/estudiantes?openEstudiante="
                                                        + guardada.getEstudiante().getId()
                                                        + "&periodoId=" + guardada.getPeriodoAcademico().getId());
                }

                return mapToDetalleDto(guardada);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<AsignacionPracticaDto> buscarTodas(Pageable pageable) {
                return asignacionPracticaRepository.findAll(pageable)
                                .map(this::mapToDto);
        }

        @Override
        @Transactional(readOnly = true)
        public AsignacionPracticaDto buscarPorId(Long id) {
                AsignacionPractica asignacion = buscarEntidadPorId(id);
                return mapToDto(asignacion);
        }

        private AsignacionPractica buscarEntidadPorId(Long id) {
                return asignacionPracticaRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada: " + id));
        }

        private void validarPeriodoActivo(Long periodoAcademicoId) {
                PeriodoAcademico periodo = periodoAcademicoRepository.findById(periodoAcademicoId)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Periodo académico no encontrado"));
                if (periodo.getEstado() == EstadoPeriodo.INACTIVO) {
                        throw new IllegalStateException(
                                        "El periodo académico está inactivo. No se pueden realizar modificaciones (Solo lectura).");
                }
        }

        private void validarPeriodoActivoDeAsignacion(AsignacionPractica asignacion) {
                if (asignacion.getPeriodoAcademico() != null
                                && asignacion.getPeriodoAcademico().getEstado() == EstadoPeriodo.INACTIVO) {
                        throw new IllegalStateException(
                                        "El periodo académico de esta asignación está inactivo. No se pueden realizar modificaciones (Solo lectura).");
                }
        }

        private void crearDocumento(Usuario estudiante, AsignacionPractica asignacion, TipoDocumento tipo,
                        String nombre,
                        String url, boolean firmado) {
                String nombreCompletoEstudiante = estudiante.getNombres() + " " + estudiante.getApellidos();
                String nuevoNombre = nombreCompletoEstudiante + " - " + nombre;

                DocumentoPortafolio doc = (asignacion != null && asignacion.getId() != null)
                                ? documentoRepository.findByAsignacionIdAndTipo(asignacion.getId(), tipo)
                                                .orElse(new DocumentoPortafolio())
                                : new DocumentoPortafolio();
                doc.setEstudiante(estudiante);
                doc.setAsignacion(asignacion);
                if (asignacion != null) {
                        doc.setProcesoPractica(asignacion.getProcesoPractica());
                }
                doc.setTipo(tipo);
                doc.setNombre(nuevoNombre);
                doc.setUrl(url);
                doc.setFirmado(firmado);
                if (tipo == TipoDocumento.AVAL || tipo == TipoDocumento.CARTA_ASIGNACION) {
                        doc.setEstado(EstadoDocumento.APROBADO);
                }
                documentoRepository.save(doc);
        }

        private void enviarNotificacion(Usuario usuario, String titulo, String mensaje, TipoNotificacion tipo,
                        String accionUrl) {
                notificacionService.enviar(usuario, titulo, mensaje, tipo, accionUrl);
        }

        private AsignacionPracticaDto mapToDto(AsignacionPractica a) {
                return asignacionPracticaMapeador.aDto(a);
        }

        private AsignacionPracticaDetalleDto mapToDetalleDto(AsignacionPractica a) {
                Boolean puedeEditar = !documentoRepository.existsByAsignacionIdAndTipo(a.getId(),
                                TipoDocumento.CARTA_ASIGNACION);
                return asignacionPracticaMapeador.aDetalleDto(a, puedeEditar);
        }

        @Override
        @Transactional(readOnly = true)
        public byte[] generarPdfCartaAsignacion(Long asignacionId) {
                AsignacionPracticaDetalleDto asignacion = buscarDetallePorId(asignacionId);
                return cartaAsignacionPdfExportador.exportar(asignacion);
        }

        @Override
        @Transactional(readOnly = true)
        public byte[] generarPdfAval(Long asignacionId, String subdecanoNombre, String subdecanoCedula,
                        String subdecanoTelefono, String subdecanoCorreo) {
                AsignacionPracticaDetalleDto asignacion = buscarDetallePorId(asignacionId);
                if (!Boolean.TRUE.equals(asignacion.validadoCpp())) {
                        throw new NegocioException("No se puede generar la vista previa del Aval: el portafolio no ha sido validado por el Coordinador de Practicas.");
                }

                boolean nombreVacio = subdecanoNombre == null || subdecanoNombre.isBlank()
                                || "Subdecano FICA".equalsIgnoreCase(subdecanoNombre.trim())
                                || "Subdecano(a) FICA".equalsIgnoreCase(subdecanoNombre.trim());
                boolean cedulaVacia = subdecanoCedula == null || subdecanoCedula.isBlank()
                                || "1700000000".equals(subdecanoCedula.trim());
                boolean telefonoVacio = subdecanoTelefono == null || subdecanoTelefono.isBlank()
                                || "0999999999".equals(subdecanoTelefono.trim());
                boolean correoVacio = subdecanoCorreo == null || subdecanoCorreo.isBlank()
                                || "subdecano@uce.edu.ec".equalsIgnoreCase(subdecanoCorreo.trim());

                if (nombreVacio || cedulaVacia || telefonoVacio || correoVacio) {
                        Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);
                        if (subdecano != null) {
                                if (nombreVacio && subdecano.getNombreCompleto() != null && !subdecano.getNombreCompleto().isBlank()) {
                                        subdecanoNombre = subdecano.getNombreCompleto();
                                }
                                if (cedulaVacia && subdecano.getIdentificacion() != null && !subdecano.getIdentificacion().isBlank()) {
                                        subdecanoCedula = subdecano.getIdentificacion();
                                }
                                if (telefonoVacio && subdecano.getTelefono() != null && !subdecano.getTelefono().isBlank()) {
                                        subdecanoTelefono = subdecano.getTelefono();
                                }
                                if (correoVacio && subdecano.getCorreo() != null && !subdecano.getCorreo().isBlank()) {
                                        subdecanoCorreo = subdecano.getCorreo();
                                }
                        }
                }
                return avalCumplimientoPdfExportador.exportar(asignacion, subdecanoNombre, subdecanoCedula,
                                subdecanoTelefono,
                                subdecanoCorreo);
        }
}
