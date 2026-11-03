package com.uce.api_pp_uce.entities;

import com.uce.api_pp_uce.enums.EstadoPeriodo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "periodos_academicos")
@SQLDelete(sql = "UPDATE periodos_academicos SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPeriodo estado = EstadoPeriodo.ACTIVO;

    @Column(nullable = false)
    private boolean borrado = false;
}
