package com.uce.api_pp_uce.repositories;

import com.uce.api_pp_uce.entities.TokenRecuperacionContrasenia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRecuperacionContraseniaRepository extends JpaRepository<TokenRecuperacionContrasenia, Long> {
    Optional<TokenRecuperacionContrasenia> findByToken(String token);
    Optional<TokenRecuperacionContrasenia> findByUsuarioId(Long usuarioId);
}

