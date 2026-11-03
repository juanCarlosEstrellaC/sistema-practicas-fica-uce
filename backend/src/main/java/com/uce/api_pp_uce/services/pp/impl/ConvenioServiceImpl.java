package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.services.pp.ConvenioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.uce.api_pp_uce.mapeadores.pp.ConvenioMapeador;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConvenioServiceImpl implements ConvenioService {

    private final ConvenioRepository convenioRepository;
    private final AsignacionPracticaRepository asignacionPracticaRepository;
    private final ConvenioMapeador convenioMapeador;

    @Override
    @Transactional(readOnly = true)
    public Page<ConvenioDto> buscarTodos(Pageable pageable) {
        return convenioRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConvenioDto> buscarConFiltros(String search, EstadoConvenio estado, Pageable pageable) {
        return convenioRepository.buscarConFiltros(search, estado, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConvenioDto> buscarConveniosActivosYCuposDisponibles(Pageable pageable) {
        return convenioRepository.findByEstadoAndCuposDisponibles(EstadoConvenio.ACTIVO, 0, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ConvenioDto buscarPorId(Long id) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado con ID: " + id));
        return mapToDto(convenio);
    }

    @Override
    @Transactional
    public ConvenioDto crearConvenio(NuevoConvenioDto dto) {
        if (dto.fechaFin() != null && dto.fechaInicio() != null && !dto.fechaFin().isAfter(dto.fechaInicio())) {
            throw new IllegalArgumentException("La fecha de finalización debe ser estrictamente posterior a la fecha de inicio.");
        }

        Convenio convenio = convenioMapeador.aEntidad(dto);
        convenio.setEstado(EstadoConvenio.ACTIVO);

        Convenio guardado = convenioRepository.save(convenio);
        return mapToDto(guardado);
    }

    @Override
    @Transactional
    public ConvenioDto actualizarConvenio(Long id, NuevoConvenioDto dto) {
        if (dto.fechaFin() != null && dto.fechaInicio() != null && !dto.fechaFin().isAfter(dto.fechaInicio())) {
            throw new IllegalArgumentException("La fecha de finalización debe ser estrictamente posterior a la fecha de inicio.");
        }

        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado con ID: " + id));

        convenioMapeador.actualizarEntidadDesdeDto(dto, convenio);

        Convenio guardado = convenioRepository.save(convenio);
        return mapToDto(guardado);
    }

    @Override
    @Transactional
    public void eliminarConvenio(Long id) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado con ID: " + id));
        convenioRepository.delete(convenio);
    }

    private ConvenioDto mapToDto(Convenio convenio) {
        long ocupadosCount = asignacionPracticaRepository.countByConvenioIdAndEstado(convenio.getId(), EstadoAsignacion.EN_CURSO);
        return convenioMapeador.aDto(convenio, (int) ocupadosCount);
    }

    @Scheduled(cron = "0 0 0 * * ?") // Ejecuta todos los dias a la media noche
    @Transactional
    public void actualizarEstadosConvenios() {
        log.info("Iniciando tarea programada: actualización de estados de convenios...");
        List<Convenio> convenios = convenioRepository.findByEstadoIn(
                Arrays.asList(EstadoConvenio.ACTIVO, EstadoConvenio.POR_EXPIRAR));

        LocalDate hoy = LocalDate.now();
        int conveniosActualizados = 0;

        for (Convenio convenio : convenios) {
            if (convenio.getFechaFin() != null) {
                if (hoy.isAfter(convenio.getFechaFin()) || hoy.isEqual(convenio.getFechaFin())) {
                    convenio.setEstado(EstadoConvenio.EXPIRADO);
                    conveniosActualizados++;
                } else if (ChronoUnit.MONTHS.between(hoy, convenio.getFechaFin()) <= 6) {
                    convenio.setEstado(EstadoConvenio.POR_EXPIRAR);
                    conveniosActualizados++;
                }
            }
        }
        convenioRepository.saveAll(convenios);
        log.info("Tarea programada finalizada: {} convenios evaluados, {} estados actualizados.", convenios.size(), conveniosActualizados);
    }
}
