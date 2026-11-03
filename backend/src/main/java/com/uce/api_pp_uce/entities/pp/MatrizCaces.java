package com.uce.api_pp_uce.entities.pp;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDateTime;

@Entity
@Table(name = "matrices_caces", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"periodo_id", "carrera_id"})
})
@SQLDelete(sql = "UPDATE matrices_caces SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Audited
@Getter
@Setter
public class MatrizCaces {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private PeriodoAcademico periodoAcademico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Carrera carrera;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMatrizCaces estado = EstadoMatrizCaces.PENDIENTE;

    @Column(name = "fecha_generacion", insertable = false, updatable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "archivo_firmado_url")
    private String archivoFirmadoUrl;

    @Column(name = "observacion")
    private String observacion;

    @Column(nullable = false)
    private boolean borrado = false;
}
