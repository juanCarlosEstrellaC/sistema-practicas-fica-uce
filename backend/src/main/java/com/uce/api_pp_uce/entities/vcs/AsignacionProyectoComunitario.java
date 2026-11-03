package com.uce.api_pp_uce.entities.vcs;

import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;

@Entity
@Table(name = "asignaciones_proyectos_comunitarios")
@SQLDelete(sql = "UPDATE asignaciones_proyectos_comunitarios SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Audited
@Getter
@Setter
public class AsignacionProyectoComunitario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_vinculacion_id", nullable = false)
    private ProcesoVinculacion procesoVinculacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_comunitario_id", nullable = false)
    private ProyectoComunitario proyectoComunitario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private PeriodoAcademico periodoAcademico;

    @Column(name = "horas_asignadas", nullable = false)
    private Integer horasAsignadas;

    @Column(name = "horas_completadas", nullable = false)
    private Integer horasCompletadas;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoAsignacionVcs estado = EstadoAsignacionVcs.EN_CURSO;

    @Column(name = "fase_actual", nullable = false)
    @Enumerated(EnumType.STRING)
    private FaseActualAsignacion faseActual = FaseActualAsignacion.ASIGNACION;

    @Column(name = "documentos_validados", nullable = false)
    private boolean documentosValidados = false;

    @Column(name = "url_certificado")
    private String urlCertificado;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private boolean borrado = false;
}
