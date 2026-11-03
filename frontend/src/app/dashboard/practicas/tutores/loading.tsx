import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingTutores() {
  return (
    <EsqueletoListadoGeneral
      titulo="Tutores Académicos"
      tipo="tutores-practicas"
      columnas={['Docente / Tutor', 'Estudiantes Asignados', 'Carga y Asignaciones', 'Acciones']}
      mostrarCabeceraPagina={false}
      mostrarCabeceraListado={true}
      tituloListado="Tutores Académicos"
      etiquetaTotal="Total de tutores registrados"
      mostrarBadgesListado={true}
      mostrarBotonListado={false}
      cantidadFiltros={2}
    />
  )
}
