package com.uce.api_pp_uce.repositories;

import com.uce.api_pp_uce.entities.Carrera;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CarreraRepository extends JpaRepository<Carrera, Integer> {
    Optional<Carrera> findByCodigoCarrera(String codigoCarrera);

    Optional<Carrera> findByDirectorId(Long directorId);

    Optional<Carrera> findByCoordinadorId(Long coordinadorId);

    @Query("SELECT c FROM Carrera c WHERE CAST(:search AS string) IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))")
    Page<Carrera> buscarConFiltros(@Param("search") String search, Pageable pageable);
}
