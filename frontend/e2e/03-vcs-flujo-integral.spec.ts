import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_PDF_FIXTURE } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('03 - VCS: Flujo Integral de Vinculación con la Sociedad y Reportes (Happy Path)', () => {

  test.beforeAll(async () => {
    await reiniciarBaseDeDatos();
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // PASO 1: SUBDECANA CREA PROYECTO COMUNITARIO ACTIVO
  // =========================================================================
  test('Paso 1: Subdecana crea y activa Proyecto Comunitario para Computación', async ({ page }) => {
    await iniciarSesionComo(page, 'SUBDECANA');

    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');
    await expect(page.getByRole('heading', { name: 'Gestión de Proyectos Comunitarios' })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    await expect(page.getByText(/Nuevo Proyecto Comunitario/i)).toBeVisible();

    await page.locator('#nombre').fill(DATOS_PRUEBA.PROYECTO_VCS_NUEVO);

    // Seleccionar Carrera Computación
    await page.locator('#carreraId').click();
    await page.getByRole('option', { name: /Computaci[oó]n/i }).first().click();

    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.locator('#descripcion').fill('Proyecto integral de vinculación para desarrollo de software comunitario.');

    await page.getByRole('button', { name: /Crear Proyecto/i }).click();

    await expect(page.getByText(/Proyecto comunitario creado exitosamente|creado con éxito/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(DATOS_PRUEBA.PROYECTO_VCS_NUEVO).first()).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // PASO 2: COORDINADOR ASOCIA PROYECTO A TUTOR ACADÉMICO
  // =========================================================================
  test('Paso 2: Coordinador asocia el proyecto al Tutor Jaime Oswaldo Salvador', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');

    await page.goto('/dashboard/vinculacion/tutores');
    await expect(page.getByRole('heading', { name: /Carga Académica de Tutores|Tutores Académicos/i }).first()).toBeVisible({ timeout: 10000 });

    // Localizar fila del tutor Jaime Oswaldo Salvador
    const filaTutor = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_1.nombreCompleto }).first();
    await expect(filaTutor).toBeVisible({ timeout: 8000 });

    // Abrir modal de asignación de proyectos
    const botonAsociar = filaTutor.getByRole('button', { name: /Asociar Proyectos|Gestionar Proyectos/i }).or(filaTutor.getByTitle(/Asociar Proyectos/i));
    await botonAsociar.click();

    await expect(page.getByText(/Asociar Proyectos a Tutor Académico/i)).toBeVisible();

    // Seleccionar el proyecto creado
    const itemProyecto = page.getByText(DATOS_PRUEBA.PROYECTO_VCS_NUEVO).first();
    await expect(itemProyecto).toBeVisible({ timeout: 8000 });
    await itemProyecto.click();

    await page.getByRole('button', { name: /Guardar Asignación|Guardar Asociaciones/i }).click();
    await expect(page.getByText(/Proyectos asociados.*éxito|Proyectos asociados correctamente/i).first()).toBeVisible({ timeout: 10000 });
    await expect(filaTutor.getByText(DATOS_PRUEBA.PROYECTO_VCS_NUEVO)).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // PASO 3: COORDINADOR ASIGNA ESTUDIANTE A PROYECTO POR 160 HORAS
  // =========================================================================
  test('Paso 3: Coordinador asigna estudiante principal por 160h', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');

    await page.goto('/dashboard/vinculacion/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación (a|de) Proyectos Comunitarios/i }).first()).toBeVisible({ timeout: 10000 });

    // 1. Seleccionar Juan Carlos Estrella
    const itemEstudiante = page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first();
    await expect(itemEstudiante).toBeVisible({ timeout: 8000 });
    await itemEstudiante.click();

    // 2. Seleccionar el proyecto Comunitario
    const itemProyectoVcs = page.getByText(DATOS_PRUEBA.PROYECTO_VCS_NUEVO).first();
    await expect(itemProyectoVcs).toBeVisible({ timeout: 8000 });
    await itemProyectoVcs.click();

    // 3. Escribir 160 horas requeridas de vinculación
    const inputHoras = page.getByRole('spinbutton').first();
    await expect(inputHoras).toBeVisible();
    await inputHoras.fill('160');

    // 4. Confirmar asignacion en modal de resumen
    const botonConfirmar = page.getByRole('button', { name: /Confirmar Asignación \(1\)/i });
    await expect(botonConfirmar).toBeEnabled();
    await botonConfirmar.click();

    await expect(page.getByText(/Resumen de Asignación/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar y Guardar|Confirmar Asignación/i }).last().click();

    await expect(page.getByText(/Asignación creada con éxito|Estudiantes asignados correctamente|Se asigno exitosamente/i).first()).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 4: TUTOR ACADÉMICO INICIA PROYECTO (HABILITA FASE DE DESARROLLO)
  // =========================================================================
  test('Paso 4: Tutor Académico inicia el proyecto cambiando fase a Desarrollo', async ({ page }) => {
    await iniciarSesionComo(page, 'TUTOR_1');

    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');
    await expect(page.getByRole('heading', { name: 'Gestión de Proyectos Comunitarios' }).first()).toBeVisible({ timeout: 10000 });

    const filaProyecto = page.locator('tr').filter({ hasText: DATOS_PRUEBA.PROYECTO_VCS_NUEVO }).first();
    await expect(filaProyecto).toBeVisible({ timeout: 8000 });

    // Botón Iniciar proyecto
    const botonIniciar = filaProyecto.getByRole('button', { name: /Iniciar proyecto/i });
    await expect(botonIniciar).toBeVisible({ timeout: 8000 });
    await botonIniciar.click();

    await expect(page.getByText(/Proyecto iniciado con éxito|Estudiantes en fase de desarrollo/i)).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // PASO 5: ESTUDIANTE SUBE BITÁCORA E INFORME FINAL DE VCS
  // =========================================================================
  test('Paso 5: Estudiante carga Bitácora e Informe Final en su portafolio VCS', async ({ page }) => {
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');

    await page.goto('/dashboard/vinculacion/mi-proyecto');
    await expect(page.getByRole('heading', { name: /Mis Proyectos Comunitarios|Mis Proyectos/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(DATOS_PRUEBA.PROYECTO_VCS_NUEVO).first()).toBeVisible({ timeout: 8000 });

    // Subir los 2 documentos PDF obligatorios (Bitácora e Informe Final)
    const itemBitacora = page.locator('.p-4.rounded-xl').filter({ hasText: '1. Bitácora' }).first();
    await itemBitacora.locator('input[type="file"]').first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(itemBitacora.getByText('En Revisión por Tutor')).toBeVisible({ timeout: 15000 });

    const itemInforme = page.locator('.p-4.rounded-xl').filter({ hasText: '2. Informe Final' }).first();
    await itemInforme.locator('input[type="file"]').first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(itemInforme.getByText('En Revisión por Tutor')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // PASO 6: TUTOR ACADÉMICO APRUEBA EVIDENCIAS Y REMITE A SUBDECANATO
  // =========================================================================
  test('Paso 6: Tutor Académico valida evidencias y remite a Subdecanato', async ({ page }) => {
    await iniciarSesionComo(page, 'TUTOR_1');

    await page.goto('/dashboard/vinculacion/asignaciones-existentes');
    await expect(page.getByRole('heading', { name: /Asignaciones de Proyectos Comunitarios|Estudiantes Asignados/i }).first()).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });
    await filaEstudiante.click();

    // Abrir modal de validación de evidencias
    const botonValidar = page.getByRole('button', { name: /Validar Documentos del Portafolio/i });
    await expect(botonValidar).toBeVisible({ timeout: 8000 });
    await botonValidar.click();

    await expect(page.getByText(/Validación de Documentos/i).first()).toBeVisible();

    // Validar y aprobar ambos documentos (Bitácora e Informe Final)
    const botonAprobar = page.getByRole('button', { name: /Validar y Aprobar/i });
    await expect(botonAprobar).toBeEnabled({ timeout: 10000 });
    await botonAprobar.click();
    await expect(page.getByText(/Documento validado y aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });

    // Si no avanzo automaticamente, seleccionar segundo documento en la barra lateral
    const botonDocInforme = page.locator('div.w-64 button').filter({ hasText: /Informe Final/i });
    if (await botonDocInforme.isVisible()) {
      await botonDocInforme.click();
    }

    await expect(botonAprobar).toBeEnabled({ timeout: 10000 });
    await botonAprobar.click();
    await expect(page.getByText(/Documento validado y aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });

    // Terminar validación y enviar a Subdecanato
    const botonTerminar = page.getByRole('button', { name: /Terminar validación y enviar a Subdecanato/i });
    await expect(botonTerminar).toBeEnabled({ timeout: 10000 });
    await botonTerminar.click();

    await expect(page.getByText(/Documentos validados y (remitidos|enviados) a Subdecanato|enviado con éxito/i).first()).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // PASO 7: SUBDECANA APRUEBA HORAS Y EMITE CERTIFICADO DE VINCULACIÓN
  // =========================================================================
  test('Paso 7: Subdecana aprueba las 160h y emite el Certificado oficial de VCS', async ({ page }) => {
    await iniciarSesionComo(page, 'SUBDECANA');

    await page.goto('/dashboard/vinculacion/asignaciones-existentes');
    await expect(page.getByRole('heading', { name: /Asignaciones de Proyectos Comunitarios|Estudiantes Asignados/i }).first()).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudiante.click();

    const botonEmitirCertificado = page.getByRole('button', { name: /Previsualizar y Emitir Certificado de Horas/i });
    await expect(botonEmitirCertificado).toBeVisible({ timeout: 8000 });
    await botonEmitirCertificado.click();

    await expect(page.getByText(/Validación de Horas y Emisión de Certificado de Vinculación/i)).toBeVisible();

    // Modal sin FirmaEC
    const botonSinFirma = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirma.isVisible()) {
      await botonSinFirma.click();
    }

    const inputCertificadoFirmado = page.locator('#upload-cert-firmado').or(page.locator('input[type="file"]')).first();
    await inputCertificadoFirmado.setInputFiles(RUTA_PDF_FIXTURE);

    const botonAprobar = page.getByRole('button', { name: /Aprobar y Enviar Certificado Firmado/i });
    await expect(botonAprobar).toBeEnabled({ timeout: 8000 });
    await botonAprobar.click();

    await expect(page.getByText(/Certificado.*convalidado.*horas acreditadas|horas acreditadas exitosamente/i)).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 8: CICLO DE REPORTES DE PROYECTO (CPP SUBE Y SUBDECANA APRUEBA)
  // =========================================================================
  test('Paso 8: Coordinador sube Reportes Trimestral y Definitivo y Subdecana los aprueba', async ({ page }) => {
    // 1. Coordinador sube ambos reportes
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');

    const filaProyecto = page.locator('tr').filter({ hasText: DATOS_PRUEBA.PROYECTO_VCS_NUEVO }).first();
    const botonReportes = filaProyecto.getByRole('button', { name: /Reportes/i });
    await botonReportes.click();

    await expect(page.getByText(/Informes y Seguimiento del Proyecto/i)).toBeVisible();

    // Subir primer reporte: Trimestral
    const botonSubir = page.getByRole('button', { name: 'Subir', exact: true }).first();
    if (await botonSubir.isVisible()) {
      await botonSubir.click();
    }

    const inputArchivoReporte = page.locator('input[type="file"]').first();
    await inputArchivoReporte.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Enviar a Revisión/i }).click();
    await expect(page.getByText(/Reporte subido y enviado a revisión exitosamente/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Informe en espera de revisión por el Subdecanato/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();

    // 2. Subdecana revisa y aprueba el reporte
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');

    const filaProyectoSub = page.locator('tr').filter({ hasText: DATOS_PRUEBA.PROYECTO_VCS_NUEVO }).first();
    await filaProyectoSub.getByRole('button', { name: /Reportes/i }).click();

    await expect(page.getByText(/Informes y Seguimiento del Proyecto/i)).toBeVisible();
    await expect(page.getByText(/Reporte Trimestral de Avances/i).first()).toBeVisible({ timeout: 10000 });
    const botonAprobarInforme = page.getByRole('button', { name: /Aprobar Informe/i });
    await expect(botonAprobarInforme).toBeVisible({ timeout: 8000 });
    await botonAprobarInforme.click();

    await expect(page.getByText(/Informe aprobado exitosamente/i).first()).toBeVisible({ timeout: 10000 });
  });

});
