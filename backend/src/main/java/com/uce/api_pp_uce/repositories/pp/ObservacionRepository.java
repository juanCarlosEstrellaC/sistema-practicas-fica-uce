package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.Observacion;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacionRepository extends JpaRepository<Observacion, Long> {

    @EntityGraph(attributePaths = {"remitente", "carrera", "convenio"})
    @Query("""
           SELECT o FROM Observacion o WHERE
           (CAST(:remitenteId AS long) IS NULL OR o.remitente.id = :remitenteId) AND
           (CAST(:tipo AS string) IS NULL OR o.tipo = :tipo) AND
           (CAST(:estado AS string) IS NULL OR o.estado = :estado) AND
           (CAST(:busqueda AS string) IS NULL OR
           LOWER(o.empresa) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
           LOWER(o.descripcion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
           """)
    Page<Observacion> findByFiltros(@Param("remitenteId") Long remitenteId, @Param("tipo") TipoObservacion tipo, @Param("estado") EstadoObservacion estado, @Param("busqueda") String busqueda, Pageable pageable);
}
