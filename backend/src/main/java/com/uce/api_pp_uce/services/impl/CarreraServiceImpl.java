package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.dtos.CarreraDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.services.CarreraService;
import com.uce.api_pp_uce.excepciones.NegocioException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import com.uce.api_pp_uce.mapeadores.CarreraMapeador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarreraMapeador carreraMapeador;

    @Override
    @Transactional(readOnly = true)
    public Page<CarreraDto> obtenerTodas(Pageable pageable) {
        return carreraRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CarreraDto> buscarConFiltros(String search, Pageable pageable) {
        return carreraRepository.buscarConFiltros(search, pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public CarreraDto obtenerPorId(Integer id) {
        return carreraRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));
    }

    @Override
    @Transactional
    public CarreraDto crear(CarreraDto dto) {
        if (dto.horasPractica() != null && dto.horasPractica() <= 0) {
            throw new NegocioException("Las horas de prácticas deben ser mayores a cero.");
        }
        if (dto.horasProyectosComunitarios() != null && dto.horasProyectosComunitarios() <= 0) {
            throw new NegocioException("Las horas de proyectos comunitarios deben ser mayores a cero.");
        }
        if (dto.codigoCarrera() != null && !dto.codigoCarrera().isBlank()) {
            String codNorm = dto.codigoCarrera().trim();
            if (carreraRepository.findByCodigoCarrera(codNorm).isPresent()) {
                throw new NegocioException("El código de carrera ingresado ya se encuentra registrado.");
            }
        }

        Carrera carrera = carreraMapeador.aEntidad(dto);
        if (carrera.getHorasPractica() == null) {
            carrera.setHorasPractica(0);
        }
        if (carrera.getHorasProyectosComunitarios() == null) {
            carrera.setHorasProyectosComunitarios(160);
        }

        carrera = carreraRepository.save(carrera);
        sincronizarDirector(carrera, dto.directorId());
        sincronizarCoordinador(carrera, dto.coordinadorId());

        return mapToDto(carreraRepository.save(carrera));
    }

    @Override
    @Transactional
    public CarreraDto actualizar(Integer id, CarreraDto dto) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));
        
        if (dto.horasPractica() != null && dto.horasPractica() <= 0) {
            throw new NegocioException("Las horas de prácticas deben ser mayores a cero.");
        }
        if (dto.horasProyectosComunitarios() != null && dto.horasProyectosComunitarios() <= 0) {
            throw new NegocioException("Las horas de proyectos comunitarios deben ser mayores a cero.");
        }
        if (dto.codigoCarrera() != null && !dto.codigoCarrera().isBlank()) {
            String codNorm = dto.codigoCarrera().trim();
            carreraRepository.findByCodigoCarrera(codNorm)
                    .filter(existente -> !existente.getId().equals(id))
                    .ifPresent(existente -> {
                        throw new NegocioException("El código de carrera ingresado ya se encuentra registrado.");
                    });
        }

        carreraMapeador.actualizarEntidadDesdeDto(dto, carrera);
        if (carrera.getHorasPractica() == null) {
            carrera.setHorasPractica(0);
        }
        if (carrera.getHorasProyectosComunitarios() == null) {
            carrera.setHorasProyectosComunitarios(160);
        }

        sincronizarDirector(carrera, dto.directorId());
        sincronizarCoordinador(carrera, dto.coordinadorId());

        return mapToDto(carreraRepository.save(carrera));
    }

    private void sincronizarDirector(Carrera carrera, Long nuevoDirectorId) {
        Usuario directorAnterior = carrera.getDirector();
        if (directorAnterior != null && (nuevoDirectorId == null || !directorAnterior.getId().equals(nuevoDirectorId))) {
            degradarAutoridadATutor(directorAnterior);
            carrera.setDirector(null);
        }

        if (nuevoDirectorId != null) {
            Usuario nuevoDirector = usuarioRepository.findById(nuevoDirectorId).orElse(null);
            if (nuevoDirector != null) {
                carreraRepository.findByDirectorId(nuevoDirector.getId())
                        .filter(otra -> !otra.getId().equals(carrera.getId()))
                        .ifPresent(otra -> {
                            otra.setDirector(null);
                            carreraRepository.save(otra);
                        });
                carreraRepository.findByCoordinadorId(nuevoDirector.getId())
                        .ifPresent(otra -> {
                            otra.setCoordinador(null);
                            carreraRepository.save(otra);
                        });
                if (nuevoDirector.getRol() != RolUsuario.DIRECTOR_CARRERA) {
                    nuevoDirector.setRol(RolUsuario.DIRECTOR_CARRERA);
                    incrementarVersionToken(nuevoDirector);
                }
                nuevoDirector.setCarrera(carrera);
                usuarioRepository.save(nuevoDirector);
                carrera.setDirector(nuevoDirector);
            } else {
                carrera.setDirector(null);
            }
        } else {
            carrera.setDirector(null);
        }
    }

    private void sincronizarCoordinador(Carrera carrera, Long nuevoCoordinadorId) {
        Usuario coordinadorAnterior = carrera.getCoordinador();
        if (coordinadorAnterior != null && (nuevoCoordinadorId == null || !coordinadorAnterior.getId().equals(nuevoCoordinadorId))) {
            degradarAutoridadATutor(coordinadorAnterior);
            carrera.setCoordinador(null);
        }

        if (nuevoCoordinadorId != null) {
            Usuario nuevoCoordinador = usuarioRepository.findById(nuevoCoordinadorId).orElse(null);
            if (nuevoCoordinador != null) {
                carreraRepository.findByCoordinadorId(nuevoCoordinador.getId())
                        .filter(otra -> !otra.getId().equals(carrera.getId()))
                        .ifPresent(otra -> {
                            otra.setCoordinador(null);
                            carreraRepository.save(otra);
                        });
                carreraRepository.findByDirectorId(nuevoCoordinador.getId())
                        .ifPresent(otra -> {
                            otra.setDirector(null);
                            carreraRepository.save(otra);
                        });
                if (nuevoCoordinador.getRol() != RolUsuario.COORDINADOR_PRACTICAS) {
                    nuevoCoordinador.setRol(RolUsuario.COORDINADOR_PRACTICAS);
                    incrementarVersionToken(nuevoCoordinador);
                }
                nuevoCoordinador.setCarrera(carrera);
                usuarioRepository.save(nuevoCoordinador);
                carrera.setCoordinador(nuevoCoordinador);
            } else {
                carrera.setCoordinador(null);
            }
        } else {
            carrera.setCoordinador(null);
        }
    }

    private void degradarAutoridadATutor(Usuario autoridadAnterior) {
        if (autoridadAnterior.getRol() == RolUsuario.DIRECTOR_CARRERA || autoridadAnterior.getRol() == RolUsuario.COORDINADOR_PRACTICAS) {
            autoridadAnterior.setRol(RolUsuario.TUTOR_ACADEMICO);
            incrementarVersionToken(autoridadAnterior);
            usuarioRepository.save(autoridadAnterior);
        }
    }

    private void incrementarVersionToken(Usuario u) {
        u.setVersionToken(u.getVersionToken() != null ? u.getVersionToken() + 1L : 1L);
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));
        if (carrera.getDirector() != null) {
            degradarAutoridadATutor(carrera.getDirector());
            carrera.setDirector(null);
        }
        if (carrera.getCoordinador() != null) {
            degradarAutoridadATutor(carrera.getCoordinador());
            carrera.setCoordinador(null);
        }
        carreraRepository.delete(carrera);
    }

    private CarreraDto mapToDto(Carrera carrera) {
        return carreraMapeador.aDto(carrera);
    }
}
