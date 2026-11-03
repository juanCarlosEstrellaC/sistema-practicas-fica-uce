package com.uce.api_pp_uce.auditoria;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@Table(name = "revinfo", schema = "auditoria")
@RevisionEntity(OyenteRevisionAuditoria.class)
@Getter
@Setter
public class RevisionAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    @Column(name = "rev")
    private Long rev;

    @RevisionTimestamp
    @Column(name = "revtstmp", nullable = false)
    private long revtstmp;

    @Column(name = "usuario_correo")
    private String usuarioCorreo;

    @Column(name = "usuario_rol")
    private String usuarioRol;
}
