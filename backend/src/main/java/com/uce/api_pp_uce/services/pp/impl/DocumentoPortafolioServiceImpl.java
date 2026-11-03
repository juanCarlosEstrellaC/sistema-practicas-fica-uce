package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.enums.RolUsuario;

import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoRevisarDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoResubirDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoSubirDto;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.DocumentoPortafolioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.DocumentoPortafolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import com.uce.api_pp_uce.mapeadores.pp.DocumentoPortafolioMapeador;

@Service
@RequiredArgsConstructor
public class DocumentoPortafolioServiceImpl implements DocumentoPortafolioService {

    private final DocumentoPortafolioRepository documentoRepository;
    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final DocumentoPortafolioMapeador documentoPortafolioMapeador;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoPortafolioDto> buscarPorEstudiante(Long estudianteId) {
        return documentoRepository.findByEstudianteIdOrderByIdDesc(estudianteId).stream()
                .map(d -> mapearADto(d))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentoPortafolioDto> obtenerTodos(Pageable pageable) {
        return documentoRepository.findAll(pageable).map(d -> mapearADto(d));
    }

    @Override
    @Transactional
    public DocumentoPortafolioDto revisarDocumento(Long id, DocumentoRevisarDto dto) {
        DocumentoPortafolio doc = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Documento no encontrado"));

        doc.setEstado(dto.estado());
        doc.setObservacion(dto.observacion());

        doc = documentoRepository.save(doc);

        if (dto.estado() == EstadoDocumento.RECHAZADO) {
            Usuario destinatario = doc.getEstudiante();
            if (doc.getTipo() == TipoDocumento.INFORME_FINAL || doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO || doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA) {
                if (doc.getAsignacion() != null && doc.getAsignacion().getTutorAcademico() != null) {
                    destinatario = doc.getAsignacion().getTutorAcademico();
                }
            }

            String urlAccion = (destinatario.getRol() == RolUsuario.ESTUDIANTE) 
                    ? "/dashboard/practicas/mi-practica?highlight=" + doc.getId() 
                    : "/dashboard/practicas/estudiantes?openEstudiante=" + doc.getEstudiante().getId();

            notificacionService.enviar(
                    destinatario,
                    "Documento Rechazado",
                    "El documento " + doc.getNombre() + " ha sido rechazado. Observación: " + dto.observacion(),
                    TipoNotificacion.ADVERTENCIA,
                    urlAccion
            );
        } else if (dto.estado() == EstadoDocumento.APROBADO) {
            Usuario destinatario = doc.getEstudiante();
            if (doc.getTipo() == TipoDocumento.INFORME_FINAL || doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO || doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA) {
                if (doc.getAsignacion() != null && doc.getAsignacion().getTutorAcademico() != null) {
                    destinatario = doc.getAsignacion().getTutorAcademico();
                }
            }

            String urlAccion = (destinatario.getRol() == RolUsuario.ESTUDIANTE) 
                    ? "/dashboard/practicas/mi-practica?highlight=" + doc.getId() 
                    : "/dashboard/practicas/estudiantes?openEstudiante=" + doc.getEstudiante().getId();

            notificacionService.enviar(
                    destinatario,
                    "Documento Aprobado",
                    "El documento " + doc.getNombre() + " ha sido aprobado correctamente.",
                    TipoNotificacion.EXITO,
                    urlAccion
            );
        }

        return mapearADto(doc);
    }

    @Override
    @Transactional
    public DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto) {
        return resubirDocumento(id, dto, (Usuario) null);
    }

    @Override
    @Transactional
    public DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto, Long estudianteAutenticadoId) {
        DocumentoPortafolio doc = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Documento no encontrado"));

        Usuario estudiante = doc.getEstudiante();
        if (estudianteAutenticadoId != null && estudiante != null && !estudiante.getId().equals(estudianteAutenticadoId)) {
            throw new NegocioException("No tienes permiso para resubir documentos de otro estudiante");
        }

        return ejecutarResubida(doc, dto, estudiante);
    }

    @Override
    @Transactional
    public DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto, Usuario usuarioAutenticado) {
        DocumentoPortafolio doc = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Documento no encontrado"));

        Usuario estudiante = doc.getEstudiante();

        if (usuarioAutenticado != null) {
            RolUsuario rol = usuarioAutenticado.getRol();
            if (rol == RolUsuario.ESTUDIANTE) {
                if (estudiante != null && !estudiante.getId().equals(usuarioAutenticado.getId())) {
                    throw new NegocioException("No tienes permiso para resubir documentos de otro estudiante");
                }
                if (doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA
                        || doc.getTipo() == TipoDocumento.INFORME_FINAL
                        || doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO) {
                    throw new NegocioException("Este documento solo puede ser resubido por el Tutor Académico");
                }
            } else if (rol == RolUsuario.TUTOR_ACADEMICO) {
                boolean esDocumentoTutor = (doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA
                        || doc.getTipo() == TipoDocumento.INFORME_FINAL
                        || doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO);
                if (!esDocumentoTutor) {
                    throw new NegocioException("El Tutor Académico solo puede resubir documentos de seguimiento y cierre");
                }

                boolean esTutorAsignado = false;
                if (doc.getAsignacion() != null && doc.getAsignacion().getTutorAcademico() != null) {
                    esTutorAsignado = doc.getAsignacion().getTutorAcademico().getId().equals(usuarioAutenticado.getId());
                } else if (estudiante != null) {
                    esTutorAsignado = asignacionPracticaRepository.findByProcesoPracticaEstudianteId(estudiante.getId())
                            .stream()
                            .anyMatch(a -> a.getTutorAcademico() != null && a.getTutorAcademico().getId().equals(usuarioAutenticado.getId()));
                }
                if (!esTutorAsignado) {
                    throw new NegocioException("No tienes permiso para resubir documentos de un estudiante que no tienes asignado");
                }
            } else {
                throw new NegocioException("No tiene permisos para acceder a este recurso.");
            }
        }

        return ejecutarResubida(doc, dto, estudiante);
    }

    private DocumentoPortafolioDto ejecutarResubida(DocumentoPortafolio doc, DocumentoResubirDto dto, Usuario estudiante) {
        doc.setUrl(dto.url());
        doc.setNombre(generarNombreDocumento(estudiante, doc.getTipo(), dto.nombre()));
        doc.setEstado(EstadoDocumento.PENDIENTE_REVISION);
        doc.setObservacion(null);
        doc.setFechaSubida(LocalDateTime.now());
        documentoRepository.save(doc);

        // Notificar al CPP si el documento tenía observaciones
        if (estudiante != null && estudiante.getCarrera() != null && estudiante.getCarrera().getCoordinador() != null) {
            Usuario coordinador = usuarioRepository.findById(estudiante.getCarrera().getCoordinador().getId()).orElse(null);
            if (coordinador != null) {
                boolean subidoPorEstudiante = !(doc.getTipo() == TipoDocumento.INFORME_FINAL || 
                                                doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO || 
                                                doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA);
                
                String actorStr = "El estudiante " + estudiante.getNombres() + " " + estudiante.getApellidos();
                if (!subidoPorEstudiante) {
                    if (doc.getAsignacion() != null && doc.getAsignacion().getTutorAcademico() != null) {
                        Usuario ta = doc.getAsignacion().getTutorAcademico();
                        actorStr = "El tutor " + ta.getNombres() + " " + ta.getApellidos();
                    } else {
                        actorStr = "El Tutor Académico de " + estudiante.getNombres() + " " + estudiante.getApellidos();
                    }
                }

                notificacionService.enviar(
                        coordinador,
                        "Documento Resubido",
                        actorStr + " ha resubido el documento: " + doc.getNombre() + " que tenía observaciones.",
                        TipoNotificacion.INFORMACION,
                        "/dashboard/practicas/estudiantes?openEstudiante=" + estudiante.getId()
                );
            }
        }

        return mapearADto(doc);
    }

    @Override
    @Transactional
    public DocumentoPortafolioDto subirDocumentoPortafolio(DocumentoSubirDto dto) {
        Usuario estudiante = usuarioRepository.findById(dto.estudianteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Estudiante no encontrado"));

        DocumentoPortafolio doc = documentoRepository.findByEstudianteIdOrderByIdDesc(dto.estudianteId())
                .stream().filter(d -> d.getTipo() == dto.tipo()).findFirst().orElse(new DocumentoPortafolio());

        doc.setEstudiante(estudiante);
        doc.setTipo(dto.tipo());
        doc.setUrl(dto.url());
        doc.setNombre(generarNombreDocumento(estudiante, dto.tipo(), dto.nombre()));
        doc.setEstado(EstadoDocumento.PENDIENTE_REVISION);
        doc.setFirmado(false);

        doc = documentoRepository.save(doc);

        // Notificar al CPP
        if (estudiante.getCarrera() != null && estudiante.getCarrera().getCoordinador() != null) {
            Usuario coordinador = usuarioRepository.findById(estudiante.getCarrera().getCoordinador().getId()).orElse(null);
            if (coordinador != null) {
                boolean subidoPorEstudiante = !(doc.getTipo() == TipoDocumento.INFORME_FINAL || 
                                                doc.getTipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO || 
                                                doc.getTipo() == TipoDocumento.SEGUIMIENTO_TA);
                
                String actorStr = "El estudiante " + estudiante.getNombres() + " " + estudiante.getApellidos();
                if (!subidoPorEstudiante) {
                    actorStr = "El Tutor Académico del estudiante " + estudiante.getNombres() + " " + estudiante.getApellidos();
                }

                notificacionService.enviar(
                        coordinador,
                        "Documento Subido",
                        actorStr + " ha subido el documento: " + doc.getNombre() + " y requiere revisión.",
                        TipoNotificacion.INFORMACION,
                        "/dashboard/practicas/estudiantes?openEstudiante=" + estudiante.getId()
                );
            }
        }

        return mapearADto(doc);
    }

    private DocumentoPortafolioDto mapearADto(DocumentoPortafolio d) {
        return documentoPortafolioMapeador.aDto(d);
    }

    private String generarNombreDocumento(Usuario estudiante, TipoDocumento tipo, String nombreOriginal) {
        String nombreCompletoEstudiante = estudiante.getNombres() + " " + estudiante.getApellidos();
        String extension = nombreOriginal != null && nombreOriginal.contains(".")
                ? nombreOriginal.substring(nombreOriginal.lastIndexOf("."))
                : ".pdf";

        if (tipo == TipoDocumento.CV || tipo == TipoDocumento.DOCUMENTO_IDENTIDAD) {
            return nombreCompletoEstudiante + " - " + tipo.toString().toLowerCase() + extension;
        }
        return nombreCompletoEstudiante + " - " + nombreOriginal;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoPortafolioDto> ocultarUrlsNoValidadasParaEstudiante(List<DocumentoPortafolioDto> documentos) {
        if (documentos == null || documentos.isEmpty()) {
            return Collections.emptyList();
        }
        return documentos.stream().map(doc -> {
            boolean esDocTutoria = doc.tipo() == TipoDocumento.SEGUIMIENTO_TA
                    || doc.tipo() == TipoDocumento.INFORME_FINAL
                    || doc.tipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO;
            if (esDocTutoria) {
                boolean validadoCpp = false;
                if (doc.asignacionId() != null) {
                    validadoCpp = asignacionPracticaRepository.findById(doc.asignacionId())
                            .map(AsignacionPractica::getValidadoCpp)
                            .orElse(false);
                }
                return new DocumentoPortafolioDto(
                        doc.id(),
                        doc.estudianteId(),
                        doc.asignacionId(),
                        doc.tipo(),
                        doc.nombre(),
                        validadoCpp ? doc.url() : null,
                        doc.firmado(),
                        doc.estado(),
                        null,
                        doc.fechaSubida());
            }
            return doc;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoPortafolioDto> filtrarDocumentosPorRol(List<DocumentoPortafolioDto> documentos, RolUsuario rol) {
        if (documentos == null || documentos.isEmpty() || rol == null) {
            return documentos != null ? documentos : Collections.emptyList();
        }
        if (rol == RolUsuario.ESTUDIANTE) {
            return ocultarUrlsNoValidadasParaEstudiante(documentos);
        }
        if (rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.SUBDECANO) {
            return documentos.stream().map(doc -> {
                boolean esDocTutoria = doc.tipo() == TipoDocumento.SEGUIMIENTO_TA
                        || doc.tipo() == TipoDocumento.INFORME_FINAL
                        || doc.tipo() == TipoDocumento.CERTIFICADO_CUMPLIMIENTO;
                if (esDocTutoria && doc.observacion() != null) {
                    return new DocumentoPortafolioDto(
                            doc.id(),
                            doc.estudianteId(),
                            doc.asignacionId(),
                            doc.tipo(),
                            doc.nombre(),
                            doc.url(),
                            doc.firmado(),
                            doc.estado(),
                            null,
                            doc.fechaSubida());
                }
                return doc;
            }).collect(Collectors.toList());
        }
        return documentos;
    }
}
