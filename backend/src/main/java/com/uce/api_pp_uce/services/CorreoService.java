package com.uce.api_pp_uce.services;

import java.util.Map;

public interface CorreoService {
    void enviarCorreoConAdjunto(String destinatario, String asunto, String cuerpoTexto, byte[] archivoPdf, String nombreArchivo);
    void enviarCorreoTexto(String destinatario, String asunto, String cuerpoTexto);
    void enviarCorreoHtml(String destinatario, String asunto, String rutaPlantilla, Map<String, Object> variables);
    void enviarCorreoHtmlConAdjunto(String destinatario, String asunto, String rutaPlantilla, Map<String, Object> variables, byte[] archivoPdf, String nombreArchivo);
}
