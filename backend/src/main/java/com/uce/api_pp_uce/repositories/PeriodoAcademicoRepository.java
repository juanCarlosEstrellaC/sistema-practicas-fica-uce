package com.uce.api_pp_uce.repositories;

import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    Optional<PeriodoAcademico> findByNombre(String nombre);
    List<PeriodoAcademico> findByEstado(EstadoPeriodo estado);

    @Query("SELECT p FROM PeriodoAcademico p WHERE (CAST(:search AS string) IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND (CAST(:estado AS string) IS NULL OR p.estado = :estado)")
    Page<PeriodoAcademico> buscarConFiltros(@Param("search") String search, @Param("estado") EstadoPeriodo estado, Pageable pageable);
}
