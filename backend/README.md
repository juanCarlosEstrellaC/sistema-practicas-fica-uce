# API PP & VCS - Universidad Central del Ecuador (UCE)

Backend para el Sistema de Gestion de Practicas Preprofesionales (PP) y Vinculacion con la Sociedad (VCS) de la Facultad de Ingenieria y Ciencias Aplicadas de la Universidad Central del Ecuador.

---

## Tecnologias Principales

* **Lenguaje:** Java 25
* **Framework:** Spring Boot 4.0.5
* **Persistencia:** Spring Data JPA / Hibernate
* **Seguridad:** Spring Security + JSON Web Tokens (JJWT)
* **Base de Datos Principal:** PostgreSQL
* **Base de Datos de Pruebas:** H2 Database (en memoria)
* **Generacion de Documentos:** OpenHTMLtoPDF (certificados, cartas y avales en PDF)
* **Mapeo de Entidades / DTOs:** MapStruct 1.6.3
* **Librerias Utilitarias:** Lombok, Apache POI (manejo de reportes Excel)
* **Automatizacion de Compilacion:** Gradle con Kotlin DSL (`build.gradle.kts`)

---

## Estructura del Proyecto

El codigo fuente sigue una arquitectura en capas limpia y desacoplada:

```text
src/
├── main/
│   ├── java/com/uce/api_pp_uce/
│   │   ├── config/            # Configuraciones globales (CORS, MVC, Storage, Jackson)
│   │   ├── controllers/       # Endpoints REST (Auth, Usuarios, Carreras, Periodos)
│   │   │   ├── pp/            # Controladores de Practicas Preprofesionales
│   │   │   └── vcs/           # Controladores de Vinculacion con la Sociedad
│   │   ├── dtos/              # Data Transfer Objects para requests y responses
│   │   ├── entities/          # Entidades JPA persistentes
│   │   │   ├── pp/            # Entidades del modulo de Practicas
│   │   │   └── vcs/           # Entidades del modulo de Vinculacion
│   │   ├── enums/             # Tipos enumerados de dominio
│   │   ├── excepciones/       # Manejador global de excepciones (@ControllerAdvice)
│   │   ├── exportadores/      # Generadores de PDF con plantillas HTML
│   │   ├── mapeadores/        # Mappers con MapStruct
│   │   ├── repositories/      # Repositorios JPA de acceso a datos
│   │   ├── security/          # Filtros JWT, UserDetailsService y configuracion de seguridad
│   │   └── services/          # Logica de negocio y servicios
│   └── resources/
│       ├── application.properties # Parametrizacion del entorno
│       ├── templates/             # Plantillas HTML/Thymeleaf para PDFs
│       └── db/                    # Unica fuente de verdad de base de datos
│           ├── schema.sql         # Esquema DDL relacional sincronizado con JPA
│           ├── dummy_inicial.sql  # Semilla 1: Arranque desde cero (Admin Subdecano + Carreras)
│           ├── dummy_completo.sql # Semilla 2: Dataset completo para pruebas locales
│           └── seeds/csv/         # Archivos CSV para prueba de importacion masiva
└── test/                      # Suite de pruebas unitarias y de integracion
```

---

## Requisitos Previos

1. **Java Development Kit (JDK):** Version 25 o superior instalada y configurada en la variable de entorno `JAVA_HOME`.
2. **PostgreSQL:** Version 15 o superior ejecutandose en el puerto 5432.
3. **Gradle:** No se requiere instalacion previa, el proyecto cuenta con el wrapper oficial (`gradlew` / `gradlew.bat`).

---

## Configuracion de la Base de Datos

Por defecto, la aplicacion busca una base de datos PostgreSQL llamada `api_pp_db`. Puedes sobreescribir la conexion mediante variables de entorno o editando `src/main/resources/application.properties`:

| Propiedad / Variable de Entorno | Valor por Defecto | Descripcion |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/api_pp_db` | URL de conexion JDBC |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuario de base de datos |
| `SPRING_DATASOURCE_PASSWORD` | `labcom,2015` | Clave de base de datos |
| `JWT_SECRET` | *(Clave predeterminada)* | Llave secreta para firma de tokens JWT |
| `JWT_EXPIRATION` | `28800000` (8 horas) | Tiempo de validez del token en milisegundos |
| `app.almacenamiento.ruta-base` | `archivos_subidos` | Directorio local de almacenamiento de archivos |

---

## Semillas de Datos (Dummies)

En `src/main/resources/application.properties` se pueden seleccionar los datos a cargar modificando la propiedad `spring.sql.init.data-locations`:

* **Modo Minimo (`dummy_inicial.sql`):**
  Carga los usuarios base por cada rol (`SUBDECANO`, `DIRECTOR_CARRERA`, `COORDINADOR_PRACTICAS`, `TUTOR_ACADEMICO`, `ESTUDIANTE`), un periodo academico activo y las 5 carreras base de la facultad:
  * **Subdecano:** `aperez@uce.edu.ec`
  * **Director de Carrera:** `zruiz@uce.edu.ec`
  * **Coordinador de Practicas:** `gmoncayo@uce.edu.ec`
  * **Tutor Academico:** `jsalvador@uce.edu.ec`
  * **Estudiante:** `jcestrella@uce.edu.ec`
  * **Contrasenia general:** `123456`

* **Modo Completo (`dummy_completo.sql`):**
  Carga 41 usuarios (Estudiantes, Tutores, Directores de Carrera, Coordinadores de Practicas y Subdecano), convenios activos, proyectos comunitarios y procesos de prueba.

---

## Comandos de Ejecucion

### Iniciar la aplicacion
En Windows (PowerShell):
```powershell
.\gradlew.bat bootRun
```

En Linux / macOS:
```bash
./gradlew bootRun
```

La API quedara accesible en: `http://localhost:8080/api/v1`

### Ejecutar las pruebas
```powershell
.\gradlew.bat test
```

### Construir el artefacto ejecutable (.jar)
```powershell
.\gradlew.bat build
```
El archivo JAR generado se ubicara en `build/libs/`.

---

## Modulos Funcionales

1. **Autenticacion y Usuarios:** Login por JWT, control de intentos fallidos, versionamiento de tokens, cambio de clave y recuperacion por correo.
2. **Practicas Preprofesionales (PP):** Gestion de convenios interinstitucionales, asignacion a plazas de practicas, seguimiento de tutores y aprobacion de portafolios.
3. **Vinculacion con la Sociedad (VCS):** Creacion de proyectos comunitarios, asignacion masiva de estudiantes, revision de bitacoras y emision de certificados de cumplimiento.
4. **Matriz CACES:** Generacion, revision y firma digital de reportes de acreditacion por carrera y periodo academico.
