package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConvenioRepository extends JpaRepository<Convenio, Long> {

    @Query("SELECT c FROM Convenio c WHERE c.estado = :estado AND c.cuposDisponibles > :cupos")
    Page<Convenio> findByEstadoAndCuposDisponibles(EstadoConvenio estado, int cupos, Pageable pageable);

    @Query("SELECT c FROM Convenio c WHERE (CAST(:search AS string) IS NULL OR LOWER(c.institucion) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND (CAST(:estado AS string) IS NULL OR c.estado = :estado)")
    Page<Convenio> buscarConFiltros(@Param("search") String search, @Param("estado") EstadoConvenio estado, Pageable pageable);

    long countByEstado(EstadoConvenio estado);

    List<Convenio> findByEstadoIn(Collection<EstadoConvenio> estados);
}