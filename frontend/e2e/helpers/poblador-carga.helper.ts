import { execSync } from 'child_process';
import path from 'path';

/**
 * Aplica la poblacion masiva de 100 estudiantes (20 por carrera) y actualiza
 * convenios con cupos suficientes para pruebas de carga real y concurrencia.
 */
export async function poblarDatosFase3CargaReal(): Promise<void> {
  const rutaScriptSql = path.join(process.cwd(), 'e2e', 'fixtures', 'poblacion-fase3-100-estudiantes.sql');
  const comando = `"C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe" -U postgres -h localhost -p 5432 -d prueba_1 -f "${rutaScriptSql}"`;

  try {
    execSync(comando, {
      env: { ...process.env, PGPASSWORD: 'labcom,2015' },
      stdio: 'ignore',
    });
  } catch (error) {
    console.error('Error al poblar datos de la Fase 3 en PostgreSQL:', error);
    throw error;
  }
}
