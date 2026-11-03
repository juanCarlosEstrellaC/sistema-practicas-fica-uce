package com.uce.api_pp_uce.auditoria;

import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class OyenteRevisionAuditoria implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        if (revisionEntity instanceof RevisionAuditoria revision) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                revision.setUsuarioCorreo(auth.getName());
                if (auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
                    revision.setUsuarioRol(auth.getAuthorities().iterator().next().getAuthority());
                } else {
                    revision.setUsuarioRol("NO_DEFINIDO");
                }
            } else {
                revision.setUsuarioCorreo("SISTEMA");
                revision.setUsuarioRol("SISTEMA");
            }
        }
    }
}
