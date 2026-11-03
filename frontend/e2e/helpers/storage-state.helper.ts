import fs from 'fs';
import path from 'path';
import { Browser, BrowserContext } from '@playwright/test';
import { USUARIOS, ClaveRolUsuario, RUTA_DIR_AUTH } from './constantes';

/**
 * Retorna la ruta absoluta del archivo de Storage State para un usuario dado.
 */
export function obtenerRutaStorageState(identificador: string): string {
  if (!fs.existsSync(RUTA_DIR_AUTH)) {
    fs.mkdirSync(RUTA_DIR_AUTH, { recursive: true });
  }
  const nombreLimpio = identificador.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return path.join(RUTA_DIR_AUTH, `${nombreLimpio}.json`);
}

/**
 * Obtiene las credenciales dado un rol o un objeto con correo y clave.
 */
function resolverCredenciales(usuarioOClave: ClaveRolUsuario | { correo: string; clave: string }): { correo: string; clave: string; claveArchivo: string } {
  if (typeof usuarioOClave === 'string') {
    const usr = USUARIOS[usuarioOClave as ClaveRolUsuario];
    if (!usr) {
      throw new Error(`Usuario no encontrado para clave: ${usuarioOClave}`);
    }
    return {
      correo: usr.correo,
      clave: usr.clave,
      claveArchivo: usuarioOClave,
    };
  }
  return {
    correo: usuarioOClave.correo,
    clave: usuarioOClave.clave,
    claveArchivo: usuarioOClave.correo.split('@')[0],
  };
}

/**
 * Asegura que exista un archivo de Storage State válido para el usuario.
 * Si no existe, inicia sesión en un contexto temporal y guarda el estado en disco.
 */
export async function asegurarStorageState(
  browser: Browser,
  usuarioOClave: ClaveRolUsuario | { correo: string; clave: string },
  forzarRegeneracion = false
): Promise<string> {
  const { correo, clave, claveArchivo } = resolverCredenciales(usuarioOClave);
  const rutaArchivo = obtenerRutaStorageState(claveArchivo);

  if (!forzarRegeneracion && fs.existsSync(rutaArchivo)) {
    try {
      const contenido = JSON.parse(fs.readFileSync(rutaArchivo, 'utf-8'));
      if (contenido.cookies && contenido.cookies.length > 0) {
        return rutaArchivo;
      }
    } catch {
      // Si el archivo está corrupto, se regenera
    }
  }

  // Generar sesión por primera vez navegando al login
  const contexto = await browser.newContext();
  const page = await contexto.newPage();

  try {
    await page.goto('/autenticacion/iniciar-sesion');
    await page.locator('#email').fill(correo);
    await page.locator('#password').fill(clave);
    await page.getByRole('button', { name: /Ingresar|Iniciar Sesión/i }).click();

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');

    // Guardar estado con cookies de sesión
    await contexto.storageState({ path: rutaArchivo });
  } catch (error) {
    console.error(`Error al autenticar para Storage State (${correo}):`, error);
    throw error;
  } finally {
    await contexto.close();
  }

  return rutaArchivo;
}

/**
 * Crea y retorna un BrowserContext de Playwright ya autenticado con el Storage State del usuario.
 */
export async function crearContextoAutenticado(
  browser: Browser,
  usuarioOClave: ClaveRolUsuario | { correo: string; clave: string },
  forzarRegeneracion = false
): Promise<BrowserContext> {
  const rutaState = await asegurarStorageState(browser, usuarioOClave, forzarRegeneracion);
  return await browser.newContext({ storageState: rutaState });
}
