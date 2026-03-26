# ProSoftware - Sistema de Control de Accesos y Visitas

Proyecto frontend desarrollado con React, TypeScript y Vite, respaldado por Supabase para autenticación y base de datos, diseñado para la gestión y control de accesos en complejos residenciales o comerciales.

## 🚀 Características Principales

El sistema está construido alrededor de un **Control de Acceso Basado en Roles (RBAC)**, soportando los siguientes perfiles:

*   **Administrador (`admin`)**:
    *   Gestión completa de usuarios (residentes) y guardias de seguridad.
    *   Visualización de estadísticas globales de accesos.
    *   Capacidad de operar como guardia para escanear y registrar accesos.
*   **Residente (`resident`)**:
    *   Dashboard personalizado.
    *   Creación y programación de visitas (a la residencia o áreas comunes).
    *   Generación de pases de acceso con **Código QR** para los visitantes.
    *   Historial de visitas propias (`Mis Visitas`).
*   **Guardia de Seguridad (`security`)**:
    *   Dashboard operativo.
    *   **Escáner QR Integrado**: Lector de códigos QR en tiempo real usando la cámara del dispositivo para verificar pases de visitantes.
    *   Registro de entradas y salidas en las puertas de acceso.

### Otras funcionalidades clave:
*   Página de acceso público para visitantes (`/acceso/:token`) donde pueden visualizar y descargar su pase QR.
*   Flujo de seguridad que fuerza el cambio de contraseña para nuevos usuarios.
*   Diseño responsive y moderno utilizando Tailwind CSS v4.

---

## 🛠️ Stack Tecnológico

**Core & UI**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (Bundler y entorno de desarrollo)
- [React Router v7](https://reactrouter.com/) (Enrutamiento y protección de rutas)
- [Tailwind CSS v4](https://tailwindcss.com/) (Estilos utilitarios)

**Backend as a Service (BaaS)**
- [Supabase](https://supabase.com) (`@supabase/supabase-js`)
  - Autenticación manejada (JWT).
  - PostgreSQL con Row Level Security (RLS) para proteger los datos por rol.

**Herramientas Auxiliares QR**
- `qrcode`: Generación de códigos QR para visitantes.
- `qr-scanner`: Lectura de códigos QR vía cámara en el control de acceso.
- `html-to-image`: Exportación del pase de visita como imagen (descarga disponible para invitados).

**Testing y Calidad**
- Vitest + React Testing Library (Pruebas unitarias y de componentes).
- ESLint + TypeScript ESLint.

---

## ⚙️ Requisitos Previos

- Node.js (recomendado v18 o superior)
- Cuenta y proyecto configurado en [Supabase](https://supabase.com)

## 📦 Instalación y Configuración

1. **Clonar e instalar dependencias:**

```bash
npm install
```

2. **Variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto tomando como referencia las siguientes variables necesarias:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto en Supabase (Dashboard → Settings → API) | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase (Dashboard → Settings → API) | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_APP_URL` | URL base de la aplicación (para redirecciones, enlaces de invitación) | `http://localhost:5173` |

**Importante:** Nunca incluyas la clave de servicio (`service_role` key) en las variables que comienzan con `VITE_`, ya que quedan expuestas al cliente.

Ejemplo del archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_APP_URL=http://localhost:5173
```

3. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 📜 Scripts de NPM Disponibles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Inicia el servidor de desarrollo Vite. |
| `npm run build` | Compila TypeScript y construye la aplicación para producción. |
| `npm run lint` | Ejecuta ESLint en el código para encontrar problemas. |
| `npm run preview` | Sirve localmente los archivos compilados del build de producción. |
| `npm run test` | Inicia Vitest en modo watch interactivo. |
| `npm run test:run` | Ejecuta los tests una vez (ideal para CI). |
| `npm run test:coverage` | Ejecuta los tests y muestra reporte de cobertura. |

---

## 🔐 Estructura del Proyecto (src/)

- `/admin`: Vistas para gestión administrativa (usuarios, guardias, stats).
- `/auth`: Componentes de autenticación (Login, Forzar cambio de clave).
- `/components`: Componentes reutilizables de UI, Layout e interfaces compartidas.
- `/context`: Estados globales como el `AuthContext`.
- `/pages`: Vistas principales.
  - `/visits`: Flujo de creación de vistas, lista y detalles para residentes.
  - `/scan`: Lector de QR para personal de seguridad.
  - `/dashboard`: Panel de resumen general.
- `/router`: Definición de rutas y protecciones (`AuthGuard`, `ProtectedRoute`).
- `/services`: Lógica de interacción con Supabase (Auth, Usuarios, Visitas, Logs).
- `/utils`: Funciones auxiliares genéricas (fechas, formateos).

---

Desarrollado con ❤️ usando Vite & Supabase.
