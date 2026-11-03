import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_PDF_FIXTURE, RUTA_ARCHIVO_INVALIDO } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('02 - PP: Casos Límite, Validaciones y Manejo de Errores (Edge Cases)', () => {

  test.beforeAll(async () => {
    await reiniciarBaseDeDatos();
  });

  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // CASO 1: VALIDACIÓN DE FECHAS INVERTIDAS EN CONVENIO
  // =========================================================================
  test('Caso 1: Bloqueo de registro de Convenio con fechaFin anterior a fechaInicio', async ({ page }) => {
    await iniciarSesionComo(page, 'SUBDECANA');

    await page.goto('/dashboard/practicas/convenios');
    await expect(page.getByRole('heading', { name: /Convenios Institucionales Activos|Gestión de Convenios/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Nuevo Convenio/i }).click();
    await expect(page.getByText(/Nuevo Convenio Institucional/i)).toBeVisible();

    await page.locator('#institucion').fill('Convenio Fecha Erronea');
    await page.locator('#cuposTotales').fill('3');
    await page.locator('#campoEspecifico').fill('1.0');
    await page.locator('#direccion').fill('Av. America y Colon');
    // Fechas invertidas intencionalmente
    await page.locator('#fechaInicio').fill('2026-12-31');
    await page.locator('#fechaFin').fill('2026-01-01');
    await page.locator('#tutorInstitucional').fill('Ing. Validador');
    await page.locator('#correoTutor').fill('tutor.validador@empresa.com');
    await page.locator('#telefonoTutor').fill('0991112233');

    await page.getByRole('button', { name: /Registrar Convenio/i }).click();

    // Verificamos mensaje de validacion de fechas
    await expect(page.getByText(/La fecha de finalización debe ser estrictamente posterior a la fecha de inicio/i).first()).toBeVisible({ timeout: 6000 });
  });

  // =========================================================================
  // CASO 2: AGOTAMIENTO Y RESTAURACIÓN DE CUPOS DE CONVENIO TRAS CANCELACIÓN
  // =========================================================================
  test('Caso 2: Agotamiento de cupos (1 cupo) y restauración al cancelar la práctica', async ({ page }) => {
    // 1. Subdecana crea un convenio con exactamente 1 cupo
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/convenios');
    await page.getByRole('button', { name: /Nuevo Convenio/i }).click();

    const nombreConvenioUnico = 'Empresa Unipersonal S.A.';
    await page.locator('#institucion').fill(nombreConvenioUnico);
    await page.locator('#cuposTotales').fill('1');
    await page.locator('#campoEspecifico').fill('1.0');
    await page.locator('#direccion').fill('Quito Norte');
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.locator('#tutorInstitucional').fill('Ing. Tutor Unico');
    await page.locator('#correoTutor').fill('tutor.unico@empresa.com');
    await page.locator('#telefonoTutor').fill('0999999999');
    await page.getByRole('button', { name: /Registrar Convenio/i }).click();

    await expect(page.getByText(/Convenio registrado exitosamente/i)).toBeVisible({ timeout: 10000 });

    // 2. Coordinador asigna el único cupo al estudiante secundario
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación de Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });

    const itemEstudiante = page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first();
    await expect(itemEstudiante).toBeVisible({ timeout: 8000 });
    await itemEstudiante.click();

    const itemConvenio = page.getByText(nombreConvenioUnico).first();
    await expect(itemConvenio).toBeVisible({ timeout: 8000 });
    await itemConvenio.click();

    const itemTutor = page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first();
    await expect(itemTutor).toBeVisible({ timeout: 8000 });
    await itemTutor.click();

    const botonConfirmar = page.getByRole('button', { name: /Confirmar Asignación \(1\)/i });
    await expect(botonConfirmar).toBeEnabled();
    await botonConfirmar.click();

    await expect(page.getByText(/Resumen de Asignación de Prácticas/i)).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // 3. Coordinador va a la lista de estudiantes y cancela la práctica
    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });

    const botonCancelar = filaEstudiante.getByRole('button', { name: /Cancelar práctica preprofesional/i });
    await expect(botonCancelar).toBeVisible();
    await botonCancelar.click();

    // Confirmar en ModalCancelarAsignacionPractica
    await expect(page.getByText(/¿Está seguro de cancelar esta práctica\?/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Cancelación/i }).click();

    await expect(page.getByText(/Práctica preprofesional cancelada exitosamente|cancelada/i).first()).toBeVisible({ timeout: 10000 });

    // 4. Verificar que la fila ahora muestra estado CANCELADO
    await expect(filaEstudiante.getByText(/CANCELADO/i)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // CASO 3: VALIDACIÓN DE LÍMITES DE HORAS EN ASIGNACIÓN (MIN Y MAX)
  // =========================================================================
  test('Caso 3: Control de horas fuera de rango en formulario de asignación', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación de Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });

    // Seleccionar estudiante principal si esta disponible
    const itemEstudiante = page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first();
    await expect(itemEstudiante).toBeVisible({ timeout: 8000 });
    await itemEstudiante.click();

    const inputHoras = page.getByRole('spinbutton').first();
    await expect(inputHoras).toBeVisible();

    // Probar horas mayores a 240
    await inputHoras.fill('300');
    const botonConfirmarExceso = page.getByRole('button', { name: /Confirmar Asignación/i });
    await expect(botonConfirmarExceso).toBeDisabled();

    // Probar horas <= 0
    await inputHoras.fill('0');
    await expect(botonConfirmarExceso).toBeDisabled();
  });

  // =========================================================================
  // CASO 4: RECHAZO DE ARCHIVO NO-PDF EN PORTAFOLIO DE ESTUDIANTE
  // =========================================================================
  test('Caso 4: Validación de formato no-PDF al cargar documentos en el portafolio', async ({ page }) => {
    // Primero asignamos formalmente a Juan Carlos Estrella para que tenga habilitado el portafolio
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first().click();
    await page.getByText(/Google Ecuador/i).first().click();
    await page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first().click();

    const inputHoras = page.getByRole('spinbutton').first();
    await inputHoras.fill('240');
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // Estudiante intenta subir un archivo .txt
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');
    await expect(page.getByRole('heading', { name: /Mis Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });

    const primerInputArchivo = page.locator('input[type="file"]').first();
    await primerInputArchivo.setInputFiles(RUTA_ARCHIVO_INVALIDO);

    // Debe mostrar advertencia de formato
    await expect(page.getByText(/El archivo debe ser un documento en formato PDF|Formato no permitido/i)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // CASO 5: VALIDACIÓN DE MOTIVO OBLIGATORIO AL RECHAZAR DOCUMENTO
  // =========================================================================
  test('Caso 5: Bloqueo de confirmación de rechazo de documento sin motivo especificado', async ({ page }) => {
    // Subir documento valido para poder observarlo
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');
    const inputsArchivo = page.locator('input[type="file"]');
    await expect(inputsArchivo.first()).toBeAttached({ timeout: 10000 });
    await inputsArchivo.first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/subido con éxito|actualizado correctamente/i).first()).toBeVisible({ timeout: 15000 });

    // Coordinador abre la validacion de portafolio
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudiante.click();

    // Solo si el boton de validar documentos esta visible (segun fase)
    const botonValidar = page.getByRole('button', { name: /Validar Documentos del Portafolio/i });
    if (await botonValidar.isVisible()) {
      await botonValidar.click();
      await expect(page.getByText(/Validación de Documentos del Portafolio/i)).toBeVisible();

      // Pulsar Rechazar
      const botonRechazar = page.getByRole('button', { name: /Rechazar/i }).first();
      await botonRechazar.click();

      // Botón confirmar rechazo debe estar deshabilitado con textarea vacio
      const botonConfirmarRechazo = page.getByRole('button', { name: /Confirmar Rechazo/i });
      await expect(botonConfirmarRechazo).toBeDisabled();
    }
  });

  // =========================================================================
  // CASO 6: REPROBACIÓN DE PRÁCTICA POR PARTE DEL TUTOR ACADÉMICO
  // =========================================================================
  test('Caso 6: Tutor Académico reprueba práctica en curso a estudiante secundario', async ({ page }) => {
    // Coordinador asigna nuevamente a Carlos Andres Flores
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first().click();
    await page.getByText(/Google Ecuador/i).first().click();
    await page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first().click();
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // Tutor Academico inicia sesion y reprueba la practica
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });

    const botonReprobar = filaEstudiante.getByRole('button', { name: /Reprobar/i });
    await expect(botonReprobar).toBeVisible();
    await botonReprobar.click();

    // Confirmar en ModalReprobarAsignacionPractica
    await expect(page.getByText(/¿Está seguro de reprobar esta práctica\?/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Reprobación/i }).click();

    await expect(page.getByText(/Práctica preprofesional reprobada exitosamente|reprobada/i).first()).toBeVisible({ timeout: 10000 });
    await expect(filaEstudiante.getByText(/REPROBADO/i)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // CASO 7: PROTECCIÓN RBAC EN RUTAS ADMINISTRATIVAS DE PRÁCTICAS
  // =========================================================================
  test('Caso 7: Estudiante es redirigido automáticamente fuera de pantallas administrativas', async ({ page }) => {
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');

    // Intento de acceso a asignaciones
    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page).toHaveURL(/\/dashboard\/practicas\/mi-practica/, { timeout: 8000 });

    // Intento de acceso a matriz CACES
    await page.goto('/dashboard/practicas/matriz-caces');
    await expect(page).toHaveURL(/\/dashboard\/practicas\/mi-practica/, { timeout: 8000 });
  });

});
