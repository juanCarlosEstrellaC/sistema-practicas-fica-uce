package com.uce.api_pp_uce.entities.pp;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
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
@Table(name = "documentos_portafolio")
@SQLDelete(sql = "UPDATE documentos_portafolio SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Getter
@Setter
public class DocumentoPortafolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Usuario estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoPractica procesoPractica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id")
    private AsignacionPractica asignacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumento tipo;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombre;

    @Column(name = "url_archivo", columnDefinition = "TEXT", nullable = false)
    private String url;

    private Boolean firmado = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoDocumento estado = EstadoDocumento.PENDIENTE_REVISION;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "fecha_subida", insertable = false, updatable = false)
    private LocalDateTime fechaSubida;

    @Column(nullable = false)
    private boolean borrado = false;
}
