-- =============================================================================
-- DUMMY 1: CONFIGURACION INICIAL MINIMA (ADMIN SUBDECANATO + DATOS BASE)
-- =============================================================================

-- 0. Limpieza previa de tablas respetando integridad referencial
TRUNCATE TABLE evidencias_asignaciones_vcs CASCADE;
TRUNCATE TABLE reportes_proyectos_vcs CASCADE;
TRUNCATE TABLE asignaciones_proyectos_comunitarios CASCADE;
TRUNCATE TABLE proyectos_comunitarios CASCADE;
TRUNCATE TABLE procesos_vinculacion CASCADE;

TRUNCATE TABLE notificaciones CASCADE;
TRUNCATE TABLE matrices_caces CASCADE;
TRUNCATE TABLE documentos_portafolio CASCADE;
TRUNCATE TABLE asignaciones_practicas CASCADE;
TRUNCATE TABLE procesos_practicas CASCADE;
TRUNCATE TABLE observaciones CASCADE;
TRUNCATE TABLE tokens_resetear_contrasenia CASCADE;

-- Desvincular autoridades circulares antes de truncar usuarios y carreras
UPDATE carreras SET director_id = NULL, coordinador_id = NULL;

TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE convenios CASCADE;
TRUNCATE TABLE carreras CASCADE;
TRUNCATE TABLE periodos_academicos CASCADE;

-- ==========================================
-- 1. PERIODOS ACADEMICOS
-- ==========================================
INSERT INTO periodos_academicos (id, nombre, fecha_inicio, fecha_fin, estado, borrado) VALUES
(1, '2026-2026', '2026-04-01', '2026-08-31', 'ACTIVO', FALSE);

-- ==========================================
-- 2. CARRERAS BASE DE LA FACULTAD
-- ==========================================
INSERT INTO carreras (id, nombre, codigo_carrera, ciudad_carrera, horas_practicas, horas_proyectos_comunitarios, borrado) VALUES
(1, 'Ingenieria en Computacion', '650611A02', 'Distrito Metropolitano de Quito_Computacion', 240, 160, FALSE),
(2, 'Ingenieria en Sistemas de Informacion', '650612A02', 'Distrito Metropolitano de Quito_Sistemas', 240, 160, FALSE),
(3, 'Ingenieria Mecanica', '650613A02', 'Distrito Metropolitano de Quito_Mecanica', 296, 160, FALSE),
(4, 'Ingenieria Civil', '630611A02', 'Distrito Metropolitano de Quito_Civil', 240, 160, FALSE),
(5, 'Ingenieria en Disenio Industrial', '640611A02', 'Distrito Metropolitano de Quito_Disenio Industrial', 240, 160, FALSE);

-- ==========================================
-- 3. USUARIOS BASE DEL SISTEMA (ROLES PRINCIPALES)
-- Credenciales para todos:
-- Contrasenia: 123456
-- Hash bcrypt: $2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle
-- Perfiles incluidos:
-- - SUBDECANO: aperez@uce.edu.ec
-- - DIRECTOR_CARRERA: zruiz@uce.edu.ec
-- - COORDINADOR_PRACTICAS: gmoncayo@uce.edu.ec
-- - TUTOR_ACADEMICO: jsalvador@uce.edu.ec y rmorales@uce.edu.ec
-- - ESTUDIANTE: jcestrella@uce.edu.ec (principal) y cflores@uce.edu.ec (secundario/casos limite)
-- ==========================================
INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, telefono, estado, borrado, version_token) VALUES
(1, 'aperez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ana Lucia', 'Perez Perez', '1711111119', 'CEDULA', 'SUBDECANO', NULL, '0987654321', 'ACTIVO', FALSE, 0),
-- Carrera 1: Computacion
(2, 'zruiz@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Zoila de Lourdes', 'Ruiz Chavez', '1711111115', 'CEDULA', 'DIRECTOR_CARRERA', 1, NULL, 'ACTIVO', FALSE, 0),
(3, 'gmoncayo@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Milton Giovanny', 'Moncayo Unda', '1711111118', 'CEDULA', 'COORDINADOR_PRACTICAS', 1, NULL, 'ACTIVO', FALSE, 0),
(4, 'jsalvador@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Jaime Oswaldo', 'Salvador Meneses', '1711111111', 'CEDULA', 'TUTOR_ACADEMICO', 1, NULL, 'ACTIVO', FALSE, 0),
(5, 'jcestrella@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Juan Carlos', 'Estrella Caicedo', '1723522403', 'CEDULA', 'ESTUDIANTE', 1, NULL, 'ACTIVO', FALSE, 0),
(6, 'cflores@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Andres', 'Flores Mieles', '1700000005', 'CEDULA', 'ESTUDIANTE', 1, NULL, 'ACTIVO', FALSE, 0),
(7, 'rmorales@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Roberto Patricio', 'Morales Viteri', '1711111120', 'CEDULA', 'TUTOR_ACADEMICO', 1, NULL, 'ACTIVO', FALSE, 0),
-- Carrera 2: Sistemas de Informacion
(8, 'mrivera@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mario Roberto', 'Rivera Diaz', '1711111116', 'CEDULA', 'DIRECTOR_CARRERA', 2, NULL, 'ACTIVO', FALSE, 0),
(9, 'kvega@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Karina Paola', 'Vega Rios', '1711111121', 'CEDULA', 'COORDINADOR_PRACTICAS', 2, NULL, 'ACTIVO', FALSE, 0),
(10, 'gcaiza@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gladys Patricia', 'Caiza Changoluisa', '1711111112', 'CEDULA', 'TUTOR_ACADEMICO', 2, NULL, 'ACTIVO', FALSE, 0),
(11, 'mgomez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Maria Fernanda', 'Gomez Ruiz', '1700000002', 'CEDULA', 'ESTUDIANTE', 2, NULL, 'ACTIVO', FALSE, 0),
-- Carrera 3: Mecanica
(12, 'atorres_dir@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alvaro Torres', 'Proanio', '1711111122', 'CEDULA', 'DIRECTOR_CARRERA', 3, NULL, 'ACTIVO', FALSE, 0),
(13, 'lsanchez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Luis Alfredo', 'Sanchez Mora', '1711111123', 'CEDULA', 'COORDINADOR_PRACTICAS', 3, NULL, 'ACTIVO', FALSE, 0),
(14, 'mroseras@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Marco Antonio', 'Rosero Andrade', '1711111113', 'CEDULA', 'TUTOR_ACADEMICO', 3, NULL, 'ACTIVO', FALSE, 0),
(15, 'plopez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Pedro Luis', 'Lopez Castro', '1700000003', 'CEDULA', 'ESTUDIANTE', 3, NULL, 'ACTIVO', FALSE, 0),
-- Carrera 4: Civil
(16, 'mrosas@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mauro Enrique', 'Rosas Solis', '1711111117', 'CEDULA', 'DIRECTOR_CARRERA', 4, NULL, 'ACTIVO', FALSE, 0),
(17, 'vherrera@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Victor Hugo', 'Herrera Ortiz', '1711111124', 'CEDULA', 'COORDINADOR_PRACTICAS', 4, NULL, 'ACTIVO', FALSE, 0),
(18, 'cizurieta@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Eduardo', 'Izurieta Cabrera', '1711111114', 'CEDULA', 'TUTOR_ACADEMICO', 4, NULL, 'ACTIVO', FALSE, 0),
(19, 'amartinez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ana Maria', 'Martinez Vega', '1700000004', 'CEDULA', 'ESTUDIANTE', 4, NULL, 'ACTIVO', FALSE, 0),
-- Carrera 5: Disenio Industrial
(20, 'dcastillo@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Diego Fernando', 'Castillo Narvaez', '1711111125', 'CEDULA', 'DIRECTOR_CARRERA', 5, NULL, 'ACTIVO', FALSE, 0),
(21, 'eparedes@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Elena Sofia', 'Paredes Mena', '1711111126', 'CEDULA', 'COORDINADOR_PRACTICAS', 5, NULL, 'ACTIVO', FALSE, 0),
(22, 'rbenitez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ramiro Xavier', 'Benitez Gomez', '1711111127', 'CEDULA', 'TUTOR_ACADEMICO', 5, NULL, 'ACTIVO', FALSE, 0),
(23, 'jcordero@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Juan Miguel', 'Cordero Paz', '1710000006', 'CEDULA', 'ESTUDIANTE', 5, NULL, 'ACTIVO', FALSE, 0);

-- Actualizar asignacion de autoridades a cada carrera
UPDATE carreras SET director_id = 2, coordinador_id = 3 WHERE id = 1;
UPDATE carreras SET director_id = 8, coordinador_id = 9 WHERE id = 2;
UPDATE carreras SET director_id = 12, coordinador_id = 13 WHERE id = 3;
UPDATE carreras SET director_id = 16, coordinador_id = 17 WHERE id = 4;
UPDATE carreras SET director_id = 20, coordinador_id = 21 WHERE id = 5;

-- ==========================================
-- 4. CONVENIOS (CONVENIO BASE PARA COMPUTACION)
-- ==========================================
INSERT INTO convenios (id, institucion, tipo, campo_especifico, fecha_inicio, fecha_fin, estado, tutor_institucional, correo_tutor, telefono_tutor, direccion, cupos_totales, nombre_documento, borrado) VALUES
(1, 'Google Ecuador - Sede Quito', 'PRIVADO', 611, '2024-01-15', '2029-01-15', 'ACTIVO', 'David Antonio Ortiz Castro', 'dortiz@google.com', '0999999991', 'Centro Corporativo Ekopark, Quito', 5, 'Convenio_Google_Firmado.pdf', FALSE);

INSERT INTO proyectos_comunitarios (nombre, descripcion, carrera_id, tutor_academico_id, estado, fecha_inicio, fecha_fin, borrado)
VALUES 
(
    'Alfabetización Digital para Adultos Mayores', 
    'Proyecto enfocado en enseñar el uso básico de teléfonos inteligentes y cajeros automáticos a la comunidad del sector norte.', 
    1,
    4, -- Tutor academico inicial (jsalvador@uce.edu.ec)
    'ACTIVO', 
    '2026-03-01', 
    '2026-07-31', 
    FALSE
),
(
    'Seguridad Informática para Escuelas Públicas', 
    'Talleres de concientización y protección de datos personales en redes sociales para estudiantes y docentes.', 
    1,
    NULL,
    'ACTIVO', 
    '2026-03-15', 
    '2026-08-15', 
    FALSE
),
(
    'Automatización de Bibliotecas Barriales', 
    'Implementación de catálogos digitales de software libre para centros culturales comunitarios.', 
    1,
    NULL,
    'ACTIVO', 
    '2026-04-01', 
    '2026-08-30', 
    FALSE
),
(
    'Huertos Urbanos Sostenibles', 
    'Capacitación y asesoría técnica en la creación de huertos orgánicos en espacios reducidos.', 
    2,
    null,
    'ACTIVO', 
    '2026-04-15', 
    '2026-09-15', 
    FALSE
),
(
    'Mantenimiento Preventivo de Maquinaria Comunitaria', 
    'Revisión y optimización técnica de maquinaria agrícola y herramientas comunitarias en parroquias rurales.', 
    3,
    null,
    'ACTIVO', 
    '2026-04-10', 
    '2026-09-10', 
    FALSE
),
(
    'Mejoramiento de Infraestructura Escolar Rural', 
    'Diagnóstico estructural y adecuación de espacios pedagógicos seguros en escuelas fiscales rurales.', 
    4,
    null,
    'ACTIVO', 
    '2026-04-05', 
    '2026-09-05', 
    FALSE
),
(
    'Diseño Ergonómico de Mobiliario Infantil Comunitario', 
    'Desarrollo participativo de mobiliario seguro y accesible para centros infantiles del Buen Vivir.', 
    5,
    null,
    'ACTIVO', 
    '2026-04-01', 
    '2026-09-01', 
    FALSE
),
(
    'Educación Financiera Básica Familiar', 
    'Talleres prácticos sobre ahorro, presupuesto y manejo de deudas para familias de escasos recursos.', 
    1, 
    null, 
    'FINALIZADO', 
    '2025-10-01', 
    '2026-02-28', 
    FALSE
);

-- ==========================================
-- 4. MATRICES CACES INICIALES
-- ==========================================
INSERT INTO matrices_caces (id, periodo_id, carrera_id, estado, fecha_generacion, borrado) VALUES
(1, 1, 1, 'PENDIENTE', CURRENT_TIMESTAMP, FALSE),
(2, 1, 2, 'PENDIENTE', CURRENT_TIMESTAMP, FALSE),
(3, 1, 3, 'PENDIENTE', CURRENT_TIMESTAMP, FALSE),
(4, 1, 4, 'PENDIENTE', CURRENT_TIMESTAMP, FALSE),
(5, 1, 5, 'PENDIENTE', CURRENT_TIMESTAMP, FALSE);

-- ==========================================
-- 5. SINCRONIZACION DE SECUENCIAS
-- ==========================================
SELECT setval(pg_get_serial_sequence('periodos_academicos', 'id'), COALESCE(MAX(id), 1)) FROM periodos_academicos;
SELECT setval(pg_get_serial_sequence('carreras', 'id'), COALESCE(MAX(id), 1)) FROM carreras;
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE(MAX(id), 1)) FROM usuarios;
SELECT setval(pg_get_serial_sequence('convenios', 'id'), COALESCE(MAX(id), 1)) FROM convenios;
SELECT setval(pg_get_serial_sequence('proyectos_comunitarios', 'id'), COALESCE(MAX(id), 1)) FROM proyectos_comunitarios;
SELECT setval(pg_get_serial_sequence('matrices_caces', 'id'), COALESCE(MAX(id), 1)) FROM matrices_caces;

