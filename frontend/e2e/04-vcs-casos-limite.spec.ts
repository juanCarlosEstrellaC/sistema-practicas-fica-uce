import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_ARCHIVO_INVALIDO } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('04 - VCS: Casos Límite, Validaciones y Manejo de Errores (Edge Cases)', () => {

  test.beforeAll(async () => {
    await reiniciarBaseDeDatos();
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // CASO 1: TUTOR INTENTA INICIAR PROYECTO SIN ESTUDIANTES ASIGNADOS
  // =========================================================================
  test('Caso 1: Error al intentar iniciar proyecto comunitario con 0 estudiantes asignados', async ({ page }) => {
    // 1. Subdecana crea un proyecto comunitario vacío
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    const nombreProyectoVacio = 'Proyecto Sin Estudiantes E2E';
    await page.locator('#nombre').fill(nombreProyectoVacio);
    await page.locator('#carreraId').click();
    await page.getByRole('option', { name: /Computaci[oó]n/i }).first().click();
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.getByRole('button', { name: /Crear Proyecto/i }).click();
    await expect(page.getByText(/Proyecto comunitario creado (con éxito|exitosamente)/i)).toBeVisible({ timeout: 10000 });

    // 2. Coordinador asocia el proyecto al Tutor Jaime Oswaldo Salvador
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/tutores');
    const filaTutor = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_1.nombreCompleto }).first();
    await filaTutor.getByRole('button', { name: /Asociar Proyectos/i }).or(filaTutor.getByTitle(/Asociar Proyectos/i)).click();
    await page.getByText(nombreProyectoVacio).first().click();
    await page.getByRole('button', { name: /Guardar Asignación|Guardar Asociaciones/i }).click();
    await expect(page.getByText(/Proyectos asociados.*éxito|Proyectos asociados correctamente/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Tutor intenta iniciar el proyecto sin haber asignado ningun estudiante
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');
    const filaProyecto = page.locator('tr').filter({ hasText: nombreProyectoVacio }).first();
    await filaProyecto.getByRole('button', { name: /Iniciar proyecto/i }).click();

    // Debe mostrar error de validacion de estudiantes requeridos
    await expect(page.getByText(/El proyecto no tiene estudiantes asignados para iniciar|No se pudo iniciar el proyecto/i)).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // CASO 2: LÍMITE MÁXIMO DE 2 PROYECTOS POR TUTOR ACADÉMICO
  // =========================================================================
  test('Caso 2: Bloqueo al intentar asociar más de 2 proyectos a un mismo Tutor', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/tutores');

    const filaTutor = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_1.nombreCompleto }).first();
    await filaTutor.getByRole('button', { name: /Asociar Proyectos/i }).or(filaTutor.getByTitle(/Asociar Proyectos/i)).click();

    await expect(page.getByText(/Asociar Proyectos a Tutor Académico/i)).toBeVisible();

    // Intentamos seleccionar proyectos hasta superar el limite de 2
    const elementosProyecto = page.locator('div[role="dialog"] .space-y-2 > div');
    const cantidadDisponibles = await elementosProyecto.count();

    if (cantidadDisponibles >= 3) {
      // Si ya hay 2 seleccionados, intentar hacer click en el tercero
      await elementosProyecto.nth(2).click();
      await expect(page.getByText(/Un tutor académico no puede tener más de 2 proyectos asociados/i)).toBeVisible({ timeout: 6000 });
    }

    await page.getByRole('button', { name: /Cancelar/i }).click();
  });

  // =========================================================================
  // CASO 3: TRASPASO DE PROYECTO ENTRE TUTORES CON BLOQUEO PREVIO
  // =========================================================================
  test('Caso 3: Advertencia al seleccionar proyecto asignado a otro tutor y flujo de traspaso', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/tutores');

    // Intentar asociar al Tutor 2 (Roberto Morales) un proyecto que ya tiene Tutor 1
    const filaTutor2 = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_2.nombreCompleto }).first();
    await filaTutor2.getByRole('button', { name: /Asociar Proyectos/i }).or(filaTutor2.getByTitle(/Asociar Proyectos/i)).click();

    await expect(page.getByText(/Asociar Proyectos a Tutor Académico/i)).toBeVisible();

    // Clic en proyecto asignado a Tutor 1
    const proyectoOcupado = page.locator('div[role="dialog"]').getByText(/Jaime Oswaldo Salvador/i).first();
    if (await proyectoOcupado.isVisible()) {
      await proyectoOcupado.click();
      await expect(page.getByText(/El proyecto ya está asignado al tutor.*Debe quitarle la asignación/i)).toBeVisible({ timeout: 6000 });
    }

    await page.getByRole('button', { name: /Cancelar/i }).click();
  });

  // =========================================================================
  // CASO 4: CONTROL DE HORAS FUERA DE RANGO EN ASIGNACIÓN VCS
  // =========================================================================
  test('Caso 4: Control de horas fuera de rango (0 o >160h) en formulario de VCS', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación (a|de) Proyectos Comunitarios/i }).first()).toBeVisible({ timeout: 10000 });

    // Seleccionar estudiante secundario
    const itemEstudiante = page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first();
    await expect(itemEstudiante).toBeVisible({ timeout: 8000 });
    await itemEstudiante.click();

    const inputHoras = page.getByRole('spinbutton').first();
    await expect(inputHoras).toBeVisible();

    // Horas > 160
    await inputHoras.fill('200');
    const botonConfirmar = page.getByRole('button', { name: /Confirmar Asignación/i });
    await expect(botonConfirmar).toBeDisabled();

    // Horas <= 0
    await inputHoras.fill('0');
    await expect(botonConfirmar).toBeDisabled();
  });

  // =========================================================================
  // CASO 5: CANCELACIÓN DE ASIGNACIÓN VCS Y VERIFICACIÓN DE ESTADO
  // =========================================================================
  test('Caso 5: Cancelación de asignación VCS en curso por parte de Coordinación', async ({ page }) => {
    // 1. Coordinador asigna estudiante secundario a un proyecto activo por 80h
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/asignaciones');

    await page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first().click();
    const primerProyecto = page.locator('.cursor-pointer').filter({ hasText: /ACTIVO/i }).first();
    await primerProyecto.click();

    const inputHoras = page.getByRole('spinbutton').first();
    await inputHoras.fill('80');

    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: /Confirmar y Guardar|Confirmar Asignación/i }).last().click();
    await expect(page.getByText(/Asignación creada con éxito|Estudiantes asignados correctamente|Se asigno exitosamente/i).first()).toBeVisible({ timeout: 12000 });

    // 2. Cancelar la asignacion en la tabla de asignaciones
    await page.goto('/dashboard/vinculacion/asignaciones-existentes');
    await expect(page.getByRole('heading', { name: /Asignaciones de Proyectos Comunitarios|Estudiantes Asignados/i }).first()).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });

    const botonCancelar = filaEstudiante.getByRole('button', { name: /Cancelar asignación/i }).or(filaEstudiante.getByTitle(/Cancelar asignación/i));
    await expect(botonCancelar).toBeVisible();
    await botonCancelar.click();

    // Confirmar en ModalCancelarAsignacionVcs
    await expect(page.getByText(/¿Está seguro de cancelar esta asignación\?/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Cancelación/i }).click();

    await expect(page.getByText(/Asignación cancelada con éxito/i)).toBeVisible({ timeout: 10000 });
    await expect(filaEstudiante.getByText(/CANCELADO/i)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // CASO 6: REPROBACIÓN DE ASIGNACIÓN VCS POR TUTOR ACADÉMICO
  // =========================================================================
  test('Caso 6: Tutor Académico reprueba asignación VCS a estudiante secundario', async ({ page }) => {
    // 1. Asignar nuevamente para tener una asignacion en curso
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first().click();
    await page.locator('.cursor-pointer').filter({ hasText: /ACTIVO/i }).first().click();
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: /Confirmar y Guardar|Confirmar Asignación/i }).last().click();
    await expect(page.getByText(/Asignación creada con éxito|Estudiantes asignados correctamente|Se asigno exitosamente/i).first()).toBeVisible({ timeout: 12000 });

    // 2. Tutor Academico inicia sesion y reprueba
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/vinculacion/asignaciones-existentes');

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });

    const botonReprobar = filaEstudiante.getByRole('button', { name: /Reprobar/i });
    await expect(botonReprobar).toBeVisible();
    await botonReprobar.click();

    // Confirmar en ModalReprobarAsignacionVcs
    await expect(page.getByText(/¿Está seguro de reprobar esta asignación\?/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Reprobación/i }).click();

    await expect(page.getByText(/Asignación reprobada con éxito/i)).toBeVisible({ timeout: 10000 });
    await expect(filaEstudiante.getByText(/REPROBADO/i)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // CASO 7: PROTECCIÓN RBAC EN RUTAS ADMINISTRATIVAS DE VINCULACIÓN
  // =========================================================================
  test('Caso 7: Estudiante es redirigido automáticamente fuera de pantallas administrativas de VCS', async ({ page }) => {
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');

    // Intento de acceso a asignaciones VCS
    await page.goto('/dashboard/vinculacion/asignaciones');
    await expect(page).toHaveURL(/\/dashboard\/vinculacion\/mi-proyecto/, { timeout: 8000 });
  });

});
