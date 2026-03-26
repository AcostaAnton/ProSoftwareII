# ProSoftware — Sistema de Control de Accesos y Visitas

Aplicación web frontend desarrollada con **React 19**, **TypeScript** y **Vite**, respaldada por **Supabase** como BaaS (autenticación + base de datos PostgreSQL), diseñada para la gestión y control de accesos en complejos residenciales.

---

## 🚀 Características Principales

El sistema implementa **Control de Acceso Basado en Roles (RBAC)** con tres perfiles:

### 👤 Administrador (`admin`)
- Gestión completa de residentes (crear, editar, eliminar).
- Gestión de guardias de seguridad.
- Visualización de estadísticas globales de accesos (`/admin/stats`).
- Puede operar como guardia para escanear y registrar accesos.

### 🏠 Residente (`resident`)
- Dashboard personalizado con resumen de actividad.
- Creación y programación de visitas a su residencia o áreas comunes.
- Generación de **pases de acceso con Código QR** para los visitantes.
- Vista de sus propias visitas (`/visits/my-visits`).
- Historial completo de visitas (`/visits/list`).

### 👮 Guardia de Seguridad (`security`)
- Dashboard operativo con visitas del día.
- **Escáner QR en tiempo real** usando la cámara del dispositivo (`/scan`).
- Registro de entradas y salidas de visitantes en la puerta de acceso.

### 🌐 Visitante (acceso público)
- Página pública sin autenticación (`/acceso/:token`) para visualizar y compartir el pase QR.
- El pase puede descargarse como imagen.

### 🔒 Seguridad del sistema
- Flujo que **fuerza el cambio de contraseña** para nuevos usuarios en su primer inicio de sesión.
- **Row Level Security (RLS)** en Supabase para proteger los datos por rol.
- **Audit logs** para trazabilidad de acciones críticas.
- Protección de rutas con `AuthGuard` y `ProtectedRoute`.

---

## 🛠️ Stack Tecnológico

### Core & UI
| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | ^19.2.4 | Framework de UI |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.3 | Tipado estático |
| [Vite](https://vitejs.dev/) + SWC | ^7.3.1 | Bundler y dev server |
| [React Router](https://reactrouter.com/) | ^7.13.1 | Enrutamiento y protección de rutas |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.2.2 | Estilos utilitarios |

### Backend as a Service (BaaS)
| Tecnología | Versión | Uso |
|---|---|---|
| [Supabase](https://supabase.com) | ^2.98.0 | Auth (JWT), PostgreSQL, RLS |

### Herramientas QR
| Paquete | Uso |
|---|---|
| `qrcode` ^1.5.4 | Generación de códigos QR (pase de visitante) |
| `qr-scanner` ^1.4.2 | Lectura de QR vía cámara (guardia de seguridad) |
| `html-to-image` ^1.11.13 | Exportar el pase de visita como imagen descargable |

### Testing & Calidad
| Herramienta | Uso |
|---|---|
| [Vitest](https://vitest.dev/) ^4.1.0 | Framework de pruebas unitarias |
| [React Testing Library](https://testing-library.com/) ^16.3.2 | Pruebas de componentes |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | Reportes de cobertura de código |
| [ESLint](https://eslint.org/) ^9.39.1 + TypeScript ESLint | Linting estático |

---

## ⚙️ Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta y proyecto configurado en [Supabase](https://supabase.com)

---

## 📦 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd ProSoftwareII
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto en Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_APP_URL` | URL base de la app (para links de invitación QR) | `http://localhost:5173` |

> **Importante:** Nunca uses la `service_role` key en variables `VITE_*`, ya que quedan expuestas al cliente (navegador).

```env
# .env.local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_APP_URL=http://localhost:5173
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite con hot-reload. |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `/dist`. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto. |
| `npm run test` | Ejecuta Vitest en modo watch (interactivo). |
| `npm run test:run` | Ejecuta los tests una sola vez (ideal para CI/CD). |
| `npm run test:coverage` | Ejecuta los tests y genera reporte de cobertura de código. |

---

## 🗂️ Estructura del Proyecto

```
ProSoftwareII/
├── public/                   # Archivos estáticos públicos
├── docs/                     # Documentación adicional (ej. schema-tables.md)
├── src/
│   ├── assets/               # Imágenes y recursos estáticos
│   ├── components/
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── layout/           # Layout principal (MainLayout, Sidebar, Navbar)
│   │   ├── shared/           # Componentes reutilizables de dominio
│   │   │   ├── QRGenerator.tsx
│   │   │   ├── QRScanner.tsx
│   │   │   ├── CameraCapture.tsx
│   │   │   └── VisitActionModal.tsx
│   │   └── ui/               # Componentes base de UI
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       └── ...
│   ├── context/
│   │   └── AuthContext.tsx   # Contexto global de autenticación
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   ├── useVisits.ts
│   │   └── useResponsive.ts
│   ├── pages/
│   │   ├── admin/            # Panel de administración (usuarios, guardias, stats)
│   │   ├── auth/             # Login y cambio forzado de contraseña
│   │   ├── dashboard/        # Dashboard según rol
│   │   ├── public/           # Página pública del pase QR (/acceso/:token)
│   │   ├── scan/             # Escáner QR para guardias de seguridad
│   │   └── visits/           # Creación, lista y detalle de visitas
│   ├── router/
│   │   ├── AppRouter.tsx     # Definición de todas las rutas
│   │   ├── AuthGuard.tsx     # Protección: requiere sesión activa
│   │   └── ProtectedRoute.tsx # Protección: requiere rol específico
│   ├── services/             # Lógica de acceso a Supabase
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── visits.service.ts
│   │   ├── guards.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── visitGateActions.service.ts
│   │   ├── logs.service.ts
│   │   └── supabase.ts       # Inicialización del cliente Supabase
│   ├── test/                 # Tests unitarios y de componentes
│   ├── types/                # Tipos TypeScript globales
│   └── utils/                # Funciones auxiliares
│       ├── formatDate.ts
│       ├── qrInvitationMessage.ts
│       ├── visitorAccessUrl.ts
│       └── publicSiteUrl.ts
├── .env.local                # Variables de entorno (no versionado)
├── vite.config.ts            # Configuración de Vite y Vitest
├── tsconfig.json             # Configuración de TypeScript
└── package.json
```

---

## 🗃️ Modelo de Base de Datos

El proyecto utiliza las siguientes tablas en Supabase (PostgreSQL):

| Tabla | Descripción |
|---|---|
| `communities` | Residenciales o complejos registrados |
| `profiles` | Perfiles de usuario (1:1 con `auth.users`), incluye rol y comunidad |
| `units` | Unidades habitacionales (casas, departamentos) de cada comunidad |
| `visits` | Visitas registradas por residentes, con token QR único |
| `access_logs` | Registro de entradas/salidas por visita y guardia |
| `audit_logs` | Bitácora de acciones críticas del sistema (RBAC, logs de seguridad) |

**ENUMs:**
- `profile_role`: `admin` | `security` | `resident` | `visitor`
- `visit_status`: `pending` | `approved` | `rejected` | `completed` | `cancelled`

> Consulta la documentación completa del esquema en [`docs/schema-tables.md`](./docs/schema-tables.md).

---

## 🌐 Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión |
| `/acceso/:token` | Público | Pase QR del visitante |
| `/account/cambiar-contrasena` | Autenticado | Cambio forzado de contraseña |
| `/dashboard` | Autenticado | Panel principal según rol |
| `/visits/new` | Autenticado | Crear nueva visita |
| `/visits/list` | Autenticado | Lista completa de visitas |
| `/visits/my-visits` | `resident` | Mis visitas (residente) |
| `/visits/:id` | Autenticado | Detalle de una visita |
| `/scan` | `admin`, `security` | Escáner QR de acceso |
| `/admin/users` | `admin` | Gestión de residentes |
| `/admin/guards` | `admin` | Gestión de guardias |
| `/admin/stats` | `admin` | Estadísticas globales |

---

## 🧪 Pruebas

Los tests se encuentran en `src/test/` e incluyen:

- **`Login.test.tsx`** — Componente de inicio de sesión
- **`ScanPage.test.tsx`** — Página de escáner QR
- **`Badge.test.tsx`** — Componente de badge de UI
- **`adminUsers.helpers.test.ts`** — Helpers de la sección de administración
- **`formatDate.test.ts`** — Utilidades de formateo de fechas
- **`qrInvitationMessage.test.ts`** — Generación del mensaje de invitación QR
- **`visitorAccessUrl.test.ts`** — Generación de URLs de acceso para visitantes
- **`publicSiteUrl.test.ts`** — Resolución de URL base pública

```bash
# Ejecutar todos los tests
npm run test:run

# Ver cobertura de código
npm run test:coverage
```

---

## 🚀 Despliegue

El proyecto está configurado para desplegarse en **Vercel** (ver [`vercel.json`](./vercel.json)). Para producción:

1. Configura las variables de entorno en el panel de Vercel.
2. Ejecuta el build:
   ```bash
   npm run build
   ```
3. El output se genera en la carpeta `/dist`.

---

Desarrollado con ❤️ usando **React** + **Vite** + **Supabase**.
