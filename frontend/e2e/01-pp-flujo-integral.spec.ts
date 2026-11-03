import { test, expect } from '@playwright/test';
import { USUARIOS, DATOS_PRUEBA, RUTA_PDF_FIXTURE } from './helpers/constantes';
import { iniciarSesionComo } from './helpers/autenticacion.helper';
import { reiniciarBaseDeDatos } from './helpers/base-datos.helper';

test.describe.configure({ mode: 'serial' });

test.describe('01 - PP: Flujo Integral de Vida de Prácticas y Matriz CACES (Happy Path)', () => {

  test.beforeAll(async () => {
    await reiniciarBaseDeDatos();
  });

  test.afterAll(async () => {
    await reiniciarBaseDeDatos();
  });

  // =========================================================================
  // PASO 1: SUBDECANA REGISTRA CONVENIO CON CUPOS
  // =========================================================================
  test('Paso 1: Subdecana registra y activa Convenio Institucional', async ({ page }) => {
    await iniciarSesionComo(page, 'SUBDECANA');

    await page.goto('/dashboard/practicas/convenios');
    await expect(page.getByRole('heading', { name: /Convenios Institucionales Activos|Gestión de Convenios/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Nuevo Convenio/i }).click();
    await expect(page.getByText(/Nuevo Convenio Institucional/i)).toBeVisible();

    await page.locator('#institucion').fill(DATOS_PRUEBA.CONVENIO_BASE);
    await page.locator('#cuposTotales').fill('5');
    await page.locator('#campoEspecifico').fill('1.0');
    await page.locator('#direccion').fill('Av. 12 de Octubre y Patria');
    await page.locator('#fechaInicio').fill('2026-05-01');
    await page.locator('#fechaFin').fill('2026-12-31');
    await page.locator('#tutorInstitucional').fill('Ing. Roberto Salazar');
    await page.locator('#correoTutor').fill(DATOS_PRUEBA.CORREO_TUTOR_INST);
    await page.locator('#telefonoTutor').fill('0998765432');

    await page.getByRole('button', { name: /Registrar Convenio/i }).click();

    await expect(page.getByText(/Convenio registrado exitosamente/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(DATOS_PRUEBA.CONVENIO_BASE).first()).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // PASO 2: COORDINADOR DE PRÁCTICAS ASIGNA ESTUDIANTE POR 240 HORAS
  // =========================================================================
  test('Paso 2: Coordinador de Prácticas asigna estudiante principal a Convenio por 240h', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');

    await page.goto('/dashboard/practicas/asignaciones');
    await expect(page.getByRole('heading', { name: /Asignación de Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });

    // 1. Seleccionar estudiante Juan Carlos Estrella
    const itemEstudiante = page.getByText(USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto).first();
    await expect(itemEstudiante).toBeVisible({ timeout: 8000 });
    await itemEstudiante.click();

    // 2. Seleccionar Convenio TechNova
    const itemConvenio = page.getByText(DATOS_PRUEBA.CONVENIO_BASE).first();
    await expect(itemConvenio).toBeVisible({ timeout: 8000 });
    await itemConvenio.click();

    // 3. Seleccionar Tutor Jaime Oswaldo Salvador
    const itemTutor = page.getByText(USUARIOS.TUTOR_1.nombreCompleto).first();
    await expect(itemTutor).toBeVisible({ timeout: 8000 });
    await itemTutor.click();

    // 4. Escribir 240 horas en el input numerico (skill regla 4: no dejar el default de 80h)
    const inputHoras = page.getByRole('spinbutton').first();
    await expect(inputHoras).toBeVisible();
    await inputHoras.fill('240');

    // 5. Confirmar asignacion en modal de resumen
    const botonConfirmar = page.getByRole('button', { name: /Confirmar Asignación \(1\)/i });
    await expect(botonConfirmar).toBeEnabled();
    await botonConfirmar.click();

    await expect(page.getByText(/Resumen de Asignación de Prácticas/i)).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar Asignación' }).click();

    await expect(page.getByText(/Se asigno exitosamente 1 estudiante/i)).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 3: DIRECTOR DE CARRERA EMITE CARTA DE ASIGNACIÓN
  // =========================================================================
  test('Paso 3: Director de Carrera emite Carta de Asignación al Tutor Institucional', async ({ page }) => {
    await iniciarSesionComo(page, 'DIRECTOR');

    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });
    await filaEstudiante.click();

    await expect(page.getByText(/Información de Práctica Preprofesional/i)).toBeVisible();

    const botonEmitirCarta = page.getByRole('button', { name: /Visualizar y Emitir Carta de Asignación/i });
    await expect(botonEmitirCarta).toBeVisible({ timeout: 8000 });
    await botonEmitirCarta.click();

    await expect(page.getByText(/Confirmar Emisión de Carta de Asignación/i)).toBeVisible();

    // Metodo manual sin FirmaEC
    const botonSinFirma = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirma.isVisible()) {
      await botonSinFirma.click();
    }

    const inputCartaFirmada = page.locator('#subir-carta-firmada').or(page.locator('input[type="file"]')).first();
    await inputCartaFirmada.setInputFiles(RUTA_PDF_FIXTURE);

    const botonEnviarCarta = page.getByRole('button', { name: /Enviar Carta|Emitir Carta/i });
    await expect(botonEnviarCarta).toBeEnabled({ timeout: 8000 });
    await botonEnviarCarta.click();

    await expect(page.getByText(/Carta.*emitida|Carta de asignación emitida correctamente/i)).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 4: ESTUDIANTE SUBE HOJA DE VIDA Y CÉDULA
  // =========================================================================
  test('Paso 4: Estudiante carga Hoja de Vida y Cédula en su portafolio', async ({ page }) => {
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');

    await page.goto('/dashboard/practicas/mi-practica');
    await expect(page.getByRole('heading', { name: /Mis Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(DATOS_PRUEBA.CONVENIO_BASE).first()).toBeVisible({ timeout: 8000 });

    // Subir Hoja de Vida (CV)
    const inputsArchivo = page.locator('input[type="file"]');
    await inputsArchivo.first().setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/subido con éxito|actualizado correctamente/i).first()).toBeVisible({ timeout: 10000 });

    // Subir Cedula
    await inputsArchivo.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await expect(page.getByText(/subido con éxito|actualizado correctamente/i).first()).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // PASO 5: TUTOR ACADÉMICO INICIA Y CARGA DOCUMENTOS DE FINALIZACIÓN
  // =========================================================================
  test('Paso 5: Tutor confirma reunión, inicia desarrollo y culmina carga de finalización', async ({ page }) => {
    await iniciarSesionComo(page, 'TUTOR_1');

    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await expect(filaEstudiante).toBeVisible({ timeout: 10000 });
    await filaEstudiante.click();

    await expect(page.getByText(/Información de Práctica Preprofesional/i)).toBeVisible();

    // Confirmar reunión e iniciar fase de desarrollo
    const checkboxReunion = page.getByRole('checkbox', { name: /Se realizó la reunión de coordinación/i });
    await expect(checkboxReunion).toBeVisible();
    await checkboxReunion.check();

    const botonIniciar = page.getByRole('button', { name: /Iniciar Desarrollo/i });
    await expect(botonIniciar).toBeEnabled();
    await botonIniciar.click();

    await expect(page.getByText(/Fase de desarrollo iniciada|Desarrollo iniciad[ao]|confirmado el inicio/i)).toBeVisible({ timeout: 10000 });

    // Abrir modal de carga de documentos de finalización
    const botonCargarDocs = page.getByRole('button', { name: /Cargar Documentos de Finalización/i });
    await expect(botonCargarDocs).toBeVisible({ timeout: 10000 });
    await botonCargarDocs.click();

    // Fecha posterior a inicio
    const inputFechaFin = page.locator('input[type="date"]');
    await inputFechaFin.fill('2026-11-30');

    // Cargar los 3 documentos finales (Informe, Certificado, Seguimiento)
    const inputsFinales = page.locator('input[type="file"]');
    await inputsFinales.nth(0).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinales.nth(1).setInputFiles(RUTA_PDF_FIXTURE);
    await inputsFinales.nth(2).setInputFiles(RUTA_PDF_FIXTURE);

    const botonEnviarRevision = page.getByRole('button', { name: /Enviar a Revisión/i });
    await expect(botonEnviarRevision).toBeEnabled();
    await botonEnviarRevision.click();

    await expect(page.getByText(/Registro firmado y enviado a revisi[oó]n|enviado a revisi[oó]n/i)).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 6: COORDINADOR VALIDA PORTAFOLIO Y REMITE A SUBDECANO
  // =========================================================================
  test('Paso 6: Coordinador aprueba los 5 documentos y envía a Subdecanato', async ({ page }) => {
    await iniciarSesionComo(page, 'COORDINADOR');

    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudiante.click();

    const botonValidarPortafolio = page.getByRole('button', { name: /Validar Documentos del Portafolio/i });
    await expect(botonValidarPortafolio).toBeVisible({ timeout: 8000 });
    await botonValidarPortafolio.click();

    await expect(page.getByText(/Validación de Documentos del Portafolio/i)).toBeVisible();

    // Aprobar los 5 documentos en el visor de portafolio esperando la confirmación de cada uno
    for (let i = 0; i < 5; i++) {
      const botonAprobar = page.getByRole('button', { name: /Validar y Aprobar/i });
      await expect(botonAprobar).toBeEnabled({ timeout: 8000 });
      await botonAprobar.click();
      await expect(page.getByText(/Documento aprobado con éxito/i).first()).toBeVisible({ timeout: 8000 });
    }

    const botonTerminar = page.getByRole('button', { name: /Terminar validación y enviar al Subdecano/i });
    await expect(botonTerminar).toBeEnabled({ timeout: 8000 });
    await botonTerminar.click();

    await expect(page.getByText(/Validaci[oó]n.*exitosa|Documentos validados/i)).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // PASO 7: SUBDECANA EMITE AVAL OFICIAL DE CUMPLIMIENTO
  // =========================================================================
  test('Paso 7: Subdecana revisa portafolio y emite Aval Oficial de Cumplimiento', async ({ page }) => {
    await iniciarSesionComo(page, 'SUBDECANA');

    await page.goto('/dashboard/practicas/estudiantes');
    await expect(page.getByRole('heading', { name: /Estudiantes con Asignación/i })).toBeVisible({ timeout: 10000 });

    const filaEstudiante = page.locator('tr').filter({ hasText: USUARIOS.ESTUDIANTE_PRINCIPAL.nombreCompleto }).first();
    await filaEstudiante.click();

    const botonEmitirAval = page.getByRole('button', { name: /Previsualizar y Emitir Aval de Cumplimiento/i });
    await expect(botonEmitirAval).toBeVisible({ timeout: 8000 });
    await botonEmitirAval.click();

    await expect(page.getByText(/Generar y Firmar Aval de Cumplimiento/i)).toBeVisible();

    const botonSinFirma = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirma.isVisible()) {
      await botonSinFirma.click();
    }

    const inputAvalFirmado = page.locator('#subir-aval-firmado').or(page.locator('input[type="file"]')).first();
    await inputAvalFirmado.setInputFiles(RUTA_PDF_FIXTURE);

    const botonAprobarAval = page.getByRole('button', { name: /Aprobar Aval/i });
    await expect(botonAprobarAval).toBeEnabled({ timeout: 8000 });
    await botonAprobarAval.click();

    await expect(page.getByText(/Aval de cumplimiento generado exitosamente/i)).toBeVisible({ timeout: 12000 });
  });

  // =========================================================================
  // PASO 8: VERIFICACIÓN DEL ESTUDIANTE
  // =========================================================================
  test('Paso 8: Estudiante verifica disponibilidad de su Aval Oficial Acreditado', async ({ page }) => {
    await iniciarSesionComo(page, 'ESTUDIANTE_PRINCIPAL');

    await page.goto('/dashboard/practicas/mi-practica');
    await expect(page.getByRole('heading', { name: /Mis Prácticas Preprofesionales/i })).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/Aval Oficial de Acreditación de Horas|Acreditado y Emitido/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Ver Aval/i })).toBeVisible({ timeout: 8000 });
  });

  // =========================================================================
  // PASO 9: CICLO MATRIZ CACES (CPP -> DIRECTOR -> CPP -> SUBDECANA)
  // =========================================================================
  test('Paso 9: Matriz CACES se genera por CPP, valida por Director y oficializa por Subdecana', async ({ page }) => {
    test.setTimeout(90000);

    // 9.1 Coordinador envía matriz a Dirección
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/matriz-caces');
    await expect(page.getByRole('heading', { name: /Matriz CACES/i })).toBeVisible({ timeout: 10000 });

    const botonEnviarDireccion = page.getByRole('button', { name: /Enviar a Dirección/i });
    await expect(botonEnviarDireccion).toBeVisible({ timeout: 8000 });
    await expect(botonEnviarDireccion).toBeEnabled({ timeout: 8000 });
    await botonEnviarDireccion.click();
    await expect(page.getByText(/Matriz CACES remitida a Dirección de Carrera con éxito/i)).toBeVisible({ timeout: 10000 });

    // 9.2 Director sube firma y valida
    await iniciarSesionComo(page, 'DIRECTOR');
    await page.goto('/dashboard/practicas/matriz-caces');
    await expect(page.getByRole('heading', { name: /Matriz CACES/i })).toBeVisible({ timeout: 10000 });

    const botonSubirFirma = page.getByRole('button', { name: /Subir Firma y Validar/i });
    await expect(botonSubirFirma).toBeVisible({ timeout: 8000 });
    await botonSubirFirma.click();

    const botonSinFirmaDC = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirmaDC.isVisible()) {
      await botonSinFirmaDC.click();
    }

    const inputFirmaDC = page.locator('#subir-matriz-firmada-input').or(page.locator('input[type="file"]')).first();
    await inputFirmaDC.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Validar y Remitir/i }).click();
    await expect(page.getByText(/Matriz CACES firmada y validada por Dirección de Carrera/i)).toBeVisible({ timeout: 12000 });

    // 9.3 Coordinador firma y remite a Subdecanato
    await iniciarSesionComo(page, 'COORDINADOR');
    await page.goto('/dashboard/practicas/matriz-caces');
    await expect(page.getByRole('heading', { name: /Matriz CACES/i })).toBeVisible({ timeout: 10000 });

    const botonRemitirSubdecano = page.getByRole('button', { name: /Firmar y Remitir a Subdecanato/i });
    await expect(botonRemitirSubdecano).toBeVisible({ timeout: 8000 });
    await botonRemitirSubdecano.click();

    const botonSinFirmaCPP = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirmaCPP.isVisible()) {
      await botonSinFirmaCPP.click();
    }

    const inputFirmaCPP = page.locator('#subir-matriz-firmada-input').or(page.locator('input[type="file"]')).first();
    await inputFirmaCPP.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Firmar y Remitir a Subdecanato/i }).last().click();
    await expect(page.getByText(/Matriz CACES firmada por Coordinación y remitida a Subdecanato con éxito/i)).toBeVisible({ timeout: 12000 });

    // 9.4 Subdecana oficializa la matriz de Computacion
    await iniciarSesionComo(page, 'SUBDECANA');
    await page.goto('/dashboard/practicas/matriz-caces');
    await expect(page.getByRole('heading', { name: /Matrices CACES de la Facultad|Control y Consolidación de Matrices CACES/i })).toBeVisible({ timeout: 10000 });

    const filaComputacion = page.locator('tr').filter({ hasText: /Computacion|Ingenieria en Computacion/i }).first();
    await expect(filaComputacion).toBeVisible({ timeout: 10000 });
    await filaComputacion.getByRole('button', { name: /Revisar/i }).click();

    const botonOficializar = page.getByRole('button', { name: /Oficializar y Subir Firma/i });
    await expect(botonOficializar).toBeVisible({ timeout: 8000 });
    await botonOficializar.click();

    const botonSinFirmaSub = page.getByRole('button', { name: /Sin FirmaEC/i });
    if (await botonSinFirmaSub.isVisible()) {
      await botonSinFirmaSub.click();
    }

    const inputMatrizSubdecana = page.locator('#subir-matriz-firmada-input').or(page.locator('input[type="file"]')).first();
    await inputMatrizSubdecana.setInputFiles(RUTA_PDF_FIXTURE);
    await page.getByRole('button', { name: /Oficializar Matriz/i }).click();
    await expect(page.getByText(/Matriz CACES oficializada y registrada correctamente/i)).toBeVisible({ timeout: 12000 });

    await expect(page.getByText('Oficializada', { exact: true })).toBeVisible({ timeout: 8000 });
  });

});
