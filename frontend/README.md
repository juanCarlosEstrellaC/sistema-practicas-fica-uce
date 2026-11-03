# Frontend Web - Sistema de Prácticas y Vinculación (FICA - UCE)

Interfaz de usuario web para el Sistema de Gestión de Prácticas Preprofesionales (PP) y Vinculación con la Sociedad (VCS) de la Facultad de Ingeniería y Ciencias Aplicadas de la Universidad Central del Ecuador.

---

## Tecnologías Principales

* **Framework Web:** Next.js 16 (App Router)
* **Biblioteca UI:** React 19
* **Lenguaje:** TypeScript
* **Diseño y Estilos:** Tailwind CSS 4 con componentes modulares de shadcn/ui (Radix UI)
* **Validación de Datos:** Zod
* **Pruebas Unitarias y de Integración:** Vitest con Testing Library
* **Pruebas End-to-End (E2E):** Playwright

---

## Principios de Arquitectura Frontend

La aplicación implementa los estándares modernos de desarrollo en Next.js:

1. **React Server Components (RSC) y Server Actions:**  
   La obtención y mutación de datos de negocio se gestiona exclusivamente a través de Server Actions (`src/lib/acciones/`), ejecutándose en el servidor sin exponer la lógica interna de la API REST al navegador.
2. **Seguridad y Proxy Inverso (`/api/proxy`):**  
   Las credenciales de sesión se gestionan mediante cookies cifradas de tipo `httpOnly`. El endpoint dinámico `/api/proxy` actúa como intermediario para la previsualización segura de documentos PDF, descargas y el canal de notificaciones en tiempo real vía Server-Sent Events (SSE).
3. **Navegación Limpia:**  
   Todas las vistas operan bajo rutas dedicadas y tipadas (por ejemplo, `/dashboard/practicas/asignaciones`), evitando parámetros de consulta ambiguos (`?tab=`).
4. **Validación Declarativa:**  
   Cada formulario y operación de entrada se valida en cliente y servidor con esquemas formales en Zod (`src/lib/esquemas/`).

---

## Estructura del Proyecto

```text
src/
├── app/                      # Rutas del App Router (páginas, layouts y API routes)
│   ├── api/proxy/            # Proxy inverso para binarios y eventos SSE
│   ├── dashboard/            # Paneles de gestión por rol institucional
│   └── (auth)/               # Vistas de autenticación y activación de cuenta
├── components/               # Componentes React (shadcn/ui y componentes de dominio)
│   ├── comunes/              # Componentes reutilizables (tablas, modales, firmas)
│   ├── practicas/            # Componentes específicos de Prácticas Preprofesionales
│   └── vinculacion/          # Componentes específicos de Vinculación con la Sociedad
├── lib/
│   ├── acciones/             # Server Actions por módulo funcional
│   ├── esquemas/             # Esquemas de validación Zod
│   ├── tipos/                # Definiciones TypeScript y DTOs
│   └── utilidades/           # Funciones auxiliares de formateo y validación
e2e/                          # Suites completas de pruebas automatizadas con Playwright
```

---

## Requisitos Previos

Antes de ejecutar este frontend, asegúrese de contar con:

1. **Node.js:** Versión 20.x o superior instalada.
2. **Gestor de Paquetes:** `npm` versión 10 o superior (incluido con Node.js).
3. **Backend en Ejecución:** La API REST de Spring Boot debe estar en ejecución en `http://localhost:8080/api/v1` (o mediante el contenedor de Docker correspondiente).

---

## Configuración del Entorno

Si usted requiere personalizar la URL de conexión hacia el backend o el proxy, cree un archivo `.env.local` en la raíz de este directorio basándose en la plantilla `.env.example`:

```bash
cp .env.example .env.local
```

### Variables disponibles:
| Variable | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `/api/proxy` | Ruta relativa del proxy para el navegador |
| `BACKEND_URL` | `http://localhost:8080/api/v1` | URL interna hacia la API REST de Spring Boot |

---

## Comandos de Ejecución

### 1. Instalación de dependencias
Para instalar los módulos del proyecto:
```bash
npm install
```

### 2. Iniciar en modo desarrollo
Para iniciar el servidor de desarrollo local:
```bash
npm run dev
```
La aplicación quedará disponible en su navegador en: `http://localhost:3000`.

### 3. Compilación y arranque en producción
Para generar la versión de producción optimizada y ejecutarla:
```bash
npm run build
npm start
```

---

## Pruebas Automatizadas

### Pruebas Unitarias y de Componentes (Vitest)
Para ejecutar la suite completa de pruebas unitarias:
```bash
npm test
```

### Pruebas de Interfaz End-to-End (Playwright)
Para ejecutar los flujos de prueba de extremo a extremo:
```bash
npx playwright test
```
*(Para visualizar el reporte interactivo de Playwright, ejecute: `npx playwright show-report`).*

