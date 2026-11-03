package com.uce.api_pp_uce.entities.pp;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
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
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDateTime;

@Entity
@Table(name = "procesos_practicas")
@Audited
@Getter
@Setter
public class ProcesoPractica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Usuario estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Carrera carrera;

    @Column(name = "horas_requeridas", nullable = false)
    private Integer horasRequeridas;

    @Column(name = "horas_acumuladas")
    private Integer horasAcumuladas = 0;

    @Enumerated(EnumType.STRING)
    private EstadoProceso estado = EstadoProceso.EN_CURSO;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
