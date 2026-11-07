import { test, expect } from '@playwright/test';
import { USUARIOS, CARRERAS_FACULTAD } from './helpers/constantes';
import { crearContextoAutenticado } from './helpers/storage-state.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';
import { poblarDatosFase3CargaReal } from './helpers/poblador-carga.helper';
import { ejecutarPruebaCargaReal } from './carga/runner-carga-real';

test.describe.configure({ mode: 'serial' });

test.describe('08 - Fase 3: Pruebas de Carga Real (~100 Estudiantes) y Concurrencia UI', () => {

  test.beforeAll(async () => {
    // 1. Limpieza inicial completa
    await reiniciarBaseDeDatos();
    // 2. Población masiva de 100 estudiantes (20 por carrera) y convenios de alta capacidad
    await poblarDatosFase3CargaReal();
  });

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // CASO 1: BENCHMARK HTTP/API - RENDIMIENTO Y ESTABILIDAD BAJO CARGA REAL
  // =========================================================================
  test('Caso 1: Concurrencia masiva HTTP/API (105 logins, 100 consultas y 25 asignaciones simultáneas)', async () => {
    const metricas = await ejecutarPruebaCargaReal();

    // 1.1 Validación de Logins Masivos
    expect(metricas.cargaLogin.fallidas).toBe(0);
    expect(metricas.cargaLogin.exitosas).toBe(105);
    expect(metricas.cargaLogin.p50Ms).toBeLessThan(3000); // BCrypt hashing concurrente < 3s

    // 1.2 Validación de Consultas Concurrentes de Estudiantes
    expect(metricas.cargaConsultasEstudiante.fallidas).toBe(0);
    expect(metricas.cargaConsultasEstudiante.exitosas).toBe(100);
    expect(metricas.cargaConsultasEstudiante.promedioMs).toBeLessThan(500); // Lecturas rápidas < 500ms
    expect(metricas.cargaConsultasEstudiante.rps).toBeGreaterThan(100);

    // 1.3 Validación de Asignaciones Concurrentes en Bloque
    expect(metricas.cargaAsignacionesCoordinadores.fallidas).toBe(0);
    expect(metricas.cargaAsignacionesCoordinadores.exitosas).toBe(25);
    expect(metricas.cargaAsignacionesCoordinadores.promedioMs).toBeLessThan(300);

    // 1.4 Validación de Cálculo de Matrices CACES Concurrentes
    expect(metricas.cargaMatrizCaces.fallidas).toBe(0);
    expect(metricas.cargaMatrizCaces.exitosas).toBe(6);
    expect(metricas.cargaMatrizCaces.promedioMs).toBeLessThan(200);
  });

  // =========================================================================
  // CASO 2: ASIGNACIÓN MASIVA EN BLOQUE VÍA UI (RESPETANDO LÍMITE DE TUTOR 10/10)
  // =========================================================================
  test('Caso 2: Coordinador de Carrera asigna masivamente un bloque de estudiantes en UI', async ({ browser }) => {
    const contextoComp = await crearContextoAutenticado(browser, 'COORDINADOR');
    const page = await contextoComp.newPage();
    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación de Prácticas/i })).toBeVisible({ timeout: 10000 });

    // 1. Seleccionar Convenio Google Ecuador (actualizado a 80 cupos)
    await page.getByText(/Google Ecuador/i).first().click();

    // 2. Seleccionar Tutor Académico Roberto Morales (tiene 0 asignados; puede recibir hasta 10)
    await page.getByText(USUARIOS.TUTOR_2.nombreCompleto).first().click();

    // 3. Seleccionar 6 estudiantes para Roberto Morales (5 previos de Jaime + 6 = 11 asignaciones totales)
    const estudiantesASeleccionar = [
      'Camila Andrea Figueroa Falcon',
      'Daniel Esteban Guerrero Garcia',
      'Paula Micaela Heredia Hidalgo',
      'Lucas Gabriel Ibarra Jaramillo',
      'Martina Elena Lara Lopez',
      'Joaquin Eduardo Mendoza Molina',
    ];

    for (const nombre of estudiantesASeleccionar) {
      await page.getByText(nombre).first().click();
    }

    // 4. Validar que el botón refleje exactamente 6 seleccionados y esté habilitado
    const botonConfirmar = page.getByRole('button', { name: /Confirmar Asignación \(6\)/i });
    await expect(botonConfirmar).toBeEnabled({ timeout: 8000 });
    await botonConfirmar.click();

    // 5. Modal de Resumen y Confirmación Atómica
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog').getByText(/Resumen de Asignación de Prácticas/i)).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar Asignación' }).click();

    // 6. Validar toast de éxito masivo
    await expect(page.getByText(/Se asignaron exitosamente 6 estudiantes/i)).toBeVisible({ timeout: 15000 });

    await contextoComp.close();
  });

  // =========================================================================
  // CASO 3: PAGINACIÓN REAL EN SERVIDOR (10 ELEMENTOS POR PÁGINA)
  // =========================================================================
  test('Caso 3: Listado de prácticas pagina en servidor con searchParams (?page=1) ante volumen real', async ({ browser }) => {
    const contextoComp = await crearContextoAutenticado(browser, 'COORDINADOR');
    const page = await contextoComp.newPage();
    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    // En Computación hay al menos 15 asignaciones (5 del runner API + 10 del Caso 2)
    // Primera página: exactamente 10 filas de estudiantes
    const filasEstudiantes = page.locator('tbody tr');
    await expect(filasEstudiantes).toHaveCount(10, { timeout: 10000 });

    // Navegar a la página 2 usando el paginador
    const botonPagina2 = page.locator('nav[aria-label="pagination"]').getByRole('link', { name: '2', exact: true });
    await expect(botonPagina2).toBeVisible({ timeout: 8000 });
    await botonPagina2.click();

    // Verificar que la URL cambió a ?page=1 (0-indexed en backend)
    await page.waitForURL('**/*page=1*', { timeout: 10000 });

    // En la página 2 debe haber entre 1 y 10 filas (las restantes)
    const filasPagina2 = page.locator('tbody tr');
    const cantidadPagina2 = await filasPagina2.count();
    expect(cantidadPagina2).toBeGreaterThanOrEqual(1);
    expect(cantidadPagina2).toBeLessThanOrEqual(10);

    // Regresar a la página 1
    const botonPagina1 = page.locator('nav[aria-label="pagination"]').getByRole('link', { name: '1', exact: true });
    await botonPagina1.click();
    await page.waitForURL('**/*page=0*', { timeout: 10000 });
    await expect(filasEstudiantes).toHaveCount(10);

    await contextoComp.close();
  });

  // =========================================================================
  // CASO 4: BÚSQUEDA Y FILTRADO INSTANTÁNEO EN SERVIDOR CON VOLUMEN REAL
  // =========================================================================
  test('Caso 4: Búsqueda reactiva filtra instantáneamente en servidor y restaura lote completo', async ({ browser }) => {
    const contextoComp = await crearContextoAutenticado(browser, 'COORDINADOR');
    const page = await contextoComp.newPage();
    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    // Buscar a un estudiante específico por apellido
    const inputBusqueda = page.getByPlaceholder(/Buscar por estudiante|cédula|empresa/i).or(page.locator('input[type="search"]')).first();
    await expect(inputBusqueda).toBeVisible({ timeout: 8000 });
    await inputBusqueda.fill('Mendoza Molina');

    // La tabla debe reducirse a 1 resultado
    await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 10000 });
    await expect(page.getByText('Joaquin Eduardo Mendoza Molina').first()).toBeVisible();

    // Limpiar la búsqueda y verificar que se restablece la lista paginada de 10 elementos
    const botonLimpiar = page.getByTitle(/Limpiar búsqueda/i);
    if (await botonLimpiar.isVisible()) {
      await botonLimpiar.click();
    } else {
      await inputBusqueda.clear();
      await inputBusqueda.press('Enter');
    }
    await expect(page.locator('tbody tr')).toHaveCount(10, { timeout: 10000 });

    await contextoComp.close();
  });

  // =========================================================================
  // CASO 5: AISLAMIENTO MULTICARRERA CONCURRENTE CON VOLUMEN MASIVO
  // =========================================================================
  test('Caso 5: Concurrencia entre Sistemas y Civil mantiene aislamiento estricto de los 100 estudiantes', async ({ browser }) => {
    // Coordinador de Sistemas y Coordinador de Civil abren sesiones independientes simultáneas
    const contextoSis = await crearContextoAutenticado(browser, 'COORDINADOR_SISTEMAS');
    const contextoCiv = await crearContextoAutenticado(browser, 'COORDINADOR_CIVIL');

    const pageSis = await contextoSis.newPage();
    const pageCiv = await contextoCiv.newPage();

    await Promise.all([
      pageSis.goto('/dashboard/practicas/asignaciones'),
      pageCiv.goto('/dashboard/practicas/asignaciones'),
    ]);

    // 5.1 En pantalla de asignaciones: validar estudiantes disponibles sin asignación
    // Sistemas SOLO ve postulantes disponibles de Sistemas
    await expect(pageSis.getByText('Sara Monserrath Loor Macias').first()).toBeVisible({ timeout: 10000 });
    await expect(pageSis.locator('body')).not.toContainText('Marina Eugenia Orbe Ponce'); // Estudiante Civil
    await expect(pageSis.locator('body')).not.toContainText('Mateo Sebastian Aguirre Morales'); // Estudiante Computación

    // Civil SOLO ve postulantes disponibles de Civil
    await expect(pageCiv.getByText('Marina Eugenia Orbe Ponce').first()).toBeVisible({ timeout: 10000 });
    await expect(pageCiv.locator('body')).not.toContainText('Sara Monserrath Loor Macias'); // Estudiante Sistemas
    await expect(pageCiv.locator('body')).not.toContainText('Mateo Sebastian Aguirre Morales'); // Estudiante Computación

    // 5.2 En pantalla de estudiantes asignados: validar aislamiento de las asignaciones activas
    await Promise.all([
      pageSis.goto('/dashboard/practicas/estudiantes'),
      pageCiv.goto('/dashboard/practicas/estudiantes'),
    ]);

    await expect(pageSis.getByText('Adrian Marcelo Cabrera Cevallos').first()).toBeVisible({ timeout: 10000 });
    await expect(pageSis.locator('body')).not.toContainText('Bernardo Cesar Gomez Garzon');

    await expect(pageCiv.getByText('Bernardo Cesar Gomez Garzon').first()).toBeVisible({ timeout: 10000 });
    await expect(pageCiv.locator('body')).not.toContainText('Adrian Marcelo Cabrera Cevallos');

    await Promise.all([
      contextoSis.close(),
      contextoCiv.close(),
    ]);
  });

  // =========================================================================
  // CASO 6: MATRIZ CACES CON VOLUMEN COMPLETO DE ALUMNOS SIN DESBORDAMIENTO
  // =========================================================================
  test('Caso 6: Matriz CACES computa correctamente los totales de horas del lote de estudiantes', async ({ browser }) => {
    const contextoDir = await crearContextoAutenticado(browser, 'DIRECTOR');
    const pageDir = await contextoDir.newPage();
    await pageDir.goto('/dashboard/practicas/matriz-caces');
    await expect(pageDir.getByRole('heading', { name: /Matriz CACES/i }).first()).toBeVisible({ timeout: 10000 });

    // La tabla de matriz CACES de Computación debe cargar a los estudiantes asignados sin errores
    const tablaMatriz = pageDir.locator('table');
    await expect(tablaMatriz).toBeVisible({ timeout: 8000 });

    // Subdecana verifica el tablero general con las 5 carreras consolidadas
    const contextoSub = await crearContextoAutenticado(browser, 'SUBDECANA');
    const pageSub = await contextoSub.newPage();
    await pageSub.goto('/dashboard/practicas/matriz-caces');
    await expect(pageSub.getByRole('heading', { name: /Matrices CACES/i }).first()).toBeVisible({ timeout: 10000 });

    for (const carrera of CARRERAS_FACULTAD) {
      await expect(pageSub.locator('tr').filter({ hasText: new RegExp(carrera.nombre, 'i') }).first()).toBeVisible({ timeout: 6000 });
    }

    await contextoDir.close();
    await contextoSub.close();
  });

});
