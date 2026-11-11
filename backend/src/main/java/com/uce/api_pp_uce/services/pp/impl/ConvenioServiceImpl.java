package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.services.pp.ConvenioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.uce.api_pp_uce.mapeadores.pp.ConvenioMapeador;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConvenioServiceImpl implements ConvenioService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

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
        ConvenioDto dto = convenioMapeador.aDto(convenio, (int) ocupadosCount);
        if (convenio.getUrlDocumento() != null && !convenio.getUrlDocumento().isBlank() && convenio.getId() != null) {
            return new ConvenioDto(
                    dto.id(),
                    dto.institucion(),
                    dto.tipo(),
                    dto.campoEspecifico(),
                    dto.direccion(),
                    dto.fechaInicio(),
                    dto.fechaFin(),
                    dto.estado(),
                    dto.cuposDisponibles(),
                    dto.tutorInstitucional(),
                    dto.correoTutor(),
                    dto.telefonoTutor(),
                    "/convenios/" + convenio.getId() + "/preview",
                    dto.nombreDocumento(),
                    dto.ocupados()
            );
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ArchivoDescargaDto obtenerConvenioDescarga(Long id) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Convenio no encontrado con ID: " + id));

        if (convenio.getUrlDocumento() == null || convenio.getUrlDocumento().isBlank()) {
            throw new RecursoNoEncontradoException("El convenio no tiene un documento asociado");
        }

        String rutaLimpia = convenio.getUrlDocumento().trim();
        if (rutaLimpia.startsWith("/")) {
            rutaLimpia = rutaLimpia.substring(1);
        }
        if (rutaLimpia.startsWith("archivos_subidos/")) {
            rutaLimpia = rutaLimpia.substring("archivos_subidos/".length());
        }

        Path carpetaBase = Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos")
                .toAbsolutePath().normalize();
        if (!Files.exists(carpetaBase) && Files.exists(Paths.get("backend", rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos"))) {
            carpetaBase = Paths.get("backend", rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos").toAbsolutePath().normalize();
        }
        Path filePath = carpetaBase.resolve(rutaLimpia).normalize().toAbsolutePath();

        if (!filePath.startsWith(carpetaBase)) {
            throw new NegocioException("Acceso no permitido: ruta de archivo invalida");
        }

        if (!Files.exists(filePath)) {
            String nombreArchivoPlano = Paths.get(rutaLimpia).getFileName().toString();
            for (String sub : List.of("practicas/convenios", "convenios")) {
                Path posible = carpetaBase.resolve(sub).resolve(nombreArchivoPlano).normalize().toAbsolutePath();
                if (posible.startsWith(carpetaBase) && Files.exists(posible)) {
                    filePath = posible;
                    break;
                }
            }
            if (!Files.exists(filePath)) {
                throw new RecursoNoEncontradoException("El archivo físico del convenio no existe en el servidor: " + filePath.getFileName());
            }
        }

        byte[] contenido;
        try {
            contenido = Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo del convenio", e);
        }

        String nombreDescarga = convenio.getNombreDocumento() != null && !convenio.getNombreDocumento().isBlank()
                ? convenio.getNombreDocumento()
                : filePath.getFileName().toString();
        if (!nombreDescarga.toLowerCase().endsWith(".pdf")) {
            nombreDescarga += ".pdf";
        }

        return new ArchivoDescargaDto(contenido, nombreDescarga, "application/pdf");
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
