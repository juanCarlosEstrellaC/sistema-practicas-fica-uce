package com.uce.api_pp_uce.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_resetear_contrasenia")
@Getter
@Setter
@NoArgsConstructor
public class TokenRecuperacionContrasenia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(fechaExpiracion);
    }
}
