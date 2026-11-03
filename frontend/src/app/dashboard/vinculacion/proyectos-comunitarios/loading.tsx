import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingProyectosComunitarios() {
  return (
    <EsqueletoListadoGeneral
      titulo="Gestión de Proyectos Comunitarios"
      subtitulo="Aquí podrá gestionar los proyectos comunitarios de vinculación con la sociedad."
      tipo="proyectos"
      columnas={['Proyecto', 'Carrera', 'Fechas', 'Estado', 'Acciones']}
      mostrarBotonCabecera={false}
      mostrarCabeceraListado={true}
      tituloListado="Listado de Proyectos Comunitarios"
      etiquetaTotal="Total de proyectos registrados"
      mostrarBotonListado={true}
      cantidadFiltros={2}
    />
  )
}
