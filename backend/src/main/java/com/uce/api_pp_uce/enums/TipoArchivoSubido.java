package com.uce.api_pp_uce.enums;

public enum TipoArchivoSubido {
    MATRICES_CACES("practicas/matrices_caces", "Matrices CACES"),
    CARTAS_ASIGNACION("practicas/cartas_asignacion", "Cartas de Asignacion"),
    AVALES("practicas/avales", "Avales"),
    CONVENIOS("practicas/convenios", "Convenios"),
    PORTAFOLIOS("practicas/portafolios", "Documentos de Portafolio"),
    VINCULACION("vinculacion", "Vinculacion con la Sociedad"),
    AVATARES("general/avatars", "Avatares de Usuario"),
    PLANTILLAS("general/plantillas", "Plantillas de Documentos"),
    OTROS("general/otros", "Otros Archivos");

    private final String subcarpeta;
    private final String descripcion;

    TipoArchivoSubido(String subcarpeta, String descripcion) {
        this.subcarpeta = subcarpeta;
        this.descripcion = descripcion;
    }

    public String getSubcarpeta() {
        return subcarpeta;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public static TipoArchivoSubido desdeTexto(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return OTROS;
        }

        String textoNormalizado = texto.trim()
                .toLowerCase()
                .replace("-", "_")
                .replaceAll("[^a-z0-9_]", "");

        for (TipoArchivoSubido tipo : values()) {
            if (tipo.name().equalsIgnoreCase(textoNormalizado) || tipo.subcarpeta.equalsIgnoreCase(textoNormalizado)) {
                return tipo;
            }
        }

        // Casos particulares de alias o singular
        if (textoNormalizado.contains("matriz") || textoNormalizado.contains("caces")) {
            return MATRICES_CACES;
        }
        if (textoNormalizado.contains("carta") || textoNormalizado.contains("asignacion")) {
            return CARTAS_ASIGNACION;
        }
        if (textoNormalizado.contains("aval")) {
            return AVALES;
        }
        if (textoNormalizado.contains("convenio")) {
            return CONVENIOS;
        }
        if (textoNormalizado.contains("portafolio")) {
            return PORTAFOLIOS;
        }
        if (textoNormalizado.contains("vinculacion") || textoNormalizado.contains("vcs")) {
            return VINCULACION;
        }
        if (textoNormalizado.contains("avatar")) {
            return AVATARES;
        }
        if (textoNormalizado.contains("plantilla")) {
            return PLANTILLAS;
        }

        return OTROS;
    }
}
