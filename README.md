# Sistema de Prácticas Preprofesionales y Vinculación con la Sociedad (FICA - UCE)

Repositorio centralizado del proyecto de titulación: **"Automatización del proceso de gestión y seguimiento de prácticas preprofesionales y vinculación con la sociedad en la Facultad de Ingeniería y Ciencias Aplicadas de la Universidad Central del Ecuador"**.

Este repositorio está organizado como un **monorepo** que contiene de manera desacoplada tanto el backend como el frontend de la solución.

---

## Estructura del Repositorio

```text
sistema-practicas-fica-uce/
├── backend/                  # API REST construida con Spring Boot 4 y Java 25
│   ├── src/                  # Código fuente (controladores, servicios, entidades, repositorios)
│   ├── gradle/               # Gradle Wrapper ejecutable
│   ├── build.gradle.kts      # Configuración de dependencias y tareas Gradle (Kotlin DSL)
│   ├── Dockerfile            # Construcción multi-etapa del contenedor backend
│   └── README.md             # Documentación específica del backend
├── frontend/                 # Interfaz de usuario construida con Next.js 16 y React 19
│   ├── src/                  # Componentes UI, Server Actions, esquemas Zod y páginas
│   ├── e2e/                  # Pruebas End-to-End con Playwright
│   ├── package.json          # Dependencias y scripts de ejecución
│   ├── Dockerfile            # Construcción multi-etapa standalone de Next.js
│   ├── tsconfig.json         # Configuración de TypeScript
│   └── README.md             # Documentación específica del frontend
├── docker-compose.yml        # Orquestación de PostgreSQL, Backend y Frontend
├── .env.example              # Plantilla de variables de entorno para Docker Compose
├── .gitignore                # Reglas de exclusión para Git en todo el monorepo
└── README.md                 # Guía general de instalación y ejecución del proyecto
```

---

## Tecnologías Utilizadas

### Backend (`/backend`)
* **Lenguaje:** Java 25
* **Framework:** Spring Boot 4.0.5
* **Seguridad:** Spring Security con autenticación basada en JWT (JSON Web Tokens)
* **Persistencia:** Spring Data JPA / Hibernate con auditoría Hibernate Envers
* **Base de Datos:** PostgreSQL 16 (H2 para pruebas unitarias e integración)
* **Generación Documental:** OpenHTMLtoPDF (emisión de certificados, cartas de asignación y avales en PDF)
* **Gestor de Compilación:** Gradle Wrapper (`gradlew`)

### Frontend (`/frontend`)
* **Framework:** Next.js 16 (App Router con Server Actions y React Server Components)
* **Biblioteca UI:** React 19, Tailwind CSS 4, shadcn/ui (Radix UI)
* **Lenguaje:** TypeScript
* **Validación de Datos:** Zod
* **Pruebas Automatizadas:** Vitest (unitarias/integración) y Playwright (End-to-End)

---

## Requisitos Previos

Antes de ejecutar el proyecto en el entorno local, asegúrese de contar con las siguientes herramientas instaladas:

1. **Java Development Kit (JDK):** Versión 25 o compatible.
2. **Node.js:** Versión 20.x o superior con el gestor de paquetes `npm`.
3. **PostgreSQL:** Versión 15 o superior ejecutándose en el puerto por defecto (`5432`).
4. **Git:** Para control de versiones.
5. **Docker Desktop (Opcional, pero recomendado):** Para despliegue automatizado en contenedores.

---

## Despliegue Rápido con Docker (Recomendado)

Si usted cuenta con [Docker Desktop](https://www.docker.com/) instalado y en ejecución, puede levantar la totalidad del sistema (PostgreSQL, Spring Boot y Next.js) ejecutando el siguiente comando en la raíz del proyecto:

```bash
docker compose up --build
```

Al finalizar el proceso de inicialización, los servicios estarán disponibles en las siguientes direcciones:
* **Frontend Web:** `http://localhost:3000`
* **Backend API REST:** `http://localhost:8080/api/v1`
* **Bandeja de Correos (Mailpit):** `http://localhost:8025` (buzón web para pruebas de emails, activación de cuentas y recuperación)
* **Base de Datos PostgreSQL:** Puerto `5432` (Base de datos: `db_practicas_fica_uce`)
* **Persistencia de Archivos:** Las evidencias y documentos cargados se sincronizan de forma persistente con la carpeta local `./backend/archivos_subidos`.

Para detener la ejecución de los contenedores, presione `Ctrl + C` o ejecute:
```bash
docker compose down
```

---

## Guía de Puesta en Marcha Local (Sin Docker)

Si usted prefiere ejecutar los servicios de manera nativa en su sistema operativo, siga las instrucciones detalladas a continuación:

### 1. Configuración de la Base de Datos
Cree una base de datos en su servidor local de PostgreSQL:
```sql
CREATE DATABASE db_practicas_fica_uce;
```
Asegúrese de que las credenciales de conexión coincidan con su configuración local en `backend/src/main/resources/application.properties`.

---

### 2. Ejecución del Backend

1. Abra una terminal y sitúese en el directorio `backend`:
   ```bash
   cd backend
   ```
2. Inicie el servidor mediante Gradle Wrapper:
   * **En Windows (PowerShell / CMD):**
     ```powershell
     .\gradlew.bat bootRun
     ```
   * **En Linux / macOS:**
     ```bash
     ./gradlew bootRun
     ```
3. La API REST quedará accesible en: `http://localhost:8080/api/v1`.

---

### 3. Ejecución del Frontend

1. Abra una segunda terminal y sitúese en el directorio `frontend`:
   ```bash
   cd frontend
   ```
2. Instale los paquetes y dependencias requeridas:
   ```bash
   npm install
   ```
3. Si requiere personalizar las rutas de conexión, copie la plantilla de variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
4. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. La interfaz web estará disponible en el navegador en: `http://localhost:3000`.

---

## Ejecución de Pruebas Automatizadas

### Pruebas del Backend
Para ejecutar la suite de pruebas unitarias y de integración del backend, sitúese en `backend/` y ejecute:
```powershell
.\gradlew.bat test
```

### Pruebas del Frontend
Para ejecutar las pruebas del frontend, sitúese en `frontend/`:
* **Pruebas unitarias y de componentes (Vitest):**
  ```bash
  npm test
  ```
* **Pruebas End-to-End (Playwright):**
  ```bash
  npx playwright test
  ```

---

## Información Institucional
* **Proyecto de Titulación:** Carrera de Computación / Sistemas de Información.
* **Entidad Académica:** Facultad de Ingeniería y Ciencias Aplicadas (FICA), Universidad Central del Ecuador (UCE).
