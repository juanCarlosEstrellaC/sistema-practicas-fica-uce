package com.uce.api_pp_uce.entities.vcs;

import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_proyectos_vcs")
@SQLDelete(sql = "UPDATE reportes_proyectos_vcs SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class ReporteProyectoVcs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private ProyectoComunitario proyecto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinador_id", nullable = false)
    private Usuario coordinador;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoReporteProyectoVcs tipo;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;

    @Column(name = "url_archivo", nullable = false)
    private String urlArchivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_subdecanato", nullable = false)
    private EstadoRevisionVcs estadoSubdecanato = EstadoRevisionVcs.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_subida", nullable = false, updatable = false)
    private LocalDateTime fechaSubida;

    @Column(name = "fecha_revision")
    private LocalDateTime fechaRevision;

    @Column(nullable = false)
    private boolean borrado = false;
}
