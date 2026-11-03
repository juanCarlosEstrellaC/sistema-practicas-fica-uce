import { EsqueletoListadoGeneral } from '@/components/esqueletos/esqueleto-listado-general'

export default function LoadingMatrizCaces() {
  return (
    <EsqueletoListadoGeneral
      titulo="Matrices CACES de la Facultad"
      tipo="matriz-caces"
      columnas={['Carrera', 'Código', 'Estado', 'Acciones']}
      mostrarCabeceraPagina={false}
      mostrarCabeceraListado={true}
      tituloListado="Matrices CACES de la Facultad"
      etiquetaTotal="Matrices por carrera"
      mostrarBadgesListado={true}
      mostrarBotonListado={false}
      cantidadFiltros={1}
    />
  )
}
