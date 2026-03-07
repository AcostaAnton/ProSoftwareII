# ProSoftware

Proyecto React + TypeScript + Vite con autenticación y base de datos en Supabase.

## Requisitos

- Node.js (recomendado v18+)
- Cuenta en [Supabase](https://supabase.com)

## Dependencias

### Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` | ^19.2.0 | UI |
| `react-dom` | ^19.2.0 | Render en el DOM |
| `react-router-dom` | ^7.13.1 | Rutas y navegación |
| `@supabase/supabase-js` | ^2.98.0 | Cliente Supabase (auth, BD) |

### Desarrollo

| Paquete | Uso |
|---------|-----|
| `vite` | Bundler y dev server |
| `@vitejs/plugin-react-swc` | React + SWC en Vite |
| `typescript` | Tipado estático |
| `@types/react`, `@types/react-dom`, `@types/node` | Tipos para TypeScript |
| `eslint` + `typescript-eslint` | Linting |
| `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Reglas ESLint para React |

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto en Supabase (Dashboard → Settings → API) | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase (Dashboard → Settings → API) | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_APP_URL` | URL base de la aplicación (para redirects, etc.) | `http://localhost:5173` |

**Importante:** En Vite las variables expuestas al cliente deben tener el prefijo `VITE_`. No incluyas la clave de servicio (service role key) en el frontend.

Ejemplo de `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_APP_URL=http://localhost:5173
```

## Desarrollo

```bash
npm run dev
```

La app estará en `http://localhost:5173`.

## Build

```bash
npm run build
```

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com) (auth + base de datos)
