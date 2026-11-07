package com.uce.api_pp_uce.entities.vcs;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
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
@Table(name = "evidencias_asignaciones_vcs")
@SQLDelete(sql = "UPDATE evidencias_asignaciones_vcs SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class EvidenciaAsignacionVcs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false)
    private AsignacionProyectoComunitario asignacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Usuario estudiante;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", length = 30)
    private TipoDocumentoVcs tipoDocumento;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;

    @Column(name = "url_archivo", nullable = false)
    private String urlArchivo;

    @Column(name = "horas_reportadas")
    private Integer horasReportadas;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_tutor", nullable = false)
    private EstadoRevisionVcs estadoTutor = EstadoRevisionVcs.PENDIENTE;

    @Column(name = "observaciones_tutor", columnDefinition = "TEXT")
    private String observacionesTutor;

    @CreationTimestamp
    @Column(name = "fecha_subida", nullable = false, updatable = false)
    private LocalDateTime fechaSubida;

    @Column(name = "fecha_revision_tutor")
    private LocalDateTime fechaRevisionTutor;

    @Column(nullable = false)
    private boolean borrado = false;
}
