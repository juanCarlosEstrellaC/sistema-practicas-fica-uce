# API PP & VCS - Universidad Central del Ecuador (UCE)

Backend para el Sistema de Gestión de Prácticas Preprofesionales (PP) y Vinculación con la Sociedad (VCS) de la Facultad de Ingeniería y Ciencias Aplicadas de la Universidad Central del Ecuador.

---

## Tecnologías Principales

* **Lenguaje:** Java 25
* **Framework:** Spring Boot 4.0.5
* **Persistencia:** Spring Data JPA / Hibernate
* **Seguridad:** Spring Security + JSON Web Tokens (JJWT)
* **Base de Datos Principal:** PostgreSQL 15+
* **Base de Datos de Pruebas:** H2 Database (en memoria)
* **Generación de Documentos:** OpenHTMLtoPDF (certificados, cartas y avales en PDF)
* **Mapeo de Entidades / DTOs:** MapStruct 1.6.3
* **Librerías Utilitarias:** Lombok, Apache POI (manejo de reportes Excel)
* **Automatización de Compilación:** Gradle con Kotlin DSL (`build.gradle.kts`)

---

## Estructura del Proyecto

El código fuente sigue una arquitectura en capas limpia y desacoplada:

```text
src/
├── main/
│   ├── java/com/uce/api_pp_uce/
│   │   ├── config/            # Configuraciones globales (CORS, MVC, Storage, Jackson)
│   │   ├── controllers/       # Endpoints REST (Auth, Usuarios, Carreras, Periodos)
│   │   │   ├── pp/            # Controladores de Prácticas Preprofesionales
│   │   │   └── vcs/           # Controladores de Vinculación con la Sociedad
│   │   ├── dtos/              # Data Transfer Objects para peticiones y respuestas
│   │   ├── entities/          # Entidades JPA persistentes
│   │   │   ├── pp/            # Entidades del módulo de Prácticas
│   │   │   └── vcs/           # Entidades del módulo de Vinculación
│   │   ├── enums/             # Tipos enumerados de dominio
│   │   ├── excepciones/       # Manejador global de excepciones (@ControllerAdvice)
│   │   ├── exportadores/      # Generadores de PDF con plantillas HTML
│   │   ├── mapeadores/        # Mappers construidos con MapStruct
│   │   ├── repositories/      # Repositorios JPA de acceso a datos
│   │   ├── security/          # Filtros JWT, UserDetailsService y seguridad
│   │   └── services/          # Lógica de negocio y servicios transaccionales
│   └── resources/
│       ├── application.properties # Parametrización del entorno
│       ├── templates/             # Plantillas HTML/Thymeleaf para PDFs
│       └── db/                    # Fuente de verdad de base de datos
│           ├── schema.sql         # Esquema DDL relacional sincronizado con JPA
│           ├── dummy_inicial.sql  # Semilla 1: Arranque desde cero (Admin Subdecano + Carreras)
│           ├── dummy_completo.sql # Semilla 2: Dataset completo para pruebas locales
│           └── seeds/csv/         # Archivos CSV para prueba de importación masiva
└── test/                      # Suite de pruebas unitarias y de integración
```

---

## Requisitos Previos

Antes de compilar y ejecutar este backend, asegúrese de contar con:

1. **Java Development Kit (JDK):** Versión 25 o superior instalada y configurada en la variable de entorno `JAVA_HOME`.
2. **PostgreSQL:** Versión 15 o superior ejecutándose en el puerto estándar `5432`.
3. **Gradle Wrapper:** No se requiere instalación manual de Gradle; el proyecto incluye los ejecutables oficiales (`gradlew` y `gradlew.bat`).

---

## Configuración de la Base de Datos

Usted puede sobrescribir los parámetros de conexión mediante variables de entorno del sistema o editando el archivo `src/main/resources/application.properties`:

| Propiedad / Variable de Entorno | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/db_practicas_fica_uce` | URL de conexión JDBC |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuario administrador de la base de datos |
| `SPRING_DATASOURCE_PASSWORD` | `postgres123` | Contraseña de acceso a PostgreSQL |
| `JWT_SECRET` | *(Clave predeterminada de 256 bits)* | Llave secreta para la firma y verificación de tokens JWT |
| `JWT_EXPIRATION` | `28800000` (8 horas) | Tiempo de vigencia del token de autenticación en milisegundos |
| `app.almacenamiento.ruta-base` | `archivos_subidos` | Directorio para almacenamiento físico de archivos y evidencias |

---

## Semillas de Datos (Dummies)

En `src/main/resources/application.properties`, usted puede seleccionar el conjunto de datos de prueba a cargar modificando la propiedad `spring.sql.init.data-locations`:

* **Modo Mínimo (`dummy_inicial.sql`):**
  Carga los usuarios base de cada rol institucional (`SUBDECANO`, `DIRECTOR_CARRERA`, `COORDINADOR_PRACTICAS`, `TUTOR_ACADEMICO`, `ESTUDIANTE`), un periodo académico activo y las 5 carreras de la facultad:
  * **Subdecano:** `aperez@uce.edu.ec`
  * **Director de Carrera:** `zruiz@uce.edu.ec`
  * **Coordinador de Prácticas:** `gmoncayo@uce.edu.ec`
  * **Tutor Académico:** `jsalvador@uce.edu.ec`
  * **Estudiante:** `jcestrella@uce.edu.ec`
  * **Contraseña general de prueba:** `123456`

* **Modo Completo (`dummy_completo.sql`):**
  Carga 41 usuarios (estudiantes, docentes tutores, directores de carrera, coordinadores y autoridades), convenios activos, proyectos comunitarios y procesos de asignación completos.

---

## Comandos de Ejecución

### Iniciar la aplicación en modo desarrollo
En entornos Windows (PowerShell):
```powershell
.\gradlew.bat bootRun
```

En entornos Linux / macOS:
```bash
./gradlew bootRun
```

La API REST quedará accesible en: `http://localhost:8080/api/v1`

### Ejecutar la suite de pruebas
Para ejecutar las pruebas unitarias y de integración del backend:
```powershell
.\gradlew.bat test
```

### Construir el artefacto ejecutable (.jar)
Para generar el archivo ejecutable de producción:
```powershell
.\gradlew.bat build -x test
```
El archivo JAR generado se ubicará en el directorio `build/libs/`.

---

## Módulos Funcionales

1. **Autenticación y Seguridad:** Inicio de sesión por JWT, control de intentos fallidos, revocación de tokens, actualización de credenciales bajo estándares NIST SP 800-63B y recuperación mediante correo electrónico.
2. **Prácticas Preprofesionales (PP):** Gestión integral de convenios institucionales, asignación de plazas a estudiantes, supervisión por parte de tutores académicos y validación de portafolios estudiantiles.
3. **Vinculación con la Sociedad (VCS):** Planificación de proyectos comunitarios, asignación masiva de estudiantes por carrera, seguimiento de evidencias y emisión de certificados de cumplimiento.
4. **Acreditación CACES:** Generación, revisión y firma digital de la matriz de acreditación CACES por carrera y periodo académico.
