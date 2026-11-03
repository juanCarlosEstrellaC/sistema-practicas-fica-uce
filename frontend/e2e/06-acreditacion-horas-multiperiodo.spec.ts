import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_PDF_FIXTURE } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('06 - Acreditación de Horas, Multiperiodo e Inactividad del Estudiante', () => {

  test.beforeAll(async () => {
    await reiniciarBaseDeDatos();
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // ESCENARIO A: ACREDITACIÓN TOTAL EN 1 PERIODO (240h PP + 160h VCS)
  // =========================================================================
  test('Escenario A: Culminación del 100% de horas PP y VCS, inactividad y persistencia de acceso', async ({ page }) => {
    test.setTimeout(120000);

    // -------------------------------------------------------------
    // 1. Culminar 240h de Prácticas Preprofesionales (PP)
    // -------------------------------------------------------------
    // Subdecana crea convenio
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/convenios');
    await page.getByRole('button', { name: /Nuevo Convenio/i }).click();
    await page.locator('#institucion').fill('Empresa Acreditacion Completa');
    await page.locator('#cuposTotales').fill('5');
    await page.locator('#campoEspecifico').fill('1.0');
    await page.locator('#direccion').fill('Quito');
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.locator('#tutorInstitucional').fill('Ing. Tutor PP');
    await page.locator('#correoTutor').fill('tutor.pp@empresa.com');
    await page.locator('#telefonoTutor').fill('0990000001');
    await page.getByRole('button', { name: /Registrar Convenio/i }).click();
    await expect(page.getByText(/Convenio registrado exitosamente/i)).toBeVisible({ timeout: 10000 });

    // CPP asigna 240h
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first().click();
    await page.getByText('Empresa Acreditacion Completa').first().click();
    await page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first().click();
    const inputHorasPp = page.getByRole('spinbutton').first();
    await inputHorasPp.fill('240');
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // Director emite carta
    await iniciarSesionComo(page, 'DIRECTOR');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaDirector = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaDirector.click();

    const botonEmitirCarta = page.getByRole('button', { name: /Visualizar y Emitir Carta de Asignación/i });
    await expect(botonEmitirCarta).toBeVisible({ timeout: 8000 });
    await botonEmitirCarta.click();
    const botonSinFirmaPp = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirmaPp.isVisible()) await botonSinFirmaPp.click();
    const inputCartaFirmada = page.locator('#subir-carta-firmada').or(page.locator('input[type="file"]')).first();
    await inputCartaFirmada.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Enviar Carta/i }).click();
    await expect(page.getByText(/Carta de Asignación remitida|Reenviar Carta al Tutor Institucional/i).first()).toBeVisible({ timeout: 15000 });

    // Estudiante sube portafolio inicial (CV y Cédula)
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');

    const inputsArchivosEst = page.locator('input[type="file"]');
    await inputsArchivosEst.first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText('En Revisión').first()).toBeVisible({ timeout: 12000 });

    await inputsArchivosEst.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText('En Revisión')).toHaveCount(2, { timeout: 12000 });

    // Tutor inicia y finaliza PP
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudianteTutor = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudianteTutor.click();

    const checkboxReunion = page.getByRole('checkbox', { name: /Se realizó la reunión de coordinación/i });
    await expect(checkboxReunion).toBeVisible({ timeout: 8000 });
    await checkboxReunion.check();
    await page.getByRole('button', { name: /Iniciar Desarrollo/i }).click();
    await expect(page.getByText(/Fase de desarrollo iniciada|Desarrollo iniciad[ao]/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Cargar Documentos de Finalización/i }).click();
    await page.locator('input[type="date"]').fill('2026-11-30');
    const inputsFinPp = page.locator('input[type="file"]');
    await inputsFinPp.nth(0).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinPp.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinPp.nth(2).setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Enviar a Revisión/i }).click();
    await expect(page.getByText(/Documentos de cierre entregados|remitido los documentos de cierre exitosamente/i).first()).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');

    // CPP valida portafolio
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/estudiantes');
    await page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first().click();
    await page.getByRole('button', { name: /Validar Documentos del Portafolio/i }).click();
    await expect(page.getByText(/Validación de Documentos del Portafolio/i)).toBeVisible();

    // Aprobar los 5 documentos en el visor de portafolio esperando la confirmación de cada uno
    for (let i = 0; i < 5; i++) {
      const botonAprobar = page.getByRole('button', { name: /Validar y Aprobar/i });
      await expect(botonAprobar).toBeEnabled({ timeout: 8000 });
      await botonAprobar.click();
      await expect(page.getByText(/Documento aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });
    }

    const botonTerminarPp = page.getByRole('button', { name: /Terminar validación y enviar al Subdecano/i });
    await expect(botonTerminarPp).toBeEnabled({ timeout: 8000 });
    await botonTerminarPp.click();
    await expect(page.getByText(/Validaci[oó]n.*exitosa|Documentos validados/i)).toBeVisible({ timeout: 10000 });

    // Subdecana emite Aval de PP
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/estudiantes');
    await page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first().click();
    await page.getByRole('button', { name: /Previsualizar y Emitir Aval de Cumplimiento/i }).click();
    const btnSinFirmaAval = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await btnSinFirmaAval.isVisible()) await btnSinFirmaAval.click();
    const inputAvalFirmado = page.locator('#subir-aval-firmado').or(page.locator('input[type="file"]')).first();
    await inputAvalFirmado.setInputFiles(RUTA_PDF_FIXTURE);
    const botonAprobarAval = page.getByRole('button', { name: /Aprobar Aval|Aprobar y Emitir Aval Firmado/i });
    await expect(botonAprobarAval).toBeEnabled({ timeout: 8000 });
    await botonAprobarAval.click();
    await expect(page.getByText(/Aval de cumplimiento (generado|emitido) exitosamente/i)).toBeVisible({ timeout: 12000 });

    // -------------------------------------------------------------
    // 2. Culminar 160h de Vinculación con la Sociedad (VCS)
    // -------------------------------------------------------------
    // Subdecana crea proyecto VCS
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');
    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    await page.locator('#nombre').fill('Proyecto Acreditacion 160h');
    await page.locator('#carreraId').click();
    await page.getByRole('option', { name: /Computaci[oó]n/i }).first().click();
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.getByRole('button', { name: /Crear Proyecto/i }).click();
    await expect(page.getByText(/Proyecto comunitario creado (con éxito|exitosamente)/i)).toBeVisible({ timeout: 10000 });

    // CPP asocia a tutor
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/vinculacion/tutores');
    const filaTutVcs = page.locator('tr').filter({ hasText: USUARIOS.TUTOR_1.nombreCompleto }).first();
    await filaTutVcs.getByRole('button', { name: /Asociar Proyectos/i }).or(filaTutVcs.getByTitle(/Asociar Proyectos/i)).click();
    await page.getByText('Proyecto Acreditacion 160h').first().click();
    await page.getByRole('button', { name: /Guardar Asignación|Guardar Asociaciones/i }).click();
    await expect(page.getByText(/Proyectos asociados.*éxito|Proyectos asociados correctamente/i).first()).toBeVisible({ timeout: 10000 });

    // CPP asigna 160h
    await page.goto('/dashboard/vinculacion/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first().click();
    await page.getByText('Proyecto Acreditacion 160h').first().click();
    const inputHorasVcs = page.getByRole('spinbutton').first();
    await inputHorasVcs.fill('160');
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: /Confirmar y Guardar|Confirmar Asignación/i }).last().click();
    await expect(page.getByText(/Asignación creada con éxito|Estudiantes asignados correctamente|Se asigno exitosamente/i).first()).toBeVisible({ timeout: 12000 });

    // Tutor inicia proyecto VCS
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/vinculacion/proyectos-comunitarios');
    const filaProyVcs = page.locator('tr').filter({ hasText: 'Proyecto Acreditacion 160h' }).first();
    await filaProyVcs.getByRole('button', { name: /Iniciar proyecto/i }).click();
    await expect(page.getByText(/Proyecto iniciado con éxito|Estudiantes en fase de desarrollo/i)).toBeVisible({ timeout: 10000 });

    // Estudiante sube bitácora e informe
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/vinculacion/mi-proyecto');
    const tarjetaBitacoraVcs = page.locator('.p-4.rounded-xl').filter({ hasText: '1. Bitácora' }).first();
    await tarjetaBitacoraVcs.locator('input[type="file"]').first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(tarjetaBitacoraVcs.getByText('En Revisión por Tutor')).toBeVisible({ timeout: 15000 });

    const tarjetaInformeVcs = page.locator('.p-4.rounded-xl').filter({ hasText: '2. Informe Final' }).first();
    await tarjetaInformeVcs.locator('input[type="file"]').first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(tarjetaInformeVcs.getByText('En Revisión por Tutor')).toBeVisible({ timeout: 15000 });

    // Tutor valida evidencias VCS
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/vinculacion/asignaciones-existentes');
    await page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first().click();
    await page.getByRole('button', { name: /Validar Documentos del Portafolio/i }).click();

    // Validar y aprobar ambos documentos (Bitácora e Informe Final)
    const botonAprobarVcs1 = page.getByRole('button', { name: /Validar y Aprobar/i });
    await expect(botonAprobarVcs1).toBeEnabled({ timeout: 10000 });
    await botonAprobarVcs1.click();
    await expect(page.getByText(/Documento validado y aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });

    const botonDocInforme = page.locator('div.w-64 button').filter({ hasText: /Informe Final/i });
    if (await botonDocInforme.isVisible()) {
      await botonDocInforme.click();
    }

    const botonAprobarVcs2 = page.getByRole('button', { name: /Validar y Aprobar/i });
    await expect(botonAprobarVcs2).toBeEnabled({ timeout: 10000 });
    await botonAprobarVcs2.click();
    await expect(page.getByText(/Documento validado y aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });

    // Terminar validación y enviar a Subdecanato
    const botonTerminarVcs = page.getByRole('button', { name: /Terminar validación y enviar a Subdecanato/i });
    await expect(botonTerminarVcs).toBeEnabled({ timeout: 10000 });
    await botonTerminarVcs.click();
    await expect(page.getByText(/Documentos validados y (remitidos|enviados) a Subdecanato|enviado con éxito/i).first()).toBeVisible({ timeout: 10000 });

    // Subdecana aprueba horas y emite Certificado VCS
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/vinculacion/asignaciones-existentes');
    await page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first().click();
    await page.getByRole('button', { name: /Previsualizar y Emitir Certificado de Horas/i }).click();
    const btnSinFirmaCert = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await btnSinFirmaCert.isVisible()) await btnSinFirmaCert.click();
    await page.locator('#upload-cert-firmado').or(page.locator('input[type="file"]')).first().setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Aprobar y Enviar Certificado Firmado/i }).click();
    await expect(page.getByText(/Certificado.*convalidado.*horas acreditadas|horas acreditadas exitosamente/i)).toBeVisible({ timeout: 12000 });

    // -------------------------------------------------------------
    // 3. Verificación Dual: Inactividad y Persistencia de Acceso
    // -------------------------------------------------------------
    // 3.1 El estudiante Juan Carlos Estrella NO debe figurar en listas de asignación
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto);

    await page.goto('/dashboard/vinculacion/asignaciones');
    await expect(page.locator('body')).not.toContainText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto);

    // 3.2 El estudiante SÍ puede iniciar sesión y visualizar sus documentos finales
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');
    await page.goto('/dashboard/practicas/mi-practica');
    await expect(page.getByRole('heading', { name: /Mis Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Ver Aval|Descargar Aval/i).first()).toBeVisible({ timeout: 8000 });

    await page.goto('/dashboard/vinculacion/mi-proyecto');
    await expect(page.getByRole('heading', { name: /Mis Proyectos Comunitarios|Mis Proyectos/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Ver Certificado|Descargar Certificado/i).first()).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // ESCENARIO B: REPROBACIÓN NO ACUMULA HORAS
  // =========================================================================
  test('Escenario B: Asignación reprobada mantiene 0 horas acreditadas', async ({ page }) => {
    // 1. Coordinador asigna a Carlos Andres Flores
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/asignaciones');
    await page.getByText(USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto).first().click();
    await page.getByText(/Google Ecuador|Empresa Acreditacion Completa/i).first().click();
    await page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first().click();
    const inputHorasPp = page.getByRole('spinbutton').first();
    await inputHorasPp.fill('120');
    await page.getByRole('button', { name: /Confirmar Asignación \(1\)/i }).click();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();
    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });

    // 2. Tutor Académico reprueba la práctica de Carlos Andrés Flores
    await iniciarSesionComo(page, 'TUTOR_1');
    await page.goto('/dashboard/practicas/estudiantes');
    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_SECUNDARIO.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });
    const botonReprobar = filaEstudiante.getByRole('button', { name: /Reprobar/i });
    await expect(botonReprobar).toBeVisible();
    await botonReprobar.click();

    await expect(page.getByText(/¿Está seguro de reprobar esta práctica\?/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Reprobación/i }).click();
    await expect(page.getByText(/reprobada/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Estudiante secundario verifica que mantiene 0 horas acreditadas
    await iniciarSesionComo(page, 'ESTUDIANTE_SECUNDARIO');
    await page.goto('/dashboard/practicas/progreso-general');
    await expect(page.getByText(/0 \/ 240h/i).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/REPROBADO/i).first()).toBeVisible({ timeout: 8000 });
  });

});
