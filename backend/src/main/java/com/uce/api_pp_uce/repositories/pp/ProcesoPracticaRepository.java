package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProcesoPracticaRepository extends JpaRepository<ProcesoPractica, Long> {
    Optional<ProcesoPractica> findByEstudianteIdAndCarreraId(Long estudianteId, Integer carreraId);
    Optional<ProcesoPractica> findByEstudianteId(Long estudianteId);
}
