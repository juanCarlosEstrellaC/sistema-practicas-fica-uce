-- =============================================================================
-- DUMMY 2: SEMILLA COMPLETA DE PRUEBA (USUARIOS, CARRERAS, PRACTICAS Y VCS)
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

-- Desvincular autoridades circulares antes de truncar
UPDATE carreras SET director_id = NULL, coordinador_id = NULL;

TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE convenios CASCADE;
TRUNCATE TABLE carreras CASCADE;
TRUNCATE TABLE periodos_academicos CASCADE;

-- ==========================================
-- 1. PERIODOS ACADEMICOS
-- ==========================================
INSERT INTO periodos_academicos (id, nombre, fecha_inicio, fecha_fin, estado, borrado) VALUES
(1, '2025-2025', '2024-10-01', '2025-02-15', 'INACTIVO', FALSE),
(2, '2026-2026', '2025-04-07', '2025-08-30', 'ACTIVO', FALSE);

-- ==========================================
-- 2. CARRERAS DE LA FACULTAD
-- ==========================================
INSERT INTO carreras (id, nombre, codigo_carrera, ciudad_carrera, horas_practicas, horas_proyectos_comunitarios, borrado) VALUES 
(1, 'Ingenieria en Computacion', '650611A02', 'Distrito Metropolitano de Quito_Computacion', 240, 80, FALSE),
(2, 'Ingenieria Civil', '630611A02', 'Distrito Metropolitano de Quito_Civil', 240, 80, FALSE),
(3, 'Ingenieria en Disenio Industrial', '640611A02', 'Distrito Metropolitano de Quito_Disenio Industrial', 240, 80, FALSE),
(4, 'Ingenieria en Sistemas', '650612A02', 'Distrito Metropolitano de Quito_Sistemas', 240, 80, FALSE),
(5, 'Ingenieria Mecanica', '620611A02', 'Distrito Metropolitano de Quito_Mecanica', 296, 80, FALSE);

-- ==========================================
-- 3. USUARIOS
-- Clave para todos los usuarios: labcom,2015
-- Hash bcrypt: $2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle
-- ==========================================

-- 3.1 Estudiantes base
INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES
(1, 'jperez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Juan Pablo', 'Perez Salazar', '1700000001', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(2, 'mgomez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Maria Fernanda', 'Gomez Ruiz', '1700000002', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(3, 'plopez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Pedro Luis', 'Lopez Castro', '1700000003', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(4, 'amartinez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ana Maria', 'Martinez Vega', '1700000004', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(5, 'cflores@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Andres', 'Flores Mieles', '1700000005', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(6, 'jcordero@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Juan Miguel', 'Cordero Paz', '1710000006', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(7, 'mgarcia@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Monica Alexandra', 'Garcia Lopez', '1710000007', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(8, 'palopez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Pablo Andres', 'Lopez Silva', '1710000008', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(9, 'atorres@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Andres Felipe', 'Torres Mora', '1710000009', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(10, 'dsilva@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Daniela Estefania', 'Silva Rios', '1710000010', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(11, 'rrodriguez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Roberto Carlos', 'Rodriguez Vaca', '1710000011', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(12, 'lmartinez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Lucia Belen', 'Martinez Cruz', '1710000012', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(13, 'sgomez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Sofia Carolina', 'Gomez Jaramillo', '1710000013', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(14, 'kcastro@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Kevin Alexander', 'Castro Pino', '1710000014', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(15, 'jcestrella@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Juan Carlos', 'Estrella Caicedo', '1723522403', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(16, 'emontes@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Esteban Javier', 'Montes Orellana', '1710000016', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(17, 'nromero@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Natalia del Carmen', 'Romero Vera', '1710000017', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(18, 'jquispe@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Julia Ines', 'Quispe Mamani', '1710000018', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0);

-- 3.2 Tutores Academicos
INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES
(19, 'jsalvador@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Jaime Oswaldo', 'Salvador Meneses', '1711111111', 'CEDULA', 'TUTOR_ACADEMICO', 1, 'ACTIVO', FALSE, 0),
(20, 'gcaiza@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gladys Patricia', 'Caiza Changoluisa', '1711111112', 'CEDULA', 'TUTOR_ACADEMICO', 2, 'ACTIVO', FALSE, 0),
(21, 'mroseras@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Marco Antonio', 'Rosero Andrade', '1711111113', 'CEDULA', 'TUTOR_ACADEMICO', 3, 'ACTIVO', FALSE, 0),
(22, 'cizurieta@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Eduardo', 'Izurieta Cabrera', '1711111114', 'CEDULA', 'TUTOR_ACADEMICO', 4, 'ACTIVO', FALSE, 0);

-- 3.3 Autoridades de Carrera y Subdecanato
INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES
(23, 'zruiz@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Zoila de Lourdes', 'Ruiz Chavez', '1711111115', 'CEDULA', 'DIRECTOR_CARRERA', 1, 'ACTIVO', FALSE, 0),
(24, 'mrivera@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mario Roberto', 'Rivera Diaz', '1711111116', 'CEDULA', 'DIRECTOR_CARRERA', 2, 'ACTIVO', FALSE, 0),
(25, 'mrosas@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mauro Enrique', 'Rosas Solis', '1711111117', 'CEDULA', 'DIRECTOR_CARRERA', 4, 'ACTIVO', FALSE, 0),
(26, 'gmoncayo@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Milton Giovanny', 'Moncayo Unda', '1711111118', 'CEDULA', 'COORDINADOR_PRACTICAS', 1, 'ACTIVO', FALSE, 0),
(27, 'aperez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ana Lucia', 'Perez Perez', '1711111119', 'CEDULA', 'SUBDECANO', NULL, 'ACTIVO', FALSE, 0);
UPDATE usuarios SET telefono = '0987654321' WHERE correo = 'aperez@uce.edu.ec';

-- 3.4 Estudiantes adicionales para pruebas de carga
INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES
(28, 'arodriguez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ana Belen', 'Rodriguez Sanchez', '1745678901', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(29, 'cmorales@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Andres', 'Morales Ruiz', '1756789012', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(30, 'lherrera@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Lucia Fernanda', 'Herrera Castro', '1767890123', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(31, 'dchavez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Diego Martin', 'Chavez Torres', '1778901234', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(32, 'rflores@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Roberto Carlos', 'Flores Guerrero', '1790123456', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(33, 'aheredia@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alvaro Jose', 'Heredia Valle', '1710000101', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(34, 'bcastro@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Beatriz Elena', 'Castro Pena', '1710000102', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(35, 'cdiaz@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Carlos Luis', 'Diaz Mera', '1710000103', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(36, 'dlopez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Diana Patricia', 'Lopez Cruz', '1710000104', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(37, 'emartinez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Esteban Daniel', 'Martinez Solis', '1710000105', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(38, 'fmorales@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Fernanda Isabel', 'Morales Pinto', '1710000106', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(39, 'gnarvaez@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gabriel Omar', 'Narvaez Vaca', '1710000107', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(40, 'hortiz@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Helena Beatriz', 'Ortiz Luna', '1710000108', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(41, 'iparedes@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ivan Marcelo', 'Paredes Cueva', '1710000109', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0);

-- Actualizar asignacion de autoridades a carreras
UPDATE carreras SET director_id = 23, coordinador_id = 26 WHERE id = 1;
UPDATE carreras SET director_id = 24 WHERE id = 2;
UPDATE carreras SET director_id = 25 WHERE id = 4;

-- ==========================================
-- 4. CONVENIOS
-- ==========================================
INSERT INTO convenios (id, institucion, tipo, campo_especifico, fecha_inicio, fecha_fin, estado, tutor_institucional, correo_tutor, telefono_tutor, direccion, cupos_totales, nombre_documento, borrado) VALUES
(1, 'Google Ecuador - Sede Quito', 'PRIVADO', 611, '2024-01-15', '2029-01-15', 'ACTIVO', 'David Antonio Ortiz Castro', 'dortiz@google.com', '0999999991', 'Centro Corporativo Ekopark, Quito', 5, 'Convenio_Google_Firmado.pdf', FALSE),
(2, 'Kruger Corp - Software House', 'PRIVADO', 612, '2023-06-01', '2025-06-01', 'POR_EXPIRAR', 'Ernesto Javier Kruger Vera', 'desarrollo@krugercorp.com', '0999999992', 'Avenida 12 de Octubre, Quito', 3, 'Acuerdo_Kruger.pdf', FALSE),
(3, 'TechCorp Ecuador', 'PRIVADO', 611, '2024-03-01', '2029-03-01', 'ACTIVO', 'Fernando Jose Salazar Ruiz', 'fsalazar@techcorp.ec', '0999999993', 'Av. Republica del Salvador N34-127, Quito', 10, 'TechCorp_Convenio_Marco.pdf', FALSE),
(4, 'Microsoft Development Center', 'PRIVADO', 611, '2024-02-15', '2029-02-15', 'ACTIVO', 'Diana Patricia Arismendi Paz', 'darismendi@microsoft.com', '0999999994', 'Edificio Metropolitan, Quito', 8, 'Microsoft_Alianza_Estrategica.pdf', FALSE),
(5, 'SoftServe - Software Engineering', 'PRIVADO', 612, '2023-09-01', '2025-09-01', 'POR_EXPIRAR', 'Marco Vinicio Jaramillo Torres', 'mjaramillo@softserveinc.com', '0999999995', 'Quito, Ecuador', 4, 'SoftServe_Acuerdo.pdf', FALSE),
(6, 'Banco Pichincha - Centro de Innovacion TI', 'PRIVADO', 611, '2024-01-01', '2029-01-01', 'ACTIVO', 'Daniela Maria Mora Silva', 'dmora@pichincha.com', '0999999996', 'Av. Amazonas N21-147, Quito', 12, 'BP_Innovacion_TI_Convenio.pdf', FALSE);

-- ==========================================
-- 5. PRACTICAS PREPROFESIONALES (PP)
-- ==========================================

-- Procesos de practicas
INSERT INTO procesos_practicas (id, estudiante_id, carrera_id, horas_requeridas, horas_acumuladas, estado) VALUES
(1, 7, 3, 240, 0, 'EN_CURSO'),
(2, 1, 1, 240, 240, 'COMPLETADO'),
(3, 28, 1, 240, 0, 'EN_CURSO'),
(4, 29, 1, 240, 0, 'EN_CURSO'),
(5, 33, 1, 240, 240, 'COMPLETADO'),
(6, 34, 1, 240, 240, 'COMPLETADO'),
(7, 35, 1, 240, 240, 'COMPLETADO'),
(8, 36, 1, 240, 240, 'COMPLETADO'),
(9, 37, 1, 240, 240, 'COMPLETADO'),
(10, 38, 1, 240, 240, 'COMPLETADO'),
(11, 39, 1, 240, 240, 'COMPLETADO'),
(12, 40, 1, 240, 240, 'COMPLETADO'),
(13, 41, 1, 240, 240, 'COMPLETADO'),
(14, 18, 3, 240, 240, 'COMPLETADO'),
(15, 2, 2, 240, 240, 'COMPLETADO');

-- Asignaciones de practicas
INSERT INTO asignaciones_practicas (id, proceso_id, convenio_id, tutor_academico_id, tutor_institucional, semestre, horas_asignadas, horas_completadas, fecha_inicio, fecha_fin, estado, fase, periodo_id, borrado) VALUES
(1, 1, 3, 21, 'Fernando Jose Salazar Ruiz', 8, 240, 45, '2025-04-07', NULL, 'EN_CURSO', 'DESARROLLO', 2, FALSE),
(2, 2, 6, 21, 'Daniela Maria Mora Silva', 8, 240, 240, '2025-04-07', '2025-06-15', 'APROBADO', 'FINALIZACION', 2, FALSE),
(3, 3, 1, 22, 'David Antonio Ortiz Castro', 8, 240, 60, '2025-04-07', NULL, 'EN_CURSO', 'DESARROLLO', 2, FALSE),
(4, 4, 6, 22, 'Daniela Maria Mora Silva', 8, 240, 20, '2025-04-07', NULL, 'EN_CURSO', 'DESARROLLO', 2, FALSE),
(5, 5, 1, 22, 'David Antonio Ortiz Castro', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(6, 6, 1, 22, 'David Antonio Ortiz Castro', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(7, 7, 2, 19, 'Ernesto Javier Kruger Vera', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 2, FALSE),
(8, 8, 2, 19, 'Ernesto Javier Kruger Vera', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(9, 9, 4, 19, 'Diana Patricia Arismendi Paz', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(10, 10, 4, 19, 'Diana Patricia Arismendi Paz', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(11, 11, 5, 19, 'Marco Vinicio Jaramillo Torres', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(12, 12, 5, 19, 'Marco Vinicio Jaramillo Torres', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(13, 13, 3, 19, 'Fernando Jose Salazar Ruiz', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(14, 14, 6, 19, 'Daniela Maria Mora Silva', 8, 240, 240, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(15, 15, 1, 21, 'Tutor Inst 1', 8, 80, 80, '2023-10-01', '2024-02-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(16, 15, 1, 21, 'Tutor Inst 1', 8, 80, 80, '2024-04-01', '2024-08-15', 'APROBADO', 'FINALIZACION', 1, FALSE),
(17, 15, 2, 21, 'Tutor Inst 2', 8, 80, 80, '2024-10-01', '2025-02-15', 'APROBADO', 'FINALIZACION', 2, FALSE);

-- Documentos de portafolio
INSERT INTO documentos_portafolio (id, estudiante_id, tipo, nombre_archivo, url_archivo, fecha_subida, firmado, asignacion_id, estado, observacion, borrado) VALUES
(1, 7, 'CV', 'CV_MariaGarcia.pdf', '/docs/cv_e1.pdf', '2025-03-20', FALSE, NULL, 'APROBADO', NULL, FALSE),
(2, 7, 'DOCUMENTO_IDENTIDAD', 'Cedula_MariaGarcia.pdf', '/docs/cedula_e1.pdf', '2025-03-20', FALSE, NULL, 'APROBADO', NULL, FALSE),
(3, 7, 'CARTA_ASIGNACION', 'Carta_Asignacion_MariaGarcia.pdf', '/docs/carta_e1.pdf', '2025-04-01', TRUE, 1, 'APROBADO', NULL, FALSE),
(4, 1, 'CV', 'CV_JuanPerez.pdf', '/docs/cv_e2.pdf', '2025-03-18', FALSE, NULL, 'APROBADO', NULL, FALSE),
(5, 1, 'DOCUMENTO_IDENTIDAD', 'Cedula_JuanPerez.pdf', '/docs/cedula_e2.pdf', '2025-03-18', FALSE, NULL, 'RECHAZADO', 'La cedula se ve borrosa, por favor subala con mejor resolucion.', FALSE),
(6, 1, 'CARTA_ASIGNACION', 'Carta_Asignacion_JuanPerez.pdf', '/docs/carta_e2.pdf', '2025-04-01', TRUE, 2, 'APROBADO', NULL, FALSE),
(7, 1, 'AVAL', 'Aval_JuanPerez.pdf', '/docs/aval_e2.pdf', '2025-06-16', TRUE, 2, 'APROBADO', NULL, FALSE),
(8, 33, 'AVAL', 'Aval_AlvaroHeredia.pdf', '/docs/aval_eh1.pdf', '2025-02-16', TRUE, 5, 'APROBADO', NULL, FALSE),
(9, 34, 'AVAL', 'Aval_BeatrizCastro.pdf', '/docs/aval_eh2.pdf', '2025-02-16', TRUE, 6, 'APROBADO', NULL, FALSE),
(10, 35, 'AVAL', 'Aval_CarlosDiaz.pdf', '/docs/aval_eh3.pdf', '2025-02-16', TRUE, 7, 'APROBADO', NULL, FALSE),
(11, 36, 'AVAL', 'Aval_DianaLopez.pdf', '/docs/aval_eh4.pdf', '2025-02-16', TRUE, 8, 'APROBADO', NULL, FALSE),
(12, 37, 'AVAL', 'Aval_EstebanMartinez.pdf', '/docs/aval_eh5.pdf', '2025-02-16', TRUE, 9, 'APROBADO', NULL, FALSE),
(13, 38, 'AVAL', 'Aval_FernandaMorales.pdf', '/docs/aval_eh6.pdf', '2025-02-16', TRUE, 10, 'APROBADO', NULL, FALSE),
(14, 39, 'AVAL', 'Aval_GabrielNarvaez.pdf', '/docs/aval_eh7.pdf', '2025-02-16', TRUE, 11, 'APROBADO', NULL, FALSE),
(15, 40, 'AVAL', 'Aval_HelenaOrtiz.pdf', '/docs/aval_eh8.pdf', '2025-02-16', TRUE, 12, 'APROBADO', NULL, FALSE),
(16, 41, 'AVAL', 'Aval_IvanParedes.pdf', '/docs/aval_eh9.pdf', '2025-02-16', TRUE, 13, 'APROBADO', NULL, FALSE),
(17, 18, 'AVAL', 'Aval_JuliaQuispe.pdf', '/docs/aval_eh10.pdf', '2025-02-16', TRUE, 14, 'APROBADO', NULL, FALSE),
(18, 7, 'MATRIZ_CACES', 'Matriz_MariaGarcia.xlsx', '/docs/matriz_e1.xlsx', '2025-05-15', FALSE, 1, 'PENDIENTE_REVISION', NULL, FALSE),
(19, 7, 'CERTIFICADO_CUMPLIMIENTO', 'Certificado_MariaGarcia.pdf', '/docs/cert_e1.pdf', '2025-05-15', FALSE, 1, 'PENDIENTE_REVISION', NULL, FALSE),
(20, 2, 'CV', 'CV_MariaGomez.pdf', '/docs/cv_mgomez.pdf', '2023-09-15', FALSE, NULL, 'APROBADO', NULL, FALSE),
(21, 2, 'DOCUMENTO_IDENTIDAD', 'Cedula_MariaGomez.pdf', '/docs/cedula_mgomez.pdf', '2023-09-15', FALSE, NULL, 'APROBADO', NULL, FALSE),
(22, 2, 'CARTA_ASIGNACION', 'Carta_Asignacion1_MariaGomez.pdf', '/docs/carta_1_mgomez.pdf', '2023-10-01', TRUE, 15, 'APROBADO', NULL, FALSE),
(23, 2, 'INFORME_FINAL', 'Informe_1_MariaGomez.pdf', '/docs/informe_1.pdf', '2024-02-15', TRUE, 15, 'APROBADO', NULL, FALSE),
(24, 2, 'CARTA_ASIGNACION', 'Carta_Asignacion2_MariaGomez.pdf', '/docs/carta_2_mgomez.pdf', '2024-04-01', TRUE, 16, 'APROBADO', NULL, FALSE),
(25, 2, 'INFORME_FINAL', 'Informe_2_MariaGomez.pdf', '/docs/informe_2.pdf', '2024-08-15', TRUE, 16, 'APROBADO', NULL, FALSE),
(26, 2, 'CARTA_ASIGNACION', 'Carta_Asignacion3_MariaGomez.pdf', '/docs/carta_3_mgomez.pdf', '2024-10-01', TRUE, 17, 'APROBADO', NULL, FALSE),
(27, 2, 'INFORME_FINAL', 'Informe_3_MariaGomez.pdf', '/docs/informe_3.pdf', '2025-02-15', TRUE, 17, 'APROBADO', NULL, FALSE);

-- Notificaciones del sistema
INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, tipo, accion_url, leida, fecha) VALUES
(1, 7, 'Asignacion Confirmada', 'Has sido asignado a TechCorp Ecuador para tus practicas pre profesionales.', 'EXITO', '/dashboard/practicas/mi-practica', FALSE, '2025-04-01'),
(2, 7, 'Recordatorio', 'Recuerda subir tu evidencia semanal de actividades.', 'INFORMACION', '/dashboard/practicas/mi-practica', TRUE, '2025-04-15'),
(3, 21, 'Nuevo Estudiante Asignado', 'Se ha asignado un nuevo estudiante a tu tutoria: Monica Garcia Lopez.', 'INFORMACION', '/dashboard/practicas/estudiantes?openEstudiante=7', FALSE, '2025-04-01'),
(4, 27, 'Convenio por Expirar', 'El convenio con Kruger Corp expira en 60 dias.', 'ADVERTENCIA', '/dashboard/practicas/convenios', FALSE, '2025-04-01'),
(5, 27, 'Practicas Completadas', 'Juan Perez Martinez ha completado sus horas de practicas pre profesionales.', 'EXITO', '/dashboard/practicas/matriz-caces', FALSE, '2025-06-15');

-- Observaciones
INSERT INTO observaciones (id, remitente_id, carrera_id, convenio_id, empresa, tipo, contacto, correo, descripcion, estado, borrado) VALUES
(1, 1, 1, NULL, 'Globant Ecuador', 'NUEVA', 'Juan Gonzalez', 'jgonzalez@globant.com', 'Empresa lider en desarrollo de software, ideal para practicas.', 'PENDIENTE', FALSE),
(2, 26, 1, 2, NULL, 'ANULACION', NULL, NULL, 'El convenio con Kruger Corp esta por expirar y ya no reciben estudiantes.', 'PENDIENTE', FALSE);

-- ==========================================
-- 6. VINCULACION CON LA SOCIEDAD (VCS)
-- ==========================================

-- Proyectos comunitarios
INSERT INTO proyectos_comunitarios (id, nombre, descripcion, carrera_id, tutor_academico_id, estado, fecha_inicio, fecha_fin, fecha_creacion, borrado) VALUES
(1, 'Alfabetizacion Digital en Comunidades Rurales', 'Capacitacion en uso de herramientas ofimaticas y navegacion segura por internet para comunidades rurales.', 1, 19, 'ACTIVO', '2025-01-15', '2025-06-30', NOW(), FALSE),
(2, 'Desarrollo de Software para Centros de Salud Comunitarios', 'Implementacion de modulos web de gestion de citas y fichas medicas basicas para centros comunitarios de salud.', 1, 19, 'ACTIVO', '2025-02-01', '2025-07-31', NOW(), FALSE),
(3, 'Ciberseguridad Ciudadana y Prevencion de Fraudes', 'Talleres practicos de seguridad informatica orientados a adultos mayores y microempresarios de la zona.', 1, NULL, 'ACTIVO', '2025-03-01', '2025-08-31', NOW(), FALSE);

-- Procesos de vinculacion
INSERT INTO procesos_vinculacion (id, estudiante_id, carrera_id, horas_requeridas, horas_acumuladas, estado, fecha_creacion) VALUES
(1, 1, 1, 80, 0, 'EN_CURSO', NOW()),
(2, 5, 1, 80, 20, 'EN_CURSO', NOW()),
(3, 15, 1, 80, 40, 'EN_CURSO', NOW()),
(4, 28, 1, 80, 0, 'EN_CURSO', NOW()),
(5, 29, 1, 80, 30, 'EN_CURSO', NOW()),
(6, 30, 1, 80, 60, 'EN_CURSO', NOW()),
(7, 31, 1, 80, 0, 'EN_CURSO', NOW()),
(8, 32, 1, 80, 10, 'EN_CURSO', NOW()),
(9, 33, 1, 80, 50, 'EN_CURSO', NOW());

-- Asignaciones a proyectos comunitarios
INSERT INTO asignaciones_proyectos_comunitarios (id, proceso_vinculacion_id, proyecto_comunitario_id, periodo_id, horas_asignadas, horas_completadas, fecha_inicio, fecha_fin, estado, fase_actual, documentos_validados, url_certificado, fecha_creacion, borrado) VALUES
(1, 1, 1, 2, 80, 0, '2025-04-07', '2025-08-30', 'EN_CURSO', 'ASIGNACION', FALSE, NULL, NOW(), FALSE),
(2, 2, 1, 2, 80, 20, '2025-04-07', '2025-08-30', 'EN_CURSO', 'DESARROLLO', FALSE, NULL, NOW(), FALSE),
(3, 3, 2, 2, 80, 40, '2025-04-07', '2025-08-30', 'EN_CURSO', 'DESARROLLO', FALSE, NULL, NOW(), FALSE),
(4, 5, 2, 2, 80, 30, '2025-04-07', '2025-08-30', 'EN_CURSO', 'DESARROLLO', FALSE, NULL, NOW(), FALSE),
(5, 6, 3, 2, 80, 60, '2025-04-07', '2025-08-30', 'EN_CURSO', 'DESARROLLO', FALSE, NULL, NOW(), FALSE);

-- ==========================================
-- 7. SINCRONIZACION DINAMICA DE SECUENCIAS
-- ==========================================
SELECT setval(pg_get_serial_sequence('periodos_academicos', 'id'), COALESCE(MAX(id), 1)) FROM periodos_academicos;
SELECT setval(pg_get_serial_sequence('carreras', 'id'), COALESCE(MAX(id), 1)) FROM carreras;
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE(MAX(id), 1)) FROM usuarios;
SELECT setval(pg_get_serial_sequence('convenios', 'id'), COALESCE(MAX(id), 1)) FROM convenios;
SELECT setval(pg_get_serial_sequence('observaciones', 'id'), COALESCE(MAX(id), 1)) FROM observaciones;
SELECT setval(pg_get_serial_sequence('procesos_practicas', 'id'), COALESCE(MAX(id), 1)) FROM procesos_practicas;
SELECT setval(pg_get_serial_sequence('asignaciones_practicas', 'id'), COALESCE(MAX(id), 1)) FROM asignaciones_practicas;
SELECT setval(pg_get_serial_sequence('documentos_portafolio', 'id'), COALESCE(MAX(id), 1)) FROM documentos_portafolio;
SELECT setval(pg_get_serial_sequence('notificaciones', 'id'), COALESCE(MAX(id), 1)) FROM notificaciones;
SELECT setval(pg_get_serial_sequence('proyectos_comunitarios', 'id'), COALESCE(MAX(id), 1)) FROM proyectos_comunitarios;
SELECT setval(pg_get_serial_sequence('procesos_vinculacion', 'id'), COALESCE(MAX(id), 1)) FROM procesos_vinculacion;
SELECT setval(pg_get_serial_sequence('asignaciones_proyectos_comunitarios', 'id'), COALESCE(MAX(id), 1)) FROM asignaciones_proyectos_comunitarios;
