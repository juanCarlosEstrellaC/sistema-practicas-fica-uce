package com.uce.api_pp_uce.entities.pp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "observaciones")
@SQLDelete(sql = "UPDATE observaciones SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class Observacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remitente_id", nullable = false)
    @JsonIgnoreProperties({"carrera", "hibernateLazyInitializer", "handler"})
    private Usuario remitente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    @JsonIgnoreProperties({"director", "coordinador", "hibernateLazyInitializer", "handler"})
    private Carrera carrera;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convenio_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Convenio convenio;

    private String empresa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoObservacion tipo;

    private String contacto;
    private String correo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private EstadoObservacion estado;

    @Column(name = "fecha", insertable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private boolean borrado = false;
}
