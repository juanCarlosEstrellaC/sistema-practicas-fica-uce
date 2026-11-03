package com.uce.api_pp_uce.entities;

import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
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
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@SQLDelete(sql = "UPDATE usuarios SET borrado = true WHERE id = ?")
@SQLRestriction("borrado = false OR borrado IS NULL")
@Audited
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Carrera carrera;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(name = "clave_hash", nullable = false)
    @NotAudited
    private String claveHash;

    @Column(nullable = false)
    private String nombres;

    @Column(nullable = false)
    private String apellidos;

    @Column(unique = true, length = 20)
    private String identificacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_identificacion")
    private TipoIdentificacionUsuario tipoIdentificacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;

    @Column(length = 20)
    private String telefono;

    @Column(name = "url_avatar", columnDefinition = "TEXT")
    private String urlAvatar;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;

    @Column(nullable = false)
    private boolean borrado = false;

    @Column(name = "version_token")
    @NotAudited
    private Long versionToken = 0L;

    public String getNombreCompleto() {
        return (nombres != null ? nombres : "") + " " + (apellidos != null ? apellidos : "");
    }
}
