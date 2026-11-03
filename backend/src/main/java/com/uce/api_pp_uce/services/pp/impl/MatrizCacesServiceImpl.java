package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.MatrizCacesRepository;
import com.uce.api_pp_uce.services.ArchivoService;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.MatrizCacesService;
import org.springframework.core.io.Resource;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import com.uce.api_pp_uce.exportadores.pp.MatrizCacesExcelExportador;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.uce.api_pp_uce.mapeadores.pp.MatrizCacesMapeador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class MatrizCacesServiceImpl implements MatrizCacesService {

    private final MatrizCacesRepository matrizCacesRepository;
    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final EntityManager entityManager;
    private final MatrizCacesMapeador matrizCacesMapeador;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final MatrizCacesExcelExportador matrizCacesExcelExportador;
    private final ArchivoService archivoService;

    @Override
    @Transactional(readOnly = true)
    public Page<MatrizCacesDto> listarPorCarrera(Integer carreraId, Pageable pageable) {
        return matrizCacesRepository.findByCarreraId(carreraId, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MatrizCacesDto> listarPorPeriodo(Long periodoId, EstadoMatrizCaces estado, String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return matrizCacesRepository.findByPeriodoAcademicoIdAndEstadoAndSearch(periodoId, estado, search.trim(), pageable).map(this::mapToDto);
        }
        if (estado == null) {
            return matrizCacesRepository.findByPeriodoAcademicoId(periodoId, pageable).map(this::mapToDto);
        }
        return matrizCacesRepository.findByPeriodoAcademicoIdAndEstado(periodoId, estado, pageable)
                .map(this::mapToDto);
    }

    @Override
    public MatrizCacesDto obtenerPorPeriodoYCarrera(Long periodoAcademicoId, Integer carreraId) {
        return matrizCacesRepository.findByPeriodoAcademicoIdAndCarreraId(periodoAcademicoId, carreraId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    public MatrizCacesDto crearOActualizar(Long periodoAcademicoId, Integer carreraId) {
        MatrizCaces matriz = matrizCacesRepository.findByPeriodoAcademicoIdAndCarreraId(periodoAcademicoId, carreraId)
                .orElseGet(() -> {
                    MatrizCaces m = new MatrizCaces();
                    m.setPeriodoAcademico(entityManager.getReference(PeriodoAcademico.class, periodoAcademicoId));
                    m.setCarrera(entityManager.getReference(Carrera.class, carreraId));
                    m.setEstado(EstadoMatrizCaces.PENDIENTE);
                    return m;
                });
        return mapToDto(matrizCacesRepository.save(matriz));
    }

    private String formatearEstado(EstadoMatrizCaces estado) {
        switch (estado) {
            case ENVIADA_A_DC:
                return "Enviada a Director de Carrera";
            case FIRMADA_POR_DC:
                return "Firmada por Director de Carrera";
            case ENVIADA_A_SUBDECANO:
                return "Enviada a Subdecano";
            case FIRMADA_POR_SUBDECANO:
                return "Firmada por Subdecano";
            case PENDIENTE:
                return "Pendiente / Con Observaciones";
            default:
                return estado.name();
        }
    }

    @Override
    public MatrizCacesDto cambiarEstado(Long id, EstadoMatrizCaces nuevoEstado, String observacion) {
        MatrizCaces matriz = matrizCacesRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Matriz CACES no encontrada con ID: " + id));
        if (matriz.getEstado() == EstadoMatrizCaces.FIRMADA_POR_SUBDECANO) {
            throw new NegocioException("La Matriz CACES ya ha sido oficializada y firmada por el Subdecanato; no se permiten modificaciones.");
        }
        if (nuevoEstado == EstadoMatrizCaces.PENDIENTE) {
            if (matriz.getEstado() != EstadoMatrizCaces.ENVIADA_A_DC) {
                throw new NegocioException("Solo se pueden registrar observaciones y devolver la matriz a pendiente desde el estado Enviada a Director de Carrera.");
            }
            matriz.setArchivoFirmadoUrl(null);
        }
        matriz.setEstado(nuevoEstado);
        matriz.setObservacion(observacion);
        MatrizCaces matrizGuardada = matrizCacesRepository.save(matriz);

        String estadoFormateado = formatearEstado(nuevoEstado);
        String obsFormateada = observacion != null
                ? observacion.replace("[SUBDECANO]", "").replace("[DIRECTOR_CARRERA]", "").trim()
                : "";

        if (nuevoEstado == EstadoMatrizCaces.ENVIADA_A_SUBDECANO) {
            Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);
            if (subdecano != null) {
                enviarNotificacion(subdecano, "Matriz CACES para Revisión",
                        "El Coordinador de Prácticas ha enviado la Matriz CACES para su revisión.",
                        TipoNotificacion.INFORMACION, "/dashboard/practicas/matriz-caces?periodoId=" + matrizGuardada.getPeriodoAcademico().getId());
            }
        } else if (nuevoEstado == EstadoMatrizCaces.ENVIADA_A_DC) {
            Usuario dc = matrizGuardada.getCarrera() != null 
                    ? usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA, matrizGuardada.getCarrera().getId()).orElse(null)
                    : null;
            if (dc != null) {
                enviarNotificacion(dc, "Matriz CACES para Revisión",
                        "El Coordinador de Prácticas ha enviado la Matriz CACES para su revisión.",
                        TipoNotificacion.INFORMACION, "/dashboard/practicas/matriz-caces?periodoId=" + matrizGuardada.getPeriodoAcademico().getId());
            }
        } else {
            Usuario cpp = matrizGuardada.getCarrera() != null 
                    ? usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS, matrizGuardada.getCarrera().getId()).orElse(null)
                    : null;

            if (cpp != null) {
                String msg = nuevoEstado == EstadoMatrizCaces.PENDIENTE
                        ? "La Matriz CACES tiene observaciones: " + obsFormateada
                        : "La Matriz CACES ahora se encuentra: " + estadoFormateado + ".";
                enviarNotificacion(cpp, "Estado de Matriz CACES", msg,
                        TipoNotificacion.INFORMACION,
                        "/dashboard/practicas/matriz-caces?periodoId=" + matrizGuardada.getPeriodoAcademico().getId());
            }
        }

        return mapToDto(matrizGuardada);
    }

    @Override
    @Transactional(readOnly = true)
    public MatrizCacesDto obtenerPorId(Long id) {
        return matrizCacesRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RecursoNoEncontradoException("Matriz CACES no encontrada con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarExcelMatrizCaces(Long id) {
        MatrizCaces matriz = matrizCacesRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Matriz CACES no encontrada con ID: " + id));

        // Si ya cuenta con un archivo oficial firmado en el ciclo jerárquico, se retorna dicho archivo
        // para preservar las firmas existentes y evitar regenerar una plantilla en blanco
        if (matriz.getArchivoFirmadoUrl() != null && !matriz.getArchivoFirmadoUrl().trim().isEmpty()) {
            try {
                Resource recurso = archivoService.cargarArchivo(matriz.getArchivoFirmadoUrl());
                if (recurso != null && recurso.exists() && recurso.isReadable()) {
                    return recurso.getContentAsByteArray();
                }
            } catch (Exception e) {
                // Si el archivo físico no puede ser leído, continuar a regenerar el consolidado
            }
        }

        List<AsignacionPractica> asignaciones = asignacionPracticaRepository
                .findByPeriodoAcademicoIdAndProcesoPracticaCarreraId(matriz.getPeriodoAcademico().getId(),
                        matriz.getCarrera().getId());

        asignaciones.sort((a1, a2) -> {
            String apellido1 = (a1.getEstudiante() != null && a1.getEstudiante().getApellidos() != null) 
                    ? a1.getEstudiante().getApellidos().toLowerCase() : "";
            String apellido2 = (a2.getEstudiante() != null && a2.getEstudiante().getApellidos() != null) 
                    ? a2.getEstudiante().getApellidos().toLowerCase() : "";
            return apellido1.compareTo(apellido2);
        });

        Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);

        return matrizCacesExcelExportador.exportar(matriz, asignaciones, subdecano);
    }

    @Override
    @Transactional
    public MatrizCacesDto subirArchivoFirmado(Long id, String url) {
        MatrizCaces matriz = matrizCacesRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Matriz CACES no encontrada con ID: " + id));
        if (matriz.getEstado() == EstadoMatrizCaces.FIRMADA_POR_SUBDECANO) {
            throw new NegocioException("La Matriz CACES ya ha sido oficializada y firmada por el Subdecanato; no se permiten modificaciones.");
        }
        matriz.setArchivoFirmadoUrl(url);
        MatrizCaces matrizGuardada = matrizCacesRepository.save(matriz);
        return mapToDto(matrizGuardada);
    }

    private MatrizCacesDto mapToDto(MatrizCaces matriz) {
        return matrizCacesMapeador.aDto(matriz);
    }

    private void enviarNotificacion(Usuario usuario, String titulo, String mensaje, TipoNotificacion tipo,
            String accionUrl) {
        notificacionService.enviar(usuario, titulo, mensaje, tipo, accionUrl);
    }
}
