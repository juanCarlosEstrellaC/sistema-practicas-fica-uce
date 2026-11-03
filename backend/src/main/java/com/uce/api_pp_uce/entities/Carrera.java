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
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "carreras")
@SQLDelete(sql = "UPDATE carreras SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class Carrera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "codigo_carrera", unique = true)
    private String codigoCarrera;

    @Column(name = "ciudad_carrera")
    private String ciudadCarrera;

    @Column(name = "horas_practicas")
    private Integer horasPractica = 0;

    @Column(name = "horas_proyectos_comunitarios")
    private Integer horasProyectosComunitarios = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "director_id", unique = true)
    private Usuario director;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinador_id", unique = true)
    private Usuario coordinador;

    @Column(nullable = false)
    private boolean borrado = false;
}
