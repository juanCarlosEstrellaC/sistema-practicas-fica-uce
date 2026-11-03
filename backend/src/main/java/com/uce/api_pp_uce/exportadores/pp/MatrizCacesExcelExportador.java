package com.uce.api_pp_uce.exportadores.pp;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class MatrizCacesExcelExportador {

    public byte[] exportar(MatrizCaces matriz, List<AsignacionPractica> asignaciones, Usuario subdecano) {
        try (Workbook libro = new XSSFWorkbook(); ByteArrayOutputStream flujoSalida = new ByteArrayOutputStream()) {
            Sheet hoja = libro.createSheet("Matriz CACES");

            // --- ESTILOS ---
            CellStyle estiloTitulo = libro.createCellStyle();
            Font fuenteTitulo = libro.createFont();
            fuenteTitulo.setBold(true);
            fuenteTitulo.setFontHeightInPoints((short) 12);
            estiloTitulo.setFont(fuenteTitulo);
            estiloTitulo.setAlignment(HorizontalAlignment.LEFT);
            estiloTitulo.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle estiloCabecera = libro.createCellStyle();
            Font fuenteCabecera = libro.createFont();
            fuenteCabecera.setBold(true);
            fuenteCabecera.setFontHeightInPoints((short) 10);
            estiloCabecera.setFont(fuenteCabecera);
            estiloCabecera.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            estiloCabecera.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            estiloCabecera.setBorderTop(BorderStyle.THIN);
            estiloCabecera.setBorderBottom(BorderStyle.THIN);
            estiloCabecera.setBorderLeft(BorderStyle.THIN);
            estiloCabecera.setBorderRight(BorderStyle.THIN);
            estiloCabecera.setAlignment(HorizontalAlignment.CENTER);
            estiloCabecera.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle estiloDatos = libro.createCellStyle();
            estiloDatos.setBorderTop(BorderStyle.THIN);
            estiloDatos.setBorderBottom(BorderStyle.THIN);
            estiloDatos.setBorderLeft(BorderStyle.THIN);
            estiloDatos.setBorderRight(BorderStyle.THIN);
            estiloDatos.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle estiloFirmaLinea = libro.createCellStyle();
            estiloFirmaLinea.setBorderBottom(BorderStyle.THIN);

            CellStyle estiloFirmaTexto = libro.createCellStyle();
            Font fuenteFirma = libro.createFont();
            fuenteFirma.setBold(true);
            fuenteFirma.setFontHeightInPoints((short) 10);
            estiloFirmaTexto.setFont(fuenteFirma);
            estiloFirmaTexto.setAlignment(HorizontalAlignment.CENTER);

            // Titulo
            Row filaTitulo = hoja.createRow(0);
            filaTitulo.setHeightInPoints(25);
            Cell celdaTitulo = filaTitulo.createCell(0);
            celdaTitulo.setCellValue("MATRIZ DE VALIDACIÓN DE PRÁCTICAS PREPROFESIONALES");
            celdaTitulo.setCellStyle(estiloTitulo);

            // Cabecera
            Row filaCabecera = hoja.createRow(1);
            String[] cabeceras = {
                    "CODIGO_IES", "CODIGO_CARRERA", "CIUDAD_CARRERA", "TIPO_IDENTIFICACION", "IDENTIFICACION",
                    "PRIMER APELLIDO", "SEGUNDO APELLIDO", "NOMBRES", "NOMBRE_INSTITUCION", "TIPO_INSTITUCION",
                    "FECHA_INICIO", "FECHA_FIN", "NUMERO_HORAS", "CAMPO_ESPECIFICO", "IDENTIFICACION_DOCENTE_TUTOR",
                    "NOMBRE Y APELLIDO TUTOR", "OBSERVACIONES"
            };

            hoja.addMergedRegion(new CellRangeAddress(0, 0, 0, cabeceras.length - 1));

            for (int i = 0; i < cabeceras.length; i++) {
                Cell celda = filaCabecera.createCell(i);
                celda.setCellValue(cabeceras[i]);
                celda.setCellStyle(estiloCabecera);
            }

            int indiceFila = 2;
            for (AsignacionPractica asig : asignaciones) {
                Row fila = hoja.createRow(indiceFila++);

                String primerApellido = "";
                String segundoApellido = "";
                String nombres = "";
                if (asig.getEstudiante() != null) {
                    String apellidosFull = asig.getEstudiante().getApellidos();
                    if (apellidosFull != null && !apellidosFull.isEmpty()) {
                        String[] parts = apellidosFull.split(" ");
                        primerApellido = parts[0];
                        segundoApellido = parts.length > 1 ? apellidosFull.substring(primerApellido.length() + 1) : "";
                    } else if (asig.getEstudiante().getNombres() != null) {
                        String[] parts = asig.getEstudiante().getNombres().split(" ");
                        primerApellido = parts.length > 0 ? parts[0] : "";
                        segundoApellido = parts.length > 1 ? parts[1] : "";
                        nombres = parts.length > 2 ? asig.getEstudiante().getNombres()
                                .substring(primerApellido.length() + segundoApellido.length() + 2) : "";
                    }
                    if (asig.getEstudiante().getApellidos() != null) {
                        nombres = asig.getEstudiante().getNombres() != null ? asig.getEstudiante().getNombres() : "";
                    }
                }

                Cell[] celdas = new Cell[cabeceras.length];
                for (int i = 0; i < cabeceras.length; i++) {
                    celdas[i] = fila.createCell(i);
                    celdas[i].setCellStyle(estiloDatos);
                }

                celdas[0].setCellValue("1005");
                celdas[1].setCellValue(matriz.getCarrera() != null ? matriz.getCarrera().getCodigoCarrera() : "");
                celdas[2].setCellValue(matriz.getCarrera() != null ? matriz.getCarrera().getCiudadCarrera() : "");
                String tipoDocumentoStr = "Cédula";
                if (asig.getEstudiante() != null && asig.getEstudiante().getTipoIdentificacion() != null) {
                    if (asig.getEstudiante().getTipoIdentificacion() == TipoIdentificacionUsuario.PASAPORTE) {
                        tipoDocumentoStr = "Pasaporte";
                    }
                }
                celdas[3].setCellValue(tipoDocumentoStr);
                celdas[4].setCellValue(asig.getEstudiante() != null && asig.getEstudiante().getIdentificacion() != null
                        ? asig.getEstudiante().getIdentificacion()
                        : "");
                celdas[5].setCellValue(primerApellido);
                celdas[6].setCellValue(segundoApellido);
                celdas[7].setCellValue(nombres);
                celdas[8].setCellValue(asig.getConvenio() != null ? asig.getConvenio().getInstitucion() : "");
                celdas[9].setCellValue(asig.getConvenio() != null && asig.getConvenio().getTipo() != null
                        ? asig.getConvenio().getTipo().name()
                        : "PUBLICO");
                celdas[10].setCellValue(asig.getFechaInicio() != null ? asig.getFechaInicio().toString() : "");
                celdas[11].setCellValue(asig.getFechaFin() != null ? asig.getFechaFin().toString() : "");
                celdas[12].setCellValue(asig.getHorasCompletadas() != null ? asig.getHorasCompletadas() : 0);
                celdas[13].setCellValue("611");
                celdas[14].setCellValue(
                        asig.getTutorAcademico() != null && asig.getTutorAcademico().getIdentificacion() != null
                                ? asig.getTutorAcademico().getIdentificacion()
                                : "");
                celdas[15].setCellValue(asig.getTutorAcademico() != null
                        ? asig.getTutorAcademico().getApellidos() + " " + asig.getTutorAcademico().getNombres()
                        : "");
                celdas[16].setCellValue(asig.getObservacionesCaces() != null ? asig.getObservacionesCaces() : "");
            }

            for (int i = 0; i < cabeceras.length; i++) {
                hoja.autoSizeColumn(i);
            }

            // Firmas al final
            indiceFila += 4;

            Row filaLineaFirma = hoja.createRow(indiceFila);
            Row filaTextoFirma = hoja.createRow(indiceFila + 1);
            Row filaCargoFirma = hoja.createRow(indiceFila + 2);

            // Subdecana (columna 1 a 4)
            hoja.addMergedRegion(new CellRangeAddress(indiceFila, indiceFila, 1, 4));
            for (int i = 1; i <= 4; i++) {
                Cell c = filaLineaFirma.createCell(i);
                c.setCellStyle(estiloFirmaLinea);
            }

            String nombreSubdecanaStr = "Subdecano/a no asignado";
            if (subdecano != null) {
                nombreSubdecanaStr = subdecano.getNombres() + " " + subdecano.getApellidos();
            }

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 1, indiceFila + 1, 1, 4));
            Cell celdaNombresSubdecana = filaTextoFirma.createCell(1);
            celdaNombresSubdecana.setCellValue(nombreSubdecanaStr);
            celdaNombresSubdecana.setCellStyle(estiloFirmaTexto);

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 2, indiceFila + 2, 1, 4));
            Cell celdaCargoSubdecana = filaCargoFirma.createCell(1);
            celdaCargoSubdecana.setCellValue("SUBDECANO/A");
            celdaCargoSubdecana.setCellStyle(estiloFirmaTexto);

            // Directora de Carrera (columna 6 a 9)
            hoja.addMergedRegion(new CellRangeAddress(indiceFila, indiceFila, 6, 9));
            for (int i = 6; i <= 9; i++) {
                Cell c = filaLineaFirma.createCell(i);
                c.setCellStyle(estiloFirmaLinea);
            }

            String nombreDirectoraStr = "Director/a no asignado";
            if (matriz.getCarrera() != null && matriz.getCarrera().getDirector() != null) {
                Usuario director = matriz.getCarrera().getDirector();
                nombreDirectoraStr = director.getNombres() + " " + director.getApellidos();
            }

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 1, indiceFila + 1, 6, 9));
            Cell celdaNombresDirectora = filaTextoFirma.createCell(6);
            celdaNombresDirectora.setCellValue(nombreDirectoraStr);
            celdaNombresDirectora.setCellStyle(estiloFirmaTexto);

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 2, indiceFila + 2, 6, 9));
            Cell celdaCargoDirectora = filaCargoFirma.createCell(6);
            celdaCargoDirectora.setCellValue("DIRECTOR/A DE CARRERA");
            celdaCargoDirectora.setCellStyle(estiloFirmaTexto);

            // Coordinador de Practicas (columna 11 a 14)
            hoja.addMergedRegion(new CellRangeAddress(indiceFila, indiceFila, 11, 14));
            for (int i = 11; i <= 14; i++) {
                Cell c = filaLineaFirma.createCell(i);
                c.setCellStyle(estiloFirmaLinea);
            }

            String nombreCoordinadorStr = "Coordinador/a no asignado";
            if (matriz.getCarrera() != null && matriz.getCarrera().getCoordinador() != null) {
                Usuario coordinador = matriz.getCarrera().getCoordinador();
                nombreCoordinadorStr = coordinador.getNombres() + " " + coordinador.getApellidos();
            }

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 1, indiceFila + 1, 11, 14));
            Cell celdaNombresCoordinador = filaTextoFirma.createCell(11);
            celdaNombresCoordinador.setCellValue(nombreCoordinadorStr);
            celdaNombresCoordinador.setCellStyle(estiloFirmaTexto);

            hoja.addMergedRegion(new CellRangeAddress(indiceFila + 2, indiceFila + 2, 11, 14));
            Cell celdaCargoCoordinador = filaCargoFirma.createCell(11);
            celdaCargoCoordinador.setCellValue("COORDINADOR/A DE PRÁCTICAS");
            celdaCargoCoordinador.setCellStyle(estiloFirmaTexto);

            libro.write(flujoSalida);
            return flujoSalida.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error al generar Excel", e);
        }
    }
}
