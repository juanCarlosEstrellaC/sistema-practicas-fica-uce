package com.uce.api_pp_uce.entities.pp;

import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
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
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "convenios")
@SQLDelete(sql = "UPDATE convenios SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Audited
@Getter
@Setter
public class Convenio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String institucion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConvenio tipo;

    @Column(name = "campo_especifico")
    private BigDecimal campoEspecifico;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    private EstadoConvenio estado;

    @Column(name = "tutor_institucional")
    private String tutorInstitucional;

    @Column(name = "correo_tutor")
    private String correoTutor;

    @Column(name = "telefono_tutor")
    private String telefonoTutor;

    @Column(name = "cupos_totales")
    private Integer cuposDisponibles = 0;

    @Column(name = "url_documento", columnDefinition = "TEXT")
    private String urlDocumento;

    @Column(name = "nombre_documento")
    private String nombreDocumento;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private boolean borrado = false;
}
