import { test, expect } from '@playwright/test';
import { USUARIOS, CARRERAS_FACULTAD, DATOS_PRUEBA } from './helpers/constantes';
import { crearContextoAutenticado } from './helpers/storage-state.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('07 - Fase 2: Aislamiento Multicarrera y Storage State (1 Estudiante por Carrera)', () => {

  test.beforeAll(async () => {
    // 1. Limpieza e inicialización completa de la base de datos
    await reiniciarBaseDeDatos();
  });

  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // CASO 1: AISLAMIENTO EN ASIGNACIÓN DE PRÁCTICAS PREPROFESIONALES (PP)
  // =========================================================================
  test('Caso 1: Coordinador de Carrera solo ve estudiantes y tutores de su propia carrera en PP', async ({ browser }) => {
    // 1.1 Coordinador de Sistemas entra a asignaciones
    const contextoSistemas = await crearContextoAutenticado(browser, 'COORDINADOR_SISTEMAS');
    const pageSistemas = await contextoSistemas.newPage();
    await pageSistemas.goto('/dashboard/practicas/asignaciones');
    await expect(pageSistemas.getByRole('heading', { name: /Asignación de Prácticas/i })).toBeVisible({ timeout: 10000 });

    // En la columna de estudiantes SOLO debe figurar la estudiante de Sistemas
    await expect(pageSistemas.getByText(USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto).first()).toBeVisible({ timeout: 8000 });
    await expect(pageSistemas.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto);
    await expect(pageSistemas.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto);
    await expect(pageSistemas.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_MECANICA.nombreCompleto);

    // En la columna de tutores SOLO debe figurar la tutora de Sistemas
    await expect(pageSistemas.getByText(USUARIOS.TUTOR_SISTEMAS.nombreCompleto).first()).toBeVisible({ timeout: 8000 });
    await expect(pageSistemas.locator('body')).not.toContainText(USUARIOS.TUTOR_1.nombreCompleto);
    await expect(pageSistemas.locator('body')).not.toContainText(USUARIOS.TUTOR_2.nombreCompleto);

    await contextoSistemas.close();

    // 1.2 Coordinador de Computación entra a asignaciones
    const contextoComputacion = await crearContextoAutenticado(browser, 'COORDINADOR');
    const pageComp = await contextoComputacion.newPage();
    await pageComp.goto('/dashboard/practicas/asignaciones');
    await expect(pageComp.getByRole('heading', { name: /Asignación de Prácticas/i })).toBeVisible({ timeout: 10000 });

    // En Computación SOLO debe figurar el estudiante de Computación
    await expect(pageComp.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first()).toBeVisible({ timeout: 8000 });
    await expect(pageComp.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto);
    await expect(pageComp.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto);

    await contextoComputacion.close();
  });

  // =========================================================================
  // CASO 2: AISLAMIENTO EN ASIGNACIÓN DE VINCULACIÓN CON LA SOCIEDAD (VCS)
  // =========================================================================
  test('Caso 2: Coordinador de Carrera solo ve estudiantes y proyectos de su propia carrera en VCS', async ({ browser }) => {
    // Coordinador de Civil entra a asignaciones de VCS
    const contextoCivil = await crearContextoAutenticado(browser, 'COORDINADOR_CIVIL');
    const pageCivil = await contextoCivil.newPage();
    await pageCivil.goto('/dashboard/vinculacion/asignaciones');
    await expect(pageCivil.getByRole('heading', { name: /Asignación a Proyectos Comunitarios/i })).toBeVisible({ timeout: 10000 });

    // En estudiantes disponibles SOLO debe figurar Ana María Martínez (Civil)
    await expect(pageCivil.getByText(USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto).first()).toBeVisible({ timeout: 8000 });
    await expect(pageCivil.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto);
    await expect(pageCivil.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto);

    // En proyectos comunitarios SOLO debe figurar el proyecto perteneciente a Civil
    await expect(pageCivil.getByText('Mejoramiento de Infraestructura Escolar Rural').first()).toBeVisible({ timeout: 8000 });
    await expect(pageCivil.locator('body')).not.toContainText(DATOS_PRUEBA.PROYECTO_VCS_BASE);
    await expect(pageCivil.locator('body')).not.toContainText('Huertos Urbanos Sostenibles');

    await contextoCivil.close();
  });

  // =========================================================================
  // CASO 3: AISLAMIENTO EN GESTIÓN DE TUTORES COMUNITARIOS DE VCS
  // =========================================================================
  test('Caso 3: Listado y modal de proyectos de tutor filtra estrictamente por carrera', async ({ browser }) => {
    const contextoSistemas = await crearContextoAutenticado(browser, 'COORDINADOR_SISTEMAS');
    const page = await contextoSistemas.newPage();
    await page.goto('/dashboard/vinculacion/tutores');
    await expect(page.getByRole('heading', { name: /Gestión de Tutores de Proyectos Comunitarios|Tutores/i }).first()).toBeVisible({ timeout: 10000 });

    // Tabla de tutores de Sistemas SOLO muestra a Gladys Patricia Caiza
    const filaTutora = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_SISTEMAS.nombreCompleto }).first();
    await expect(filaTutora).toBeVisible({ timeout: 8000 });
    await expect(page.locator('body')).not.toContainText(USUARIOS.TUTOR_1.nombreCompleto);
    await expect(page.locator('body')).not.toContainText(USUARIOS.TUTOR_CIVIL.nombreCompleto);

    // Al abrir el modal de asociación de proyectos, SOLO deben listarse proyectos de Sistemas
    const botonAsociar = filaTutora.getByRole('button', { name: /Asociar Proyectos/i }).or(filaTutora.getByTitle(/Asociar Proyectos/i));
    await botonAsociar.click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('heading', { name: /Asociar Proyectos/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Huertos Urbanos Sostenibles').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('dialog')).not.toContainText(DATOS_PRUEBA.PROYECTO_VCS_BASE);
    await expect(page.getByRole('dialog')).not.toContainText('Mejoramiento de Infraestructura Escolar Rural');

    await page.keyboard.press('Escape');
    await contextoSistemas.close();
  });

  // =========================================================================
  // CASO 4: AISLAMIENTO E INDEPENDENCIA DE LA MATRIZ CACES ENTRE CARRERAS
  // =========================================================================
  test('Caso 4: Directores gestionan únicamente la matriz de su carrera y Subdecana consolida las 5 carreras', async ({ browser }) => {
    // 4.1 Director de Computación solo ve la Matriz CACES de Computación
    const contextoComp = await crearContextoAutenticado(browser, 'DIRECTOR');
    const pageComp = await contextoComp.newPage();
    await pageComp.goto('/dashboard/practicas/matriz-caces');
    await expect(pageComp.getByRole('heading', { name: /Matriz CACES/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(pageComp.getByText(/Ingenier[ií]a en Computaci[oó]n/i).first()).toBeVisible({ timeout: 8000 });
    await expect(pageComp.locator('body')).not.toContainText('Ingenieria en Sistemas de Informacion');
    await contextoComp.close();

    // 4.2 Director de Sistemas solo ve la Matriz CACES de Sistemas
    const contextoSis = await crearContextoAutenticado(browser, 'DIRECTOR_SISTEMAS');
    const pageSis = await contextoSis.newPage();
    await pageSis.goto('/dashboard/practicas/matriz-caces');
    await expect(pageSis.getByRole('heading', { name: /Matriz CACES/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(pageSis.getByText(/Ingenier[ií]a en Sistemas de Informaci[oó]n/i).first()).toBeVisible({ timeout: 8000 });
    await expect(pageSis.locator('body')).not.toContainText('Ingenieria en Computacion');
    await contextoSis.close();

    // 4.3 Subdecana ve la vista consolidadora con las 5 carreras
    const contextoSub = await crearContextoAutenticado(browser, 'SUBDECANA');
    const pageSub = await contextoSub.newPage();
    await pageSub.goto('/dashboard/practicas/matriz-caces');
    await expect(pageSub.getByRole('heading', { name: /Matrices CACES/i }).first()).toBeVisible({ timeout: 10000 });

    // Deben figurar las filas correspondientes a las 5 carreras
    for (const carrera of CARRERAS_FACULTAD) {
      await expect(pageSub.locator('tr').filter({ hasText: new RegExp(carrera.nombre, 'i') }).first()).toBeVisible({ timeout: 6000 });
    }
    await contextoSub.close();
  });

  // =========================================================================
  // CASO 5: AISLAMIENTO DEL PORTAL DEL ESTUDIANTE EN LAS 5 CARRERAS
  // =========================================================================
  test('Caso 5: Cada estudiante visualiza su portal de prácticas según su carrera vía Storage State', async ({ browser }) => {
    const listaEstudiantes = [
      USUARIOS.ESTUDIANTE_PRINCIPAL,
      USUARIOS.ESTUDIANTE_SISTEMAS,
      USUARIOS.ESTUDIANTE_MECANICA,
      USUARIOS.ESTUDIANTE_CIVIL,
      USUARIOS.ESTUDIANTE_DISENIO,
    ];

    for (const est of listaEstudiantes) {
      const contexto = await crearContextoAutenticado(browser, { correo: est.correo, clave: est.clave });
      const page = await contexto.newPage();
      await page.goto('/dashboard/practicas/mi-practica');

      await expect(page.getByRole('heading', { name: /Mis Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });
      // Cada estudiante ve su portal inicial sin registros previos
      await expect(page.getByText(/No tienes prácticas preprofesionales asignadas|Sin registros/i)).toBeVisible({ timeout: 8000 });

      await contexto.close();
    }
  });

  // =========================================================================
  // CASO 6: ASIGNACIÓN MULTICARRERA CONCURRENTE SIN COLISIÓN DE DATOS
  // =========================================================================
  test('Caso 6: Asignación simultánea en Sistemas y Civil sin interferencia entre carreras', async ({ browser }) => {
    // 6.1 CPP de Sistemas asigna a María Fernanda Gómez
    const contextoSis = await crearContextoAutenticado(browser, 'COORDINADOR_SISTEMAS');
    const pageSis = await contextoSis.newPage();
    await pageSis.goto('/dashboard/practicas/asignaciones');
    await expect(pageSis.getByRole('heading', { name: /Asignación de Prácticas/i })).toBeVisible({ timeout: 10000 });

    await pageSis.getByText(USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto).first().click();
    await pageSis.getByText(/Google Ecuador/i).first().click();
    await pageSis.getByText(USUARIOS.TUTOR_SISTEMAS.nombreCompleto).first().click();
    await pageSis.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await pageSis.getByRole('dialog').getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(pageSis.getByText(/Se asign[oó] exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // 6.2 CPP de Civil asigna a Ana María Martínez
    const contextoCivil = await crearContextoAutenticado(browser, 'COORDINADOR_CIVIL');
    const pageCivil = await contextoCivil.newPage();
    await pageCivil.goto('/dashboard/practicas/asignaciones');
    await expect(pageCivil.getByRole('heading', { name: /Asignación de Prácticas/i })).toBeVisible({ timeout: 10000 });

    await pageCivil.getByText(USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto).first().click();
    await pageCivil.getByText(/Google Ecuador/i).first().click();
    await pageCivil.getByText(USUARIOS.TUTOR_CIVIL.nombreCompleto).first().click();
    await pageCivil.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await pageCivil.getByRole('dialog').getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(pageCivil.getByText(/Se asign[oó] exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // 6.3 Verificación de aislamiento en el listado de prácticas de cada carrera
    await pageSis.goto('/dashboard/practicas/estudiantes');
    await expect(pageSis.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto }).first()).toBeVisible({ timeout: 8000 });
    await expect(pageSis.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto);

    await pageCivil.goto('/dashboard/practicas/estudiantes');
    await expect(pageCivil.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_CIVIL.nombreCompleto }).first()).toBeVisible({ timeout: 8000 });
    await expect(pageCivil.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_SISTEMAS.nombreCompleto);

    await contextoSis.close();
    await contextoCivil.close();
  });

});
