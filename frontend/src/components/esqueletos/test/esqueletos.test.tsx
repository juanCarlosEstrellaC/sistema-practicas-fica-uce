import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Table, TableBody } from '@/components/ui/table'
import {
  EsqueletoFilasTablaUsuarios,
  EsqueletoTarjetasUsuarios,
  EsqueletoFilasTablaCarreras,
  EsqueletoTarjetasCarreras,
  EsqueletoFilasTablaPeriodos,
  EsqueletoTarjetasPeriodos,
  EsqueletoFilasTablaEstudiantes,
  EsqueletoTarjetasEstudiantes,
  EsqueletoFilasTablaConvenios,
  EsqueletoTarjetasConvenios,
  EsqueletoFilasTablaProyectos,
  EsqueletoTarjetasProyectos,
  EsqueletoFilasTablaMatrizCaces,
  EsqueletoFilasTablaTutoresPracticas,
  EsqueletoTarjetasTutoresPracticas,
  EsqueletoFilasTablaTutoresVcs,
  EsqueletoTarjetasTutoresVcs,
  EsqueletoFilasTablaAsignacionesVcs,
} from '../esqueleto-tabla'
import { EsqueletoDashboardSubdecano } from '../esqueleto-dashboard-subdecano'
import { EsqueletoDashboardDirectorCoordinador } from '../esqueleto-dashboard-director-coordinador'
import { EsqueletoDashboardTutor } from '../esqueleto-dashboard-tutor'
import { EsqueletoDashboardEstudiante } from '../esqueleto-dashboard-estudiante'
import { EsqueletoDashboardGeneral } from '../esqueleto-dashboard-general'
import { EsqueletoTarjetaMetricaWireframe } from '../esqueleto-tarjeta-metrica'
import { EsqueletoIngresoDatos } from '../esqueleto-ingreso-datos'
import { EsqueletoPortafolioEstudiante } from '../esqueleto-portafolio-estudiante'
import { EsqueletoConfiguracion } from '../esqueleto-configuracion'
import { EsqueletoProgresoGeneralVcs } from '../esqueleto-progreso-general-vcs'
import { EsqueletoAsignadorMasivoPracticas, EsqueletoAsignadorMasivoVcs } from '../esqueleto-asignador-masivo'
import { EsqueletoListadoGeneral } from '../esqueleto-listado-general'

describe('Componentes de Esqueletos para Todos los Perfiles del Sistema', () => {
  it('debe renderizar correctamente las filas esqueleto de usuarios en una tabla', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaUsuarios filas={3} />
        </TableBody>
      </Table>
    )

    const filas = container.querySelectorAll('tr')
    expect(filas.length).toBe(3)
  })

  it('debe renderizar las tarjetas esqueleto de usuarios en móvil', () => {
    const { container } = render(<EsqueletoTarjetasUsuarios tarjetas={4} />)
    const tarjetas = container.querySelectorAll('.rounded-xl.border')
    expect(tarjetas.length).toBe(4)
  })

  it('debe renderizar las filas esqueleto de carreras', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaCarreras filas={2} />
        </TableBody>
      </Table>
    )

    const filas = container.querySelectorAll('tr')
    expect(filas.length).toBe(2)
  })

  it('debe renderizar las filas esqueleto de periodos', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaPeriodos filas={2} />
        </TableBody>
      </Table>
    )

    const filas = container.querySelectorAll('tr')
    expect(filas.length).toBe(2)
  })

  it('debe renderizar las filas y tarjetas esqueleto de estudiantes (PP)', () => {
    const { container: contenedorTabla } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaEstudiantes filas={3} mostrarColumnaCarrera={true} />
        </TableBody>
      </Table>
    )
    expect(contenedorTabla.querySelectorAll('tr').length).toBe(3)

    const { container: contenedorMovil } = render(<EsqueletoTarjetasEstudiantes tarjetas={2} />)
    expect(contenedorMovil.querySelectorAll('.rounded-xl.border').length).toBe(2)
  })

  it('debe renderizar las filas y tarjetas esqueleto de convenios', () => {
    const { container: contenedorTabla } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaConvenios filas={3} />
        </TableBody>
      </Table>
    )
    expect(contenedorTabla.querySelectorAll('tr').length).toBe(3)

    const { container: contenedorMovil } = render(<EsqueletoTarjetasConvenios tarjetas={2} />)
    expect(contenedorMovil.querySelectorAll('.rounded-xl.border').length).toBe(2)
  })

  it('debe renderizar las filas y tarjetas esqueleto de proyectos (VCS)', () => {
    const { container: contenedorTabla } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaProyectos filas={3} />
        </TableBody>
      </Table>
    )
    expect(contenedorTabla.querySelectorAll('tr').length).toBe(3)

    const { container: contenedorMovil } = render(<EsqueletoTarjetasProyectos tarjetas={2} />)
    expect(contenedorMovil.querySelectorAll('.rounded-xl.border').length).toBe(2)
  })

  it('debe renderizar las filas esqueleto de matriz CACES', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaMatrizCaces filas={2} />
        </TableBody>
      </Table>
    )
    expect(container.querySelectorAll('tr').length).toBe(2)
  })

  it('debe renderizar el esqueleto del Dashboard de Subdecano', () => {
    const { container } = render(<EsqueletoDashboardSubdecano />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
    expect(screen.getByText(/cargando dashboard de subdecano/i)).toBeInTheDocument()
  })

  it('debe renderizar el esqueleto del Dashboard de Director y Coordinador', () => {
    const { container } = render(<EsqueletoDashboardDirectorCoordinador />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
    expect(screen.getByText(/cargando dashboard de carrera/i)).toBeInTheDocument()
  })

  it('debe renderizar el esqueleto del Dashboard de Tutor Académico', () => {
    const { container } = render(<EsqueletoDashboardTutor />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
    expect(screen.getByText(/cargando dashboard de tutor académico/i)).toBeInTheDocument()
  })

  it('debe renderizar el esqueleto del Dashboard del Estudiante con hitos y accesos', () => {
    const { container } = render(<EsqueletoDashboardEstudiante />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
    expect(screen.getByText(/cargando dashboard del estudiante/i)).toBeInTheDocument()
  })

  it('debe despachar el esqueleto adecuado según el rol en EsqueletoDashboardGeneral', () => {
    // 1. Estudiante
    const { unmount: desmontarEst } = render(<EsqueletoDashboardGeneral rol="ESTUDIANTE" />)
    expect(screen.getByText(/cargando dashboard del estudiante/i)).toBeInTheDocument()
    desmontarEst()

    // 2. Tutor Académico
    const { unmount: desmontarTut } = render(<EsqueletoDashboardGeneral rol="TUTOR_ACADEMICO" />)
    expect(screen.getByText(/cargando dashboard de tutor académico/i)).toBeInTheDocument()
    desmontarTut()

    // 3. Director de Carrera
    const { unmount: desmontarDc } = render(<EsqueletoDashboardGeneral rol="DIRECTOR_CARRERA" />)
    expect(screen.getByText(/cargando dashboard de carrera/i)).toBeInTheDocument()
    desmontarDc()

    // 4. Coordinador de Prácticas
    const { unmount: desmontarCpp } = render(<EsqueletoDashboardGeneral rol="COORDINADOR_PRACTICAS" />)
    expect(screen.getByText(/cargando dashboard de carrera/i)).toBeInTheDocument()
    desmontarCpp()

    // 5. Subdecano
    const { unmount: desmontarSub } = render(<EsqueletoDashboardGeneral rol="SUBDECANO" />)
    expect(screen.getByText(/cargando dashboard de subdecano/i)).toBeInTheDocument()
    desmontarSub()

    // 6. Por defecto (sin rol o null)
    render(<EsqueletoDashboardGeneral />)
    expect(screen.getByText(/cargando dashboard de subdecano/i)).toBeInTheDocument()
  })

  it('debe renderizar la tarjeta métrica wireframe con su icono y textos', () => {
    const { container } = render(<EsqueletoTarjetaMetricaWireframe />)
    const esqueletos = container.querySelectorAll('[data-slot="skeleton"]')
    expect(esqueletos.length).toBe(4) // Icono, valor, etiqueta y descripción
  })

  it('debe renderizar el esqueleto de Ingreso de Datos', () => {
    const { container } = render(<EsqueletoIngresoDatos />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
  })

  it('debe renderizar el esqueleto de Portafolio del Estudiante', () => {
    const { container } = render(<EsqueletoPortafolioEstudiante esVinculacion={false} />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
  })

  it('debe renderizar el esqueleto de Configuración de Perfil', () => {
    const { container } = render(<EsqueletoConfiguracion />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
  })

  it('debe renderizar el esqueleto de Progreso General VCS', () => {
    const { container } = render(<EsqueletoProgresoGeneralVcs />)
    const elementosEsqueleto = container.querySelectorAll('[data-slot="skeleton"]')
    expect(elementosEsqueleto.length).toBeGreaterThan(10)
  })

  it('debe renderizar las filas y tarjetas de Tutores de Prácticas y Tutores de VCS', () => {
    const { container: tablaTutoresPp } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaTutoresPracticas filas={3} />
        </TableBody>
      </Table>
    )
    expect(tablaTutoresPp.querySelectorAll('tr').length).toBe(3)

    const { container: tarjetasTutoresPp } = render(<EsqueletoTarjetasTutoresPracticas tarjetas={2} />)
    expect(tarjetasTutoresPp.querySelectorAll('.rounded-xl.border').length).toBe(2)

    const { container: tablaTutoresVcs } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaTutoresVcs filas={3} />
        </TableBody>
      </Table>
    )
    expect(tablaTutoresVcs.querySelectorAll('tr').length).toBe(3)

    const { container: tarjetasTutoresVcs } = render(<EsqueletoTarjetasTutoresVcs tarjetas={2} />)
    expect(tarjetasTutoresVcs.querySelectorAll('.rounded-xl.border').length).toBe(2)
  })

  it('debe renderizar las filas de Asignaciones de VCS', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <EsqueletoFilasTablaAsignacionesVcs filas={3} />
        </TableBody>
      </Table>
    )
    expect(container.querySelectorAll('tr').length).toBe(3)
  })

  it('debe renderizar los esqueletos de asignadores masivos de prácticas y vinculación', () => {
    const { container: masivoPp } = render(<EsqueletoAsignadorMasivoPracticas />)
    expect(masivoPp.querySelectorAll('.rounded-xl, .border-border').length).toBeGreaterThan(3)

    const { container: masivoVcs } = render(<EsqueletoAsignadorMasivoVcs />)
    expect(masivoVcs.querySelectorAll('.rounded-xl, .border-border').length).toBeGreaterThan(2)
  })

  it('debe renderizar EsqueletoListadoGeneral con CabeceraListado para evitar saltos visuales', () => {
    render(
      <EsqueletoListadoGeneral
        titulo="Estudiantes con Asignación"
        subtitulo="Consulte, filtre y gestione"
        tipo="estudiantes"
        tituloListado="Listado de Asignaciones"
        etiquetaTotal="Total de asignaciones registradas"
        mostrarCabeceraListado={true}
        columnas={['Estudiante', 'Institución y Tutor', 'Progreso', 'Fase', 'Estado', 'Acciones']}
      />
    )

    // Debe mostrar tanto el título principal como el título de la sección de la tabla (CabeceraListado)
    expect(screen.getByRole('heading', { level: 1, name: /estudiantes con asignación/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /listado de asignaciones/i })).toBeInTheDocument()
  })
})
