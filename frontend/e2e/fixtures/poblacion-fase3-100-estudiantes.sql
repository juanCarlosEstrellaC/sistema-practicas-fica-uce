-- =============================================================================
-- FASE 3: POBLACIÓN DE CARGA REAL (100 ESTUDIANTES - 20 POR CARRERA)
-- =============================================================================

-- 1. Actualizar convenios con cupos suficientes para absorber la carga
UPDATE convenios SET cupos_totales = 80 WHERE id = 1;

INSERT INTO convenios (id, institucion, tipo, campo_especifico, fecha_inicio, fecha_fin, estado, tutor_institucional, correo_tutor, telefono_tutor, direccion, cupos_totales, nombre_documento, borrado)
VALUES 
(2, 'Corporación Nacional de Telecomunicaciones CNT EP', 'PUBLICO', 612, '2025-01-01', '2028-12-31', 'ACTIVO', 'Ing. Fabian Gomez', 'fgomez@cnt.gob.ec', '0981112233', 'Av. Amazonas y Veintimilla, Quito', 80, 'Convenio_CNT_Firmado.pdf', FALSE),
(3, 'Empresa Pública Metropolitana de Obras Públicas EPMMOP', 'PUBLICO', 631, '2025-01-01', '2028-12-31', 'ACTIVO', 'Ing. Patricia Valle', 'pvalle@epmmop.gob.ec', '0984445566', 'Av. 9 de Octubre y Patria, Quito', 80, 'Convenio_EPMMOP_Firmado.pdf', FALSE)
ON CONFLICT (id) DO UPDATE SET 
  institucion = EXCLUDED.institucion,
  cupos_totales = 80,
  estado = 'ACTIVO';

-- 2. Limpiar previamente registros del rango de carga (101 al 200)
DELETE FROM documentos_portafolio WHERE estudiante_id BETWEEN 101 AND 200;
DELETE FROM evidencias_asignaciones_vcs WHERE estudiante_id BETWEEN 101 AND 200;
DELETE FROM procesos_practicas WHERE estudiante_id BETWEEN 101 AND 200;
DELETE FROM procesos_vinculacion WHERE estudiante_id BETWEEN 101 AND 200;
DELETE FROM usuarios WHERE id BETWEEN 101 AND 200;

-- 3. Inserción de 100 estudiantes distribuidos equitativamente (20 por carrera)
-- Contraseña general para todos: 123456 (Hash BCrypt: $2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle)

INSERT INTO usuarios (id, correo, clave_hash, nombres, apellidos, identificacion, tipo_identificacion, rol, carrera_id, estado, borrado, version_token) VALUES
-- Carrera 1: Ingeniería en Computación (IDs 101 - 120)
(101, 'est_comp_01@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mateo Sebastian', 'Aguirre Morales', '1750000101', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(102, 'est_comp_02@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Sofia Camila', 'Benitez Alvarez', '1750000102', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(103, 'est_comp_03@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'David Alejandro', 'Castro Bravo', '1750000103', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(104, 'est_comp_04@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Valeria Nicole', 'Duran Carrillo', '1750000104', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(105, 'est_comp_05@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Martin Nicolas', 'Espinoza Delgado', '1750000105', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(106, 'est_comp_06@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Camila Andrea', 'Figueroa Falcon', '1750000106', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(107, 'est_comp_07@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Daniel Esteban', 'Guerrero Garcia', '1750000107', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(108, 'est_comp_08@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Paula Micaela', 'Heredia Hidalgo', '1750000108', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(109, 'est_comp_09@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Lucas Gabriel', 'Ibarra Jaramillo', '1750000109', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(110, 'est_comp_10@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Martina Elena', 'Lara Lopez', '1750000110', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(111, 'est_comp_11@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Joaquin Eduardo', 'Mendoza Molina', '1750000111', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(112, 'est_comp_12@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Isabella Victoria', 'Navarro Ortiz', '1750000112', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(113, 'est_comp_13@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Nicolas Felipe', 'Perez Pacheco', '1750000113', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(114, 'est_comp_14@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Emma Julieta', 'Quintero Ramos', '1750000114', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(115, 'est_comp_15@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Emilio Xavier', 'Rios Salazar', '1750000115', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(116, 'est_comp_16@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Renata Salome', 'Santillan Torres', '1750000116', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(117, 'est_comp_17@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Samuel Isaac', 'Tapia Urgiles', '1750000117', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(118, 'est_comp_18@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Antonella Belen', 'Valdivieso Vera', '1750000118', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(119, 'est_comp_19@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Thiago Rodrigo', 'Zambrano Yanez', '1750000119', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),
(120, 'est_comp_20@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Luciana Romina', 'Andrade Barreto', '1750000120', 'CEDULA', 'ESTUDIANTE', 1, 'ACTIVO', FALSE, 0),

-- Carrera 2: Ingeniería en Sistemas de Información (IDs 121 - 140)
(121, 'est_sist_01@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Adrian Marcelo', 'Cabrera Cevallos', '1750000121', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(122, 'est_sist_02@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mia Alejandra', 'Diaz Dominguez', '1750000122', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(123, 'est_sist_03@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gael Leonardo', 'Enriquez Fuentes', '1750000123', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(124, 'est_sist_04@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Zoe Valentina', 'Guzman Heredia', '1750000124', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(125, 'est_sist_05@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ian Gonzalo', 'Intriago Jurado', '1750000125', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(126, 'est_sist_06@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Sara Monserrath', 'Loor Macias', '1750000126', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(127, 'est_sist_07@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Axel Benjamin', 'Moreno Noboa', '1750000127', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(128, 'est_sist_08@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Luna Daniela', 'Ochoa Palacios', '1750000128', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(129, 'est_sist_09@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Maximiliano', 'Paredes Quintana', '1750000129', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(130, 'est_sist_10@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Julieta Cristina', 'Reyes Rosales', '1750000130', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(131, 'est_sist_11@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Bruno Damian', 'Silva Teran', '1750000131', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(132, 'est_sist_12@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alicia Gabriela', 'Ubidia Vallejo', '1750000132', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(133, 'est_sist_13@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Facundo Martin', 'Viteri Wong', '1750000133', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(134, 'est_sist_14@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ambar Luciana', 'Yepez Zavala', '1750000134', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(135, 'est_sist_15@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Santino Andres', 'Acosta Barba', '1750000135', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(136, 'est_sist_16@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Miranda Rocio', 'Brito Cuesta', '1750000136', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(137, 'est_sist_17@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Dante Mauricio', 'Chavez Erazo', '1750000137', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(138, 'est_sist_18@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Bianca Estefania', 'Flores Garces', '1750000138', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(139, 'est_sist_19@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Camilo Ernesto', 'Herrera Iriarte', '1750000139', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),
(140, 'est_sist_20@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Catalina Maria', 'Jacome Leon', '1750000140', 'CEDULA', 'ESTUDIANTE', 2, 'ACTIVO', FALSE, 0),

-- Carrera 3: Ingeniería Mecánica (IDs 141 - 160)
(141, 'est_meca_01@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Bautista Jose', 'Medina Mora', '1750000141', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(142, 'est_meca_02@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Abril Jimena', 'Naranjo Orellana', '1750000142', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(143, 'est_meca_03@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Agustin Dario', 'Pazmino Quishpe', '1750000143', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(144, 'est_meca_04@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Clara Patricia', 'Rivadeneira Silva', '1750000144', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(145, 'est_meca_05@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Tomas Ariel', 'Trujillo Villacis', '1750000145', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(146, 'est_meca_06@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alma Dolores', 'Yandun Zurita', '1750000146', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(147, 'est_meca_07@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Felipe Hernan', 'Alarcon Barreno', '1750000147', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(148, 'est_meca_08@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Guadalupe Luz', 'Calvache Donoso', '1750000148', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(149, 'est_meca_09@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Simon Alberto', 'Escudero Freire', '1750000149', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(150, 'est_meca_10@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Constanza Ines', 'Galarza Haro', '1750000150', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(151, 'est_meca_11@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Tobias Efrain', 'Jimenez Luna', '1750000151', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(152, 'est_meca_12@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Esperanza Alba', 'Montero Nunez', '1750000152', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(153, 'est_meca_13@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Geronimo Raul', 'Olmedo Pinto', '1750000153', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(154, 'est_meca_14@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Candelaria Flor', 'Reinoso Saenz', '1750000154', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(155, 'est_meca_15@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alonso Vicente', 'Tello Uquillas', '1750000155', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(156, 'est_meca_16@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Pilar Mercedes', 'Villacres Yepez', '1750000156', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(157, 'est_meca_17@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Manuel Ricardo', 'Zamudio Arias', '1750000157', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(158, 'est_meca_18@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Regina Beatriz', 'Bustamante Carrera', '1750000158', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(159, 'est_meca_19@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Pedro Antonio', 'Correa Daza', '1750000159', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),
(160, 'est_meca_20@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Silvia Teresa', 'Espinoza Fiallos', '1750000160', 'CEDULA', 'ESTUDIANTE', 3, 'ACTIVO', FALSE, 0),

-- Carrera 4: Ingeniería Civil (IDs 161 - 180)
(161, 'est_civi_01@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Bernardo Cesar', 'Gomez Garzon', '1750000161', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(162, 'est_civi_02@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Aitana Raquel', 'Hurtado Illingworth', '1750000162', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(163, 'est_civi_03@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Cristobal Rene', 'Jaramillo Klaus', '1750000163', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(164, 'est_civi_04@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Fatima Lucia', 'Lema Maldonado', '1750000164', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(165, 'est_civi_05@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Esteban Gonzalo', 'Mora Noboa', '1750000165', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(166, 'est_civi_06@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Marina Eugenia', 'Orbe Ponce', '1750000166', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(167, 'est_civi_07@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Rodrigo Javier', 'Quinatoa Rios', '1750000167', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(168, 'est_civi_08@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Josefina Clara', 'Salas Tinajero', '1750000168', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(169, 'est_civi_09@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Mauricio Edgar', 'Ulloa Valencia', '1750000169', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(170, 'est_civi_10@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Elisa Mariana', 'Vaca Yanez', '1750000170', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(171, 'est_civi_11@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Salvador Joel', 'Zaldumbide Arcos', '1750000171', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(172, 'est_civi_12@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gloria Cecilia', 'Barba Cardenas', '1750000172', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(173, 'est_civi_13@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Leonardo Pablo', 'Cordero Davila', '1750000173', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(174, 'est_civi_14@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Nuria Susana', 'Espinoza Fabara', '1750000174', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(175, 'est_civi_15@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Marcos Anibal', 'Guerra Holguin', '1750000175', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(176, 'est_civi_16@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Lourdes Ximena', 'Iturralde Jurado', '1750000176', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(177, 'est_civi_17@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Federico Hugo', 'Lascano Mera', '1750000177', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(178, 'est_civi_18@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Beatriz Amelia', 'Montalvo Narvaez', '1750000178', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(179, 'est_civi_19@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Alvaro Cristian', 'Ojeda Perez', '1750000179', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),
(180, 'est_civi_20@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Tania Isabel', 'Paredes Riofrio', '1750000180', 'CEDULA', 'ESTUDIANTE', 4, 'ACTIVO', FALSE, 0),

-- Carrera 5: Ingeniería en Diseño Industrial (IDs 181 - 200)
(181, 'est_dise_01@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Vicente Boris', 'Santacruz Tapia', '1750000181', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(182, 'est_dise_02@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Diana Marcela', 'Torres Ureña', '1750000182', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(183, 'est_dise_03@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Hector Rodrigo', 'Vallejo Viteri', '1750000183', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(184, 'est_dise_04@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Lorena Raquel', 'Ycaza Zambrano', '1750000184', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(185, 'est_dise_05@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Jaime Wilson', 'Albuja Borja', '1750000185', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(186, 'est_dise_06@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Adriana Carola', 'Correa Daza', '1750000186', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(187, 'est_dise_07@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ramiro Boris', 'Davila Echeverria', '1750000187', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(188, 'est_dise_08@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Silvana Paola', 'Franco Guzman', '1750000188', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(189, 'est_dise_09@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gustavo Adolfo', 'Herrera Idrobo', '1750000189', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(190, 'est_dise_10@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Monica Andrea', 'Jijon Lasso', '1750000190', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(191, 'est_dise_11@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Hernan Danilo', 'Montenegro Naranjo', '1750000191', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(192, 'est_dise_12@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ruth Amanda', 'Orellana Paz', '1750000192', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(193, 'est_dise_13@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Oscar Guillermo', 'Perez Robalino', '1750000193', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(194, 'est_dise_14@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Cecilia Marisol', 'Salgado Teran', '1750000194', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(195, 'est_dise_15@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Ruben Dario', 'Utreras Valle', '1750000195', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(196, 'est_dise_16@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Irene Veronica', 'Viteri Wong', '1750000196', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(197, 'est_dise_17@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Gonzalo Ramiro', 'Yepez Zavala', '1750000197', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(198, 'est_dise_18@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Nancy Viviana', 'Alvarez Benalcazar', '1750000198', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(199, 'est_dise_19@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Boris Marcelo', 'Carrion Donoso', '1750000199', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0),
(200, 'est_dise_20@uce.edu.ec', '$2a$10$r.vin/MV3yYY8frRS56SrO14CkzEtcakSGHPNAjJp.6FsSAsrNcle', 'Tatiana Gisella', 'Enriquez Franco', '1750000200', 'CEDULA', 'ESTUDIANTE', 5, 'ACTIVO', FALSE, 0);
