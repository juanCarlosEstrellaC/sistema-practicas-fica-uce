package com.uce.api_pp_uce.repositories;

import com.uce.api_pp_uce.entities.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    Page<Notificacion> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.id = :usuarioId AND n.leida = false")
    int marcarTodasComoLeidas(@Param("usuarioId") Long usuarioId);
}
