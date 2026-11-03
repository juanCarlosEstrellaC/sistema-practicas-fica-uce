package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatrizCacesRepository extends JpaRepository<MatrizCaces, Long> {
    Optional<MatrizCaces> findByPeriodoAcademicoIdAndCarreraId(Long periodoAcademicoId, Integer carreraId);
    
    @EntityGraph(attributePaths = {"carrera", "periodoAcademico"})
    Page<MatrizCaces> findByCarreraId(Integer carreraId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"carrera", "periodoAcademico"})
    Page<MatrizCaces> findByPeriodoAcademicoId(Long periodoAcademicoId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"carrera", "periodoAcademico"})
    Page<MatrizCaces> findByPeriodoAcademicoIdAndEstado(Long periodoAcademicoId, EstadoMatrizCaces estado, Pageable pageable);

    @EntityGraph(attributePaths = {"carrera", "periodoAcademico"})
    @Query("SELECT m FROM MatrizCaces m JOIN m.carrera c WHERE m.periodoAcademico.id = :periodoAcademicoId AND (:estado IS NULL OR m.estado = :estado) AND (:search IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.codigoCarrera) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MatrizCaces> findByPeriodoAcademicoIdAndEstadoAndSearch(
            @Param("periodoAcademicoId") Long periodoAcademicoId, 
            @Param("estado") EstadoMatrizCaces estado, 
            @Param("search") String search, 
            Pageable pageable);
}
