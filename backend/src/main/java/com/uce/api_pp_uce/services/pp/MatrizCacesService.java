package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MatrizCacesService {
    Page<MatrizCacesDto> listarPorCarrera(Integer carreraId, Pageable pageable);
    Page<MatrizCacesDto> listarPorPeriodo(Long periodoId, EstadoMatrizCaces estado, String search, Pageable pageable);
    MatrizCacesDto obtenerPorId(Long id);
    MatrizCacesDto obtenerPorPeriodoYCarrera(Long periodoAcademicoId, Integer carreraId);
    MatrizCacesDto crearOActualizar(Long periodoAcademicoId, Integer carreraId);
    MatrizCacesDto cambiarEstado(Long id, EstadoMatrizCaces nuevoEstado, String observacion);
    byte[] generarExcelMatrizCaces(Long id);
    ArchivoDescargaDto obtenerDescargaExcel(Long id);
    MatrizCacesDto subirArchivoFirmado(Long id, String url);
}
