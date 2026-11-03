-- =============================================================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA DE GESTION DE PRACTICAS Y VINCULACION (UCE)
-- =============================================================================

-- ==========================================
-- 0. ESQUEMAS Y LIMPIEZA DE TABLAS EXISTENTES
-- ==========================================
CREATE SCHEMA IF NOT EXISTS auditoria;

-- Tablas de Auditoria (Hibernate Envers)
DROP TABLE IF EXISTS auditoria.evidencias_asignaciones_vcs_aud CASCADE;
DROP TABLE IF EXISTS auditoria.reportes_proyectos_vcs_aud CASCADE;
DROP TABLE IF EXISTS auditoria.asignaciones_proyectos_comunitarios_aud CASCADE;
DROP TABLE IF EXISTS auditoria.proyectos_comunitarios_aud CASCADE;
DROP TABLE IF EXISTS auditoria.procesos_vinculacion_aud CASCADE;
DROP TABLE IF EXISTS auditoria.matrices_caces_aud CASCADE;
DROP TABLE IF EXISTS auditoria.documentos_portafolio_aud CASCADE;
DROP TABLE IF EXISTS auditoria.asignaciones_practicas_aud CASCADE;
DROP TABLE IF EXISTS auditoria.procesos_practicas_aud CASCADE;
DROP TABLE IF EXISTS auditoria.convenios_aud CASCADE;
DROP TABLE IF EXISTS auditoria.usuarios_aud CASCADE;
DROP TABLE IF EXISTS auditoria.revinfo CASCADE;

-- Tablas Operativas
DROP TABLE IF EXISTS evidencias_asignaciones_vcs CASCADE;
DROP TABLE IF EXISTS reportes_proyectos_vcs CASCADE;
DROP TABLE IF EXISTS asignaciones_proyectos_comunitarios CASCADE;
DROP TABLE IF EXISTS proyectos_comunitarios CASCADE;
DROP TABLE IF EXISTS procesos_vinculacion CASCADE;

DROP TABLE IF EXISTS plantillas_documentos CASCADE;
DROP TABLE IF EXISTS plantillas_correo CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS matrices_caces CASCADE;
DROP TABLE IF EXISTS documentos_portafolio CASCADE;
DROP TABLE IF EXISTS asignaciones_practicas CASCADE;
DROP TABLE IF EXISTS procesos_practicas CASCADE;
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS tokens_resetear_contrasenia CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS convenios CASCADE;
DROP TABLE IF EXISTS carreras CASCADE;
DROP TABLE IF EXISTS periodos_academicos CASCADE;

-- ==========================================
-- 1. TABLAS BASE
-- ==========================================

-- Periodos Academicos
-- Enums validos en estado: ACTIVO, INACTIVO
CREATE TABLE periodos_academicos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_periodos_academicos_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

-- Carreras de la Facultad
CREATE TABLE carreras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo_carrera VARCHAR(255) UNIQUE,
    ciudad_carrera VARCHAR(255),
    horas_practicas INT DEFAULT 0,
    horas_proyectos_comunitarios INT DEFAULT 0,
    director_id BIGINT UNIQUE,
    coordinador_id BIGINT UNIQUE,
    borrado BOOLEAN NOT NULL DEFAULT FALSE
);

-- Convenios Interinstitucionales
-- Enums validos en tipo: PUBLICO, PRIVADO
-- Enums validos en estado: ACTIVO, POR_EXPIRAR, EXPIRADO, ANULADO
CREATE TABLE convenios (
    id BIGSERIAL PRIMARY KEY,
    institucion VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    campo_especifico NUMERIC,
    direccion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'ACTIVO',
    tutor_institucional VARCHAR(100),
    correo_tutor VARCHAR(100),
    telefono_tutor VARCHAR(20),
    cupos_totales INT DEFAULT 0,
    url_documento TEXT,
    nombre_documento VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_convenios_tipo CHECK (tipo IN ('PUBLICO', 'PRIVADO')),
    CONSTRAINT chk_convenios_estado CHECK (estado IN ('ACTIVO', 'POR_EXPIRAR', 'EXPIRADO', 'ANULADO'))
);

-- Usuarios del Sistema
-- Enums validos en rol: ESTUDIANTE, TUTOR_ACADEMICO, DIRECTOR_CARRERA, COORDINADOR_PRACTICAS, SUBDECANO
-- Enums validos en estado: ACTIVO, INACTIVO
-- Enums validos en tipo_identificacion: CEDULA, PASAPORTE
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    carrera_id INT REFERENCES carreras(id) ON DELETE SET NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    clave_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    identificacion VARCHAR(20) UNIQUE,
    tipo_identificacion VARCHAR(50) DEFAULT 'CEDULA',
    rol VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    url_avatar TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    version_token BIGINT DEFAULT 0,
    CONSTRAINT chk_usuarios_tipo_identificacion CHECK (tipo_identificacion IN ('CEDULA', 'PASAPORTE')),
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('ESTUDIANTE', 'TUTOR_ACADEMICO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'SUBDECANO')),
    CONSTRAINT chk_usuarios_estado CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

-- Claves foraneas circulares para autoridades de carreras
ALTER TABLE carreras 
    ADD CONSTRAINT fk_carreras_director FOREIGN KEY (director_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_carreras_coordinador FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Tokens para recuperacion de clave de usuarios
CREATE TABLE tokens_resetear_contrasenia (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. PRACTICAS PREPROFESIONALES (PP)
-- ==========================================

-- Observaciones o propuestas de convenios
-- Enums validos en tipo: NUEVA, ANULACION
-- Enums validos en estado: PENDIENTE, APROBADA, RECHAZADA
CREATE TABLE observaciones (
    id BIGSERIAL PRIMARY KEY,
    remitente_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
    convenio_id BIGINT REFERENCES convenios(id) ON DELETE CASCADE,
    empresa VARCHAR(255),
    tipo VARCHAR(50) NOT NULL,
    contacto VARCHAR(255),
    correo VARCHAR(255),
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_observaciones_tipo CHECK (tipo IN ('NUEVA', 'ANULACION')),
    CONSTRAINT chk_observaciones_estado CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA'))
);

-- Procesos de Practicas Preprofesionales por estudiante y carrera
-- Enums validos en estado: EN_CURSO, COMPLETADO, CANCELADO
CREATE TABLE procesos_practicas (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera_id INT NOT NULL REFERENCES carreras(id),
    horas_requeridas INT NOT NULL,
    horas_acumuladas INT DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'EN_CURSO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proceso_practica_estudiante_carrera UNIQUE (estudiante_id, carrera_id),
    CONSTRAINT chk_procesos_practicas_estado CHECK (estado IN ('EN_CURSO', 'COMPLETADO', 'CANCELADO'))
);

-- Asignaciones de Practicas Preprofesionales
-- Enums validos en fase: POSTULACION, ASIGNACION, DESARROLLO, FINALIZACION
-- Enums validos en estado: EN_CURSO, APROBADO, REPROBADO, CANCELADO
CREATE TABLE asignaciones_practicas (
    id BIGSERIAL PRIMARY KEY,
    proceso_id BIGINT NOT NULL REFERENCES procesos_practicas(id) ON DELETE CASCADE,
    convenio_id BIGINT NOT NULL REFERENCES convenios(id) ON DELETE RESTRICT,
    tutor_academico_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
    tutor_institucional VARCHAR(255),
    periodo_id BIGINT REFERENCES periodos_academicos(id) ON DELETE SET NULL,
    semestre INT,
    horas_asignadas INT DEFAULT 0,
    horas_completadas INT DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin DATE,
    fase VARCHAR(50) NOT NULL DEFAULT 'POSTULACION',
    estado VARCHAR(50) NOT NULL DEFAULT 'EN_CURSO',
    validado_cpp BOOLEAN NOT NULL DEFAULT FALSE,
    carta_asignacion_enviada BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones_caces TEXT,
    reunion_realizada BOOLEAN NOT NULL DEFAULT FALSE,
    validado_siiu BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_asignaciones_practicas_fase CHECK (fase IN ('POSTULACION', 'ASIGNACION', 'DESARROLLO', 'FINALIZACION')),
    CONSTRAINT chk_asignaciones_practicas_estado CHECK (estado IN ('EN_CURSO', 'APROBADO', 'REPROBADO', 'CANCELADO'))
);

-- Documentos del Portafolio de Practicas
-- Enums validos en tipo: CV, DOCUMENTO_IDENTIDAD, CARTA_ASIGNACION, SEGUIMIENTO_TA, INFORME_FINAL, CERTIFICADO_CUMPLIMIENTO, AVAL, MATRIZ_CACES, EVIDENCIA
-- Enums validos en estado: PENDIENTE_REVISION, APROBADO, RECHAZADO
CREATE TABLE documentos_portafolio (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    proceso_id BIGINT REFERENCES procesos_practicas(id) ON DELETE CASCADE,
    asignacion_id BIGINT REFERENCES asignaciones_practicas(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo TEXT NOT NULL,
    firmado BOOLEAN DEFAULT FALSE,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_REVISION',
    observacion TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_documentos_portafolio_tipo CHECK (tipo IN ('CV', 'DOCUMENTO_IDENTIDAD', 'CARTA_ASIGNACION', 'SEGUIMIENTO_TA', 'INFORME_FINAL', 'CERTIFICADO_CUMPLIMIENTO', 'AVAL', 'MATRIZ_CACES', 'EVIDENCIA')),
    CONSTRAINT chk_documentos_portafolio_estado CHECK (estado IN ('PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO'))
);

-- Notificaciones del Sistema
-- Enums validos en tipo: INFORMACION, ADVERTENCIA, EXITO, ERROR
CREATE TABLE notificaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'INFORMACION',
    accion_url VARCHAR(255),
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notificaciones_tipo CHECK (tipo IN ('INFORMACION', 'ADVERTENCIA', 'EXITO', 'ERROR'))
);

-- Matrices CACES por Carrera y Periodo
-- Enums validos en estado: PENDIENTE, ENVIADA_A_DC, FIRMADA_POR_DC, ENVIADA_A_SUBDECANO, FIRMADA_POR_SUBDECANO
CREATE TABLE matrices_caces (
    id BIGSERIAL PRIMARY KEY,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archivo_firmado_url VARCHAR(255),
    observacion TEXT,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_matriz_periodo_carrera UNIQUE (periodo_id, carrera_id),
    CONSTRAINT chk_matrices_caces_estado CHECK (estado IN ('PENDIENTE', 'ENVIADA_A_DC', 'FIRMADA_POR_DC', 'ENVIADA_A_SUBDECANO', 'FIRMADA_POR_SUBDECANO'))
);

-- ==========================================
-- 3. VINCULACION CON LA SOCIEDAD (VCS)
-- ==========================================

-- Procesos de Vinculacion por Estudiante y Carrera
-- Enums validos en estado: EN_CURSO, COMPLETADO, CANCELADO
CREATE TABLE procesos_vinculacion (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
    horas_requeridas INT NOT NULL,
    horas_acumuladas INT DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'EN_CURSO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_procesos_vinculacion_estado CHECK (estado IN ('EN_CURSO', 'COMPLETADO', 'CANCELADO'))
);

-- Proyectos Comunitarios de Vinculacion
-- Enums validos en estado: ACTIVO, FINALIZADO, CANCELADO, INACTIVO
CREATE TABLE proyectos_comunitarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
    tutor_academico_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
    fecha_inicio DATE,
    fecha_fin DATE,
    url_documento TEXT,
    nombre_documento VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_proyectos_comunitarios_estado CHECK (estado IN ('ACTIVO', 'FINALIZADO', 'CANCELADO', 'INACTIVO'))
);

-- Asignaciones a Proyectos Comunitarios
-- Enums validos en estado: EN_CURSO, APROBADO, REPROBADO, CANCELADO
-- Enums validos en fase_actual: ASIGNACION, DESARROLLO, FINALIZACION
CREATE TABLE asignaciones_proyectos_comunitarios (
    id BIGSERIAL PRIMARY KEY,
    proceso_vinculacion_id BIGINT NOT NULL REFERENCES procesos_vinculacion(id) ON DELETE CASCADE,
    proyecto_comunitario_id BIGINT NOT NULL REFERENCES proyectos_comunitarios(id) ON DELETE CASCADE,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    horas_asignadas INT NOT NULL,
    horas_completadas INT NOT NULL DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) NOT NULL DEFAULT 'EN_CURSO',
    fase_actual VARCHAR(50) NOT NULL DEFAULT 'ASIGNACION',
    documentos_validados BOOLEAN NOT NULL DEFAULT FALSE,
    url_certificado VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_asig_vcs_fase_actual CHECK (fase_actual IN ('ASIGNACION', 'DESARROLLO', 'FINALIZACION')),
    CONSTRAINT chk_asig_vcs_estado CHECK (estado IN ('EN_CURSO', 'APROBADO', 'REPROBADO', 'CANCELADO'))
);

-- Reportes de Proyectos de Vinculacion (Subidos por Coordinador de Carrera)
-- Enums validos en tipo: TRIMESTRAL_AVANCES, INFORME_DEFINITIVO
-- Enums validos en estado_subdecanato: PENDIENTE, APROBADO, OBSERVADO
CREATE TABLE reportes_proyectos_vcs (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyectos_comunitarios(id) ON DELETE CASCADE,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    coordinador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo TEXT NOT NULL,
    estado_subdecanato VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_reportes_proyectos_vcs_tipo CHECK (tipo IN ('TRIMESTRAL_AVANCES', 'INFORME_DEFINITIVO')),
    CONSTRAINT chk_reportes_proyectos_vcs_estado_subdecanato CHECK (estado_subdecanato IN ('PENDIENTE', 'APROBADO', 'OBSERVADO'))
);

-- Evidencias de Asignaciones de Vinculacion (Subidas por Estudiante)
-- Enums validos en tipo_documento: BITACORA, INFORME_FINAL
-- Enums validos en estado_tutor: PENDIENTE, APROBADO, OBSERVADO
CREATE TABLE evidencias_asignaciones_vcs (
    id BIGSERIAL PRIMARY KEY,
    asignacion_id BIGINT NOT NULL REFERENCES asignaciones_proyectos_comunitarios(id) ON DELETE CASCADE,
    estudiante_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(30),
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    horas_reportadas INT,
    estado_tutor VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    observaciones_tutor TEXT,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision_tutor TIMESTAMP,
    borrado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_evidencias_vcs_tipo_documento CHECK (tipo_documento IN ('BITACORA', 'INFORME_FINAL')),
    CONSTRAINT chk_evidencias_vcs_estado_tutor CHECK (estado_tutor IN ('PENDIENTE', 'APROBADO', 'OBSERVADO'))
);

-- ==========================================
-- 4. INDICES DE OPTIMIZACION
-- ==========================================
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_carrera ON usuarios(carrera_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_asignaciones_proceso ON asignaciones_practicas(proceso_id);
CREATE INDEX idx_asignaciones_convenio ON asignaciones_practicas(convenio_id);
CREATE INDEX idx_asignaciones_tutor ON asignaciones_practicas(tutor_academico_id);
CREATE INDEX idx_documentos_estudiante ON documentos_portafolio(estudiante_id);
CREATE INDEX idx_documentos_asignacion ON documentos_portafolio(asignacion_id);
CREATE INDEX idx_asig_vcs_proceso ON asignaciones_proyectos_comunitarios(proceso_vinculacion_id);
CREATE INDEX idx_asig_vcs_proyecto ON asignaciones_proyectos_comunitarios(proyecto_comunitario_id);
CREATE INDEX idx_evidencias_asignacion ON evidencias_asignaciones_vcs(asignacion_id);
CREATE INDEX idx_reportes_proyecto ON reportes_proyectos_vcs(proyecto_id);

-- ==========================================
-- 5. TRAZABILIDAD Y AUDITORIA (HIBERNATE ENVERS)
-- ==========================================

CREATE TABLE auditoria.revinfo (
    rev BIGSERIAL PRIMARY KEY,
    revtstmp BIGINT NOT NULL,
    usuario_correo VARCHAR(255),
    usuario_rol VARCHAR(255)
);

CREATE TABLE auditoria.usuarios_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    carrera_id INT,
    correo VARCHAR(255),
    nombres VARCHAR(255),
    apellidos VARCHAR(255),
    identificacion VARCHAR(20),
    tipo_identificacion VARCHAR(50),
    rol VARCHAR(50),
    telefono VARCHAR(20),
    url_avatar TEXT,
    fecha_creacion TIMESTAMP,
    estado VARCHAR(50),
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.convenios_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    institucion VARCHAR(255),
    tipo VARCHAR(50),
    campo_especifico NUMERIC,
    direccion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50),
    tutor_institucional VARCHAR(100),
    correo_tutor VARCHAR(100),
    telefono_tutor VARCHAR(20),
    cupos_totales INT,
    url_documento TEXT,
    nombre_documento VARCHAR(255),
    fecha_creacion TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.procesos_practicas_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    estudiante_id BIGINT,
    carrera_id INT,
    horas_requeridas INT,
    horas_acumuladas INT,
    estado VARCHAR(50),
    fecha_creacion TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.asignaciones_practicas_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    proceso_id BIGINT,
    convenio_id BIGINT,
    tutor_academico_id BIGINT,
    tutor_institucional VARCHAR(255),
    periodo_id BIGINT,
    semestre INT,
    horas_asignadas INT,
    horas_completadas INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    fase VARCHAR(50),
    estado VARCHAR(50),
    validado_cpp BOOLEAN,
    carta_asignacion_enviada BOOLEAN,
    observaciones_caces TEXT,
    reunion_realizada BOOLEAN,
    validado_siiu BOOLEAN,
    fecha_creacion TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.documentos_portafolio_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    estudiante_id BIGINT,
    proceso_id BIGINT,
    asignacion_id BIGINT,
    tipo VARCHAR(50),
    nombre_archivo VARCHAR(255),
    url_archivo TEXT,
    firmado BOOLEAN,
    estado VARCHAR(50),
    observacion TEXT,
    fecha_subida TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.matrices_caces_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    periodo_id BIGINT,
    carrera_id INT,
    estado VARCHAR(50),
    fecha_generacion TIMESTAMP,
    archivo_firmado_url VARCHAR(255),
    observacion TEXT,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.procesos_vinculacion_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    estudiante_id BIGINT,
    carrera_id INT,
    horas_requeridas INT,
    horas_acumuladas INT,
    estado VARCHAR(50),
    fecha_creacion TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.proyectos_comunitarios_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    nombre VARCHAR(255),
    descripcion TEXT,
    carrera_id INT,
    tutor_academico_id BIGINT,
    estado VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    url_documento TEXT,
    nombre_documento VARCHAR(255),
    fecha_creacion TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.asignaciones_proyectos_comunitarios_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    proceso_vinculacion_id BIGINT,
    proyecto_comunitario_id BIGINT,
    periodo_id BIGINT,
    horas_asignadas INT,
    horas_completadas INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50),
    fase_actual VARCHAR(50),
    documentos_validados BOOLEAN,
    url_certificado VARCHAR(255),
    fecha_creacion TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.evidencias_asignaciones_vcs_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    asignacion_id BIGINT,
    estudiante_id BIGINT,
    tipo_documento VARCHAR(30),
    nombre_archivo VARCHAR(255),
    url_archivo VARCHAR(255),
    horas_reportadas INT,
    estado_tutor VARCHAR(50),
    observaciones_tutor TEXT,
    fecha_subida TIMESTAMP,
    fecha_revision_tutor TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE TABLE auditoria.reportes_proyectos_vcs_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL REFERENCES auditoria.revinfo(rev),
    revtype SMALLINT NOT NULL,
    proyecto_id BIGINT,
    periodo_id BIGINT,
    coordinador_id BIGINT,
    tipo VARCHAR(50),
    nombre_archivo VARCHAR(255),
    url_archivo TEXT,
    estado_subdecanato VARCHAR(50),
    observaciones TEXT,
    fecha_subida TIMESTAMP,
    fecha_revision TIMESTAMP,
    borrado BOOLEAN,
    PRIMARY KEY (id, rev)
);

CREATE INDEX idx_revinfo_revtstmp ON auditoria.revinfo(revtstmp);
CREATE INDEX idx_usuarios_aud_rev ON auditoria.usuarios_aud(rev);
CREATE INDEX idx_asig_practicas_aud_rev ON auditoria.asignaciones_practicas_aud(rev);
CREATE INDEX idx_docs_portafolio_aud_rev ON auditoria.documentos_portafolio_aud(rev);
CREATE INDEX idx_asig_vcs_aud_rev ON auditoria.asignaciones_proyectos_comunitarios_aud(rev);
CREATE INDEX idx_evidencias_vcs_aud_rev ON auditoria.evidencias_asignaciones_vcs_aud(rev);
