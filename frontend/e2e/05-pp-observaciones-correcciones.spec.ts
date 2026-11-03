import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_PDF_FIXTURE } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('05 - PP: Flujos de Observación, Corrección de Portafolio y Convenios (Happy Path 2)', () => {

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
  // PARTE 1: CICLO DE OBSERVACIÓN Y RESUBIDA DE DOCUMENTOS EN EL PORTAFOLIO
  // =========================================================================
  test('Parte 1: Observación de portafolio por CPP, corrección del estudiante y aprobación', async ({ page }) => {
    // 1. Preparar asignación hasta fase de finalización
    // 1.1 Subdecana crea convenio
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/convenios');
    await page.getByRole('button', { name: /Nuevo Convenio/i }).click();
    await page.locator('#institucion').fill('Empresa Para Observaciones');
    await page.locator('#cuposTotales').fill('5');
    await page.locator('#campoEspecifico').fill('1.0');
    await page.locator('#direccion').fill('Quito Centro');
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.locator('#tutorInstitucional').fill('Ing. Auditor');
    await page.locator('#correoTutor').fill('auditor@empresa.com');
    await page.locator('#telefonoTutor').fill('0990001122');
    await page.getByRole('button', { name: /Registrar Convenio/i }).click();
    await expect(page.getByText(/Convenio registrado exitosamente/i)).toBeVisible({ timeout: 10000 });

    // 1.2 CPP asigna a Juan Carlos Estrella por 240h
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first().click();
    await page.getByText('Empresa Para Observaciones').first().click();
    await page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first().click();
    const inputHoras = page.getByRole('spinbutton').first();
    await inputHoras.fill('240');
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // 1.3 Director emite carta de asignación
    await iniciarSesionComo(page, 'DIRECTOR');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudiante.click();

    const botonEmitirCarta = page.getByRole('button', { name: /Visualizar y Emitir Carta de Asignación/i });
    await expect(botonEmitirCarta).toBeVisible({ timeout: 8000 });
    await botonEmitirCarta.click();
    const botonSinFirma = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirma.isVisible()) {
      await botonSinFirma.click();
    }
    const inputCartaFirmada = page.locator('#subir-carta-firmada').or(page.locator('input[type="file"]')).first();
    await inputCartaFirmada.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Enviar Carta/i }).click();
    await expect(page.getByText(/Carta de Asignación remitida|Reenviar Carta al Tutor Institucional/i).first()).toBeVisible({ timeout: 15000 });

    // 1.4 Estudiante sube Hoja de Vida y Cédula
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');
    const inputsIniciales = page.locator('input[type="file"]');
    await inputsIniciales.first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/subido con éxito|actualizado correctamente/i).first()).toBeVisible({ timeout: 10000 });
    await inputsIniciales.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/subido con éxito|actualizado correctamente/i).first()).toBeVisible({ timeout: 10000 });

    // 1.5 Tutor inicia desarrollo y sube documentos finales
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudianteTutor = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudianteTutor.click();

    const checkboxReunion = page.getByRole('checkbox', { name: /Se realizó la reunión de coordinación/i });
    await checkboxReunion.check();
    await page.getByRole('button', { name: /Iniciar Desarrollo/i }).click();
    await expect(page.getByText(/Fase de desarrollo iniciada|Desarrollo iniciad[ao]/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Cargar Documentos de Finalización/i }).click();
    await page.locator('input[type="date"]').fill('2026-11-30');
    const inputsFinales = page.locator('input[type="file"]');
    await inputsFinales.nth(0).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinales.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinales.nth(2).setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Enviar a Revisión/i }).click();
    await expect(page.getByText(/Documentos de cierre entregados|remitido los documentos de cierre exitosamente/i).first()).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');

    // 2. CPP observa un documento registrando motivo
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudianteCpp = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudianteCpp.click();

    await page.getByRole('button', { name: /Validar Documentos del Portafolio/i }).click();
    await expect(page.getByText(/Validación de Documentos del Portafolio/i)).toBeVisible();

    // Rechazar el primer documento con motivo explicito
    const botonRechazar = page.getByRole('button', { name: /Rechazar/i }).first();
    await botonRechazar.click();

    const motivoObservacion = 'Falta firma en el documento oficial';
    const inputObservacion = page.getByPlaceholder(/Escriba los motivos o correcciones requeridas/i);
    await inputObservacion.fill(motivoObservacion);

    const botonConfirmarRechazo = page.getByRole('button', { name: /Confirmar Rechazo/i });
    await expect(botonConfirmarRechazo).toBeEnabled();
    await botonConfirmarRechazo.click();

    await expect(page.getByText('Documento devuelto con observaciones')).toBeVisible({ timeout: 10000 });

    // Cerrar modal de validación
    await page.keyboard.press('Escape');

    // 3. Estudiante visualiza la observación y resube el documento
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');
    await expect(page.getByText('Falta firma en el documento oficial')).toBeVisible({ timeout: 10000 });

    // Resubir archivo directamente a través del label de acción rápida
    const inputResubida = page.locator('label').filter({ hasText: /Corregir y Resubir/i }).locator('input[type="file"]');
    await inputResubida.setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/actualizado correctamente/i).first()).toBeVisible({ timeout: 10000 });

    // 4. CPP verifica que volvió a estado pendiente y lo aprueba
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudianteReval = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudianteReval.click();

    await page.getByRole('button', { name: /Validar Documentos del Portafolio/i }).click();
    const botonAprobar = page.getByRole('button', { name: /Validar y Aprobar/i });
    await expect(botonAprobar).toBeVisible({ timeout: 8000 });
    await botonAprobar.click();
    await expect(page.getByText(/Documento aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // PARTE 2: SUGERENCIA DE CONVENIO Y RESOLUCIÓN EN SUBDECANATO
  // =========================================================================
  test('Parte 2: Director sugiere nuevo convenio y Subdecana lo procesa y aprueba', async ({ page }) => {
    // 1. Director de Carrera sugiere un convenio institucional
    await iniciarSesionComo(page, 'DIRECTOR');
    await page.goto('/dashboard/practicas/convenios');

    const botonSugerir = page.getByRole('button', { name: /Sugerir Convenio|Sugerir Nuevo Convenio/i });
    await expect(botonSugerir).toBeVisible({ timeout: 10000 });
    await botonSugerir.click();

    await expect(page.getByRole('dialog').getByText(/Sugerir Nuevo Convenio/i)).toBeVisible();

    const institucionSugerida = 'Banco Central del Ecuador - Dpto TI';
    await page.locator('#sug-empresa').fill(institucionSugerida);
    await page.locator('#sug-contacto').fill('Dra. Elena Morales');
    await page.locator('#sug-correo').fill('elena.morales@bce.fin.ec');
    await page.locator('#sug-desc').fill('Convenio estratégico de alto impacto para prácticas de desarrollo e inteligencia de negocios.');

    await page.getByRole('button', { name: /Enviar Propuesta/i }).click();
    await expect(page.getByText(/Propuesta de nuevo convenio enviada al Subdecanato/i)).toBeVisible({ timeout: 10000 });

    // 2. Subdecana revisa y procesa la sugerencia en la pestaña de observaciones
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/convenios?subtab=observaciones');

    await expect(page.getByText(/Sugerencias y Observaciones/i).first()).toBeVisible({ timeout: 10000 });

    // Localizar la fila correspondiente
    const filaObservacion = page.locator('tr').filter({ hasText: institucionSugerida }).first();
    await expect(filaObservacion).toBeVisible({ timeout: 10000 });

    // Abrir modal de procesamiento al hacer clic en la fila
    await filaObservacion.click();

    await expect(page.getByRole('dialog').getByText(/Información remitida para análisis y tramitación del Subdecanato|Propuesta de Nuevo Convenio/i).first()).toBeVisible();

    // Aprobar la sugerencia
    const botonAprobarTramite = page.getByRole('dialog').getByRole('button', { name: 'Aprobar', exact: true });
    await expect(botonAprobarTramite).toBeVisible();
    await botonAprobarTramite.click();

    await expect(page.getByText(/exitosamente|éxito/i).first()).toBeVisible({ timeout: 10000 });
  });

});
