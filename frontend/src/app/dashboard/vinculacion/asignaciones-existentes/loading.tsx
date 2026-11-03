import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingAsignacionesExistentes() {
  return (
    <EsqueletoListadoGeneral
      titulo="Asignaciones de Proyectos Comunitarios"
      subtitulo="Consulte, filtre y gestione las asignaciones de estudiantes a proyectos comunitarios."
      tipo="asignaciones-vcs"
      columnas={['Estudiante', 'Proyecto y Tutor', 'Horas / Avance', 'Fase', 'Estado', 'Acciones']}
      mostrarBotonCabecera={false}
      mostrarCabeceraListado={true}
      tituloListado="Listado de Asignaciones"
      etiquetaTotal="Total de asignaciones registradas"
      mostrarBotonListado={true}
      cantidadFiltros={3}
    />
  )
}
