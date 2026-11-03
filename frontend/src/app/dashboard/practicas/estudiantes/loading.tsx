import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingEstudiantes() {
  return (
    <EsqueletoListadoGeneral
      titulo="Estudiantes con Asignación"
      subtitulo="Consulte, filtre y gestione las prácticas preprofesionales de los estudiantes."
      tipo="estudiantes"
      columnas={['Estudiante', 'Institución y Tutor', 'Progreso', 'Fase', 'Estado', 'Acciones']}
      mostrarBotonCabecera={false}
      mostrarCabeceraListado={true}
      tituloListado="Listado de Asignaciones"
      etiquetaTotal="Total de asignaciones registradas"
      mostrarBotonListado={false}
      cantidadFiltros={2}
    />
  )
}
