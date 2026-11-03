import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingConvenios() {
  return (
    <EsqueletoListadoGeneral
      titulo="Gestión de Convenios Institucionales"
      subtitulo="Aquí podrá gestionar los convenios institucionales para prácticas preprofesionales."
      tipo="convenios"
      columnas={['Institución', 'Estado', 'Vigencia', 'Cupos', 'Acciones']}
      pestaniasCabecera={true}
      mostrarCabeceraListado={true}
      tituloListado="Listado de Convenios Institucionales"
      etiquetaTotal="Total de convenios registrados"
      mostrarBotonListado={true}
      cantidadFiltros={1}
    />
  )
}
