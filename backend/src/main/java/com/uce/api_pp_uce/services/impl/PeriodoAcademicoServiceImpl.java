package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.dtos.PeriodoAcademicoDto;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.MatrizCacesRepository;
import com.uce.api_pp_uce.mapeadores.PeriodoAcademicoMapeador;
import com.uce.api_pp_uce.services.PeriodoAcademicoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class PeriodoAcademicoServiceImpl implements PeriodoAcademicoService {

    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CarreraRepository carreraRepository;
    private final MatrizCacesRepository matrizCacesRepository;
    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final PeriodoAcademicoMapeador periodoAcademicoMapeador;

    @Override
    @Transactional(readOnly = true)
    public Page<PeriodoAcademicoDto> buscarTodos(Pageable pageable) {
        return periodoAcademicoRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PeriodoAcademicoDto> buscarConFiltros(String busqueda, EstadoPeriodo estado, Pageable pageable) {
        return periodoAcademicoRepository.buscarConFiltros(busqueda, estado, pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public PeriodoAcademicoDto buscarPorId(Long id) {
        return periodoAcademicoRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Periodo Académico no encontrado"));
    }

    private void desactivarPeriodo(PeriodoAcademico periodo) {
        periodo.setEstado(EstadoPeriodo.INACTIVO);
        List<AsignacionPractica> asignaciones = asignacionPracticaRepository.findByPeriodoAcademicoIdAndEstadoNot(periodo.getId(), EstadoAsignacion.APROBADO);
        for (AsignacionPractica asignacion : asignaciones) {
            asignacion.setEstado(EstadoAsignacion.CANCELADO);
        }
        asignacionPracticaRepository.saveAll(asignaciones);
    }

    @Override
    @Transactional
    public PeriodoAcademicoDto crear(PeriodoAcademicoDto dto) {
        // Desactivar todos los periodos activos existentes
        List<PeriodoAcademico> activos = periodoAcademicoRepository.findByEstado(EstadoPeriodo.ACTIVO);
        for (PeriodoAcademico activo : activos) {
            desactivarPeriodo(activo);
        }
        periodoAcademicoRepository.saveAll(activos);

        PeriodoAcademico p = periodoAcademicoMapeador.aEntidad(dto);
        if (p.getEstado() == null) {
            p.setEstado(EstadoPeriodo.ACTIVO);
        }
        PeriodoAcademico savedPeriodo = periodoAcademicoRepository.save(p);

        List<Carrera> carreras = carreraRepository.findAll();
        for (Carrera carrera : carreras) {
            MatrizCaces matriz = new MatrizCaces();
            matriz.setPeriodoAcademico(savedPeriodo);
            matriz.setCarrera(carrera);
            matriz.setEstado(EstadoMatrizCaces.PENDIENTE);
            matrizCacesRepository.save(matriz);
        }

        return mapToDto(savedPeriodo);
    }

    @Override
    @Transactional
    public PeriodoAcademicoDto actualizar(Long id, PeriodoAcademicoDto dto) {
        PeriodoAcademico p = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Periodo Académico no encontrado"));
        EstadoPeriodo estadoAnterior = p.getEstado();
        periodoAcademicoMapeador.actualizarEntidadDesdeDto(dto, p);
        if (dto.estado() != null && dto.estado() != estadoAnterior) {
            if (dto.estado() == EstadoPeriodo.INACTIVO) {
                desactivarPeriodo(p);
            } else {
                p.setEstado(dto.estado());
            }
        }
        return mapToDto(periodoAcademicoRepository.save(p));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        PeriodoAcademico p = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Periodo Académico no encontrado"));
        periodoAcademicoRepository.delete(p);
    }

    private PeriodoAcademicoDto mapToDto(PeriodoAcademico p) {
        return periodoAcademicoMapeador.aDto(p);
    }
}
