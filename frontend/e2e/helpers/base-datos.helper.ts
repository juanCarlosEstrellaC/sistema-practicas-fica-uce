import { execSync } from 'child_process';
import { USUARIOS } from './constantes';

const URL_BACKEND = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

/**
 * Restablece la base de datos a su estado limpio e idempotente antes o despues de cada suite de pruebas.
 * Intenta primero invocar el endpoint institucional /sistema/reiniciar (que ejecuta schema.sql + dummy_inicial.sql
 * y limpia archivos fisicos subidos). Como respaldo secundario ejecuta el script SQL directo en PostgreSQL.
 */
export async function reiniciarBaseDeDatos(): Promise<void> {
  // 1. Intento via endpoint de backend Spring Boot
  try {
    const resLogin = await fetch(`${URL_BACKEND}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: USUARIOS.SUBDECANA.correo,
        clave: USUARIOS.SUBDECANA.clave,
      }),
    });

    if (resLogin.ok) {
      const dataLogin = await resLogin.json();
      const token = dataLogin.data?.token || dataLogin.token;

      if (token) {
        const resReiniciar = await fetch(`${URL_BACKEND}/sistema/reiniciar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (resReiniciar.ok) {
          return;
        }
      }
    }
  } catch {
    // Si la conexion HTTP falla, se aplica la limpieza directa por base de datos
  }

  // 2. Respaldo directo en PostgreSQL (Windows / psql)
  try {
    const sentencias = [
      'DELETE FROM evidencias_asignaciones_vcs;',
      'DELETE FROM reportes_proyectos_vcs;',
      'DELETE FROM asignaciones_proyectos_comunitarios;',
      'DELETE FROM procesos_vinculacion;',
      'DELETE FROM documentos_portafolio;',
      'DELETE FROM asignaciones_practicas;',
      'DELETE FROM procesos_practicas;',
      "DELETE FROM convenios WHERE institucion LIKE '%TechNova%' OR institucion LIKE '%InnovaCorp%' OR institucion LIKE '%Test%';",
      'DELETE FROM matrices_caces WHERE periodo_id = 1;',
      "UPDATE periodos_academicos SET estado = 'ACTIVO' WHERE id = 1;",
      "UPDATE periodos_academicos SET estado = 'INACTIVO' WHERE id = 2;",
      "UPDATE usuarios SET estado = 'ACTIVO', clave_hash = '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle' WHERE id BETWEEN 1 AND 30;",
      // Garantizar que el estudiante secundario (cflores) y el 2do tutor (rmorales) existan
      "INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES (6, 'cflores@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Andres', 'Flores Mieles', '1700000005', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0) ON CONFLICT (id) DO UPDATE SET estado = 'ACTIVO', carrera_id = 1;",
      "INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES (7, 'rmorales@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Roberto Patricio', 'Morales Viteri', '1711111120', 'CEDULA', 'TUTOR_ACADEMICO', 1, 'ACTIVO', FALSE, 0) ON CONFLICT (id) DO UPDATE SET estado = 'ACTIVO', carrera_id = 1;",
      // Asegurar que el tutor 4 (jsalvador) tenga inicialmente asignado el proyecto 1 y no el 2 ni el 3
      "UPDATE proyectos_comunitarios SET tutor_academico_id = 4 WHERE id = 1;",
      "UPDATE proyectos_comunitarios SET tutor_academico_id = NULL WHERE id IN (2, 3);",
    ].join(' ');

    const comando = `"C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe" -U postgres -h localhost -p 5432 -d prueba_1 -c "${sentencias}"`;
    execSync(comando, {
      env: { ...process.env, PGPASSWORD: 'labcom,2015' },
      stdio: 'ignore',
    });
  } catch (error) {
    console.warn('Advertencia: No se pudo ejecutar la limpieza de base de datos directa en PostgreSQL:', error);
  }
}
