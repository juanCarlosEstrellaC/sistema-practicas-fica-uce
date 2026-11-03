package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ArchivoService {

    String guardarAvatar(MultipartFile archivo, String identificador);

    String subirArchivo(MultipartFile archivo, String carpeta);

    String subirArchivo(MultipartFile archivo, TipoArchivoSubido tipoArchivo);

    String guardarArchivoBytes(byte[] contenido, String nombreArchivo, TipoArchivoSubido tipoArchivo);

    Resource cargarArchivo(String rutaRelativa);

    boolean eliminarArchivo(String rutaRelativa);
}
