import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingTutoresVinculacion() {
  return (
    <EsqueletoListadoGeneral
      titulo="Carga Académica de Tutores"
      subtitulo="Consulte los proyectos comunitarios asociados y el número de asignaciones activas por tutor para el periodo."
      tipo="tutores-vcs"
      columnas={['Tutor Académico', 'Asignados', 'Proyectos Asignados', 'Acciones']}
      mostrarBotonCabecera={false}
      mostrarCabeceraListado={true}
      tituloListado="Listado de Tutores Académicos"
      etiquetaTotal="Total de tutores encontrados"
      mostrarBotonListado={false}
      cantidadFiltros={3}
    />
  )
}
