package com.uce.api_pp_uce.entities.pp;

import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
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
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones_practicas")
@SQLDelete(sql = "UPDATE asignaciones_practicas SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class AsignacionPractica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Usuario getEstudiante() {
        return procesoPractica != null ? procesoPractica.getEstudiante() : null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoPractica procesoPractica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convenio_id", nullable = false)
    private Convenio convenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_academico_id")
    private Usuario tutorAcademico;

    @Column(name = "tutor_institucional")
    private String tutorInstitucional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id")
    private PeriodoAcademico periodoAcademico;

    private Integer semestre;

    @Column(name = "horas_asignadas")
    private Integer horasAsignadas = 0;

    @Column(name = "horas_completadas")
    private Integer horasCompletadas = 0;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    private FaseActualPractica fase;

    @Enumerated(EnumType.STRING)
    private EstadoAsignacion estado;

    @Column(name = "validado_cpp")
    private Boolean validadoCpp = false;

    @Column(name = "observaciones_caces")
    private String observacionesCaces;

    @Column(name = "reunion_realizada")
    private Boolean reunionRealizada = false;

    @Column(name = "validado_siiu")
    private Boolean validadoSiiu = false;

    @Column(name = "carta_asignacion_enviada")
    private Boolean cartaAsignacionEnviada = false;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "borrado")
    private Boolean borrado = false;
}
