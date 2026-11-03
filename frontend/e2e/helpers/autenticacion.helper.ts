import { Page, expect } from '@playwright/test';
import { USUARIOS, ClaveRolUsuario } from './constantes';

/**
 * Autentica al usuario especificado mediante el formulario de login.
 * Limpia las cookies previas del contexto para garantizar sesion limpia y valida permisos reales de Next.js y JWT.
 */
export async function iniciarSesionComo(
  page: Page,
  rolOUsuario: ClaveRolUsuario | string,
  clavePersonalizada?: string
): Promise<void> {
  const credenciales =
    rolOUsuario in USUARIOS
      ? USUARIOS[rolOUsuario as ClaveRolUsuario]
      : { correo: rolOUsuario, clave: clavePersonalizada || '123456' };

  await page.context().clearCookies();
  await page.goto('/autenticacion/iniciar-sesion');
  await page.waitForLoadState('domcontentloaded');

  const inputEmail = page.locator('#email').or(page.locator('input[type="email"]')).first();
  const inputPassword = page.locator('#password').or(page.locator('input[type="password"]')).first();
  const botonIngresar = page.getByRole('button', { name: /Ingresar/i });

  await expect(inputEmail).toBeVisible({ timeout: 10000 });
  await inputEmail.fill(credenciales.correo);
  await inputPassword.fill(clavePersonalizada || credenciales.clave);
  await botonIngresar.click();

  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Cierra la sesion activa limpiando el contexto y navegando al login.
 */
export async function cerrarSesion(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/autenticacion/iniciar-sesion');
  await page.waitForLoadState('domcontentloaded');
}
