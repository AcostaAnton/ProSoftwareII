# 🏢 Sistema de Gestión de Visitas en Residencial

Documento de requerimientos funcionales y no funcionales, actualizado con el estado real de implementación del proyecto.

> **Leyenda de estado:**
> - ✅ Implementado
> - ⚠️ Parcialmente implementado
> - ❌ Pendiente / No implementado

---

## 1️⃣ Objetivo del Sistema

Desarrollar una aplicación web que permita gestionar y controlar el ingreso y salida de visitantes en una residencial, garantizando **seguridad**, **trazabilidad** y **registro histórico** de accesos.

---

## 2️⃣ Requerimientos Funcionales

---

### 2.1 Gestión de Usuarios y Autenticación

| Funcionalidad | Estado | Notas |
|---|---|---|
| Inicio de sesión con email y contraseña | ✅ | Autenticación via Supabase Auth (JWT) |
| Cambio forzado de contraseña al primer login | ✅ | Flujo `must_change_password` con ruta protegida `/account/cambiar-contrasena` |
| Roles del sistema: Admin, Guardia, Residente | ✅ | RBAC implementado con `AuthGuard` y `ProtectedRoute` |
| Registro de residentes por el administrador | ✅ | Crear cuenta con contraseña temporal + asignación de unidad y comunidad |
| Registro de guardias de seguridad por el administrador | ✅ | Misma lógica de creación que residentes, rol `security` |
| Edición de residentes y guardias | ✅ | Editar nombre, teléfono, rol, estado y unidad asignada |
| Desactivación / eliminación de usuarios | ✅ | Campo `status` en `profiles` (`active` / `inactive`) |
| Recuperación de contraseña (flujo "olvidé mi clave") | ❌ | No hay pantalla de recuperación autónoma. Solo el admin puede gestionar accesos |
| Límite de 2 residentes por unidad habitacional | ✅ | Validado en servicio mediante `owner_id` y `co_owner_id` en `units` |

**Roles implementados:**

| Rol | Descripción |
|---|---|
| `admin` | Gestión total del sistema: usuarios, guardias, estadísticas, visitas |
| `security` | Control de ingreso/salida: escáner QR y registro de accesos |
| `resident` | Crea y gestiona sus propias visitas, genera pases QR |

---

### 2.2 Registro de Visitas

| Campo | Estado | Notas |
|---|---|---|
| Nombre completo del visitante | ✅ | Campo requerido |
| Teléfono del visitante | ✅ | Opcional |
| Fecha de visita | ✅ | Campo requerido |
| Hora de visita | ✅ | Opcional |
| Motivo / asunto de visita | ✅ | Opcional; con opciones predefinidas para residencias y áreas comunes |
| Destino / unidad a visitar | ✅ | Opcional; selección de unidades de la comunidad |
| Estado de la visita | ✅ | `pending`, `approved`, `rejected`, `completed`, `cancelled` |
| Generación de token QR único (8 caracteres hex) | ✅ | Token generado con `crypto.getRandomValues()` |
| Fotografía del visitante | ⚠️ | Componente `CameraCapture.tsx` y `uploadVisitPhoto()` implementados; integración en formulario pendiente de validar |
| Identidad / DPI / Pasaporte | ❌ | Campo no incluido en la tabla `visits` |
| Número de placa vehicular | ⚠️ | Campos `vehicle_photo_url` y `vehicle_notes` disponibles en `access_logs`; no en el formulario de visita |

---

### 2.3 Pase QR del Visitante

| Funcionalidad | Estado | Notas |
|---|---|---|
| Generación del pase QR | ✅ | Componente `QRGenerator.tsx` con tarjeta visual completa |
| Página pública de acceso sin login (`/acceso/:token`) | ✅ | Página `VisitorAccessPage` accesible por cualquier persona con el enlace |
| Descarga del pase como imagen | ✅ | Mediante `html-to-image` |
| Compartir pase por mensaje (WhatsApp / SMS) | ✅ | Mensaje de invitación generado con `qrInvitationMessage.ts` |

---

### 2.4 Control de Ingreso y Salida (Guardia)

| Funcionalidad | Estado | Notas |
|---|---|---|
| Escáner QR en tiempo real (cámara del dispositivo) | ✅ | Componente `QRScanner.tsx` usando `qr-scanner` |
| Registro de entrada (check-in) | ✅ | Se guarda en tabla `access_logs` con `entry_time` |
| Registro de salida (check-out) | ✅ | Se actualiza `exit_time` en el registro de `access_logs` |
| Registro automático de fecha y hora | ✅ | Timestamp del servidor Supabase |
| Verificación del estado de la visita al escanear | ✅ | Visita debe estar en estado `pending` o `approved` |
| Visualización de visitas activas dentro del residencial | ✅ | Dashboard del guardia muestra visitas del día |
| Notas de entrada / salida | ⚠️ | Campos `entry_notes` y `exit_notes` en `access_logs`; UI no completamente expuesta |

---

### 2.5 Gestión de Visitas (Residente y Admin)

| Funcionalidad | Estado | Notas |
|---|---|---|
| Crear nueva visita | ✅ | Formulario en `/visits/new` |
| Ver mis visitas (residente) | ✅ | Ruta `/visits/my-visits` exclusiva para rol `resident` |
| Ver lista completa de visitas | ✅ | Ruta `/visits/list` con paginación y filtros por estado |
| Ver detalle de una visita | ✅ | Ruta `/visits/:id` con logs de acceso e historial de estado |
| Cancelar visita | ✅ | Acción disponible en el detalle de la visita |
| Cambiar estado de visita manualmente | ✅ | `approve`, `reject`, etc. desde la vista de detalle |
| Historial de cambios de estado | ✅ | Tabla `visit_status_history` con usuario y fecha de cada cambio |
| Filtro de visitas por estado | ✅ | Filtros en `VisitList` |
| Filtro por fecha | ⚠️ | Visitas ordenadas por fecha; filtro de rango de fecha no implementado |
| Exportación de reportes (PDF / Excel) | ❌ | No implementado |

---

### 2.6 Administración

| Funcionalidad | Estado | Notas |
|---|---|---|
| Panel de estadísticas globales | ✅ | Ruta `/admin/stats` — visitas totales, accesos, residentes más activos |
| Gestión de residentes | ✅ | CRUD completo en `/admin/users` |
| Gestión de guardias de seguridad | ✅ | CRUD completo en `/admin/guards` |
| Gestión de comunidades | ⚠️ | Comunidades consultadas y asignadas; no hay pantalla CRUD de comunidades |
| Gestión de unidades habitacionales | ⚠️ | Unidades asignadas al crear/editar usuarios; no hay pantalla CRUD de unidades |

---

### 2.7 Seguridad y Trazabilidad

| Funcionalidad | Estado | Notas |
|---|---|---|
| Encriptación de contraseñas | ✅ | Manejada por Supabase Auth |
| Autenticación con JWT | ✅ | Tokens gestionados por Supabase Auth |
| Control de acceso por roles (RBAC) | ✅ | `AuthGuard` + `ProtectedRoute` en el frontend; RLS en el backend |
| Row Level Security (RLS) en Supabase | ✅ | Políticas definidas para cada rol sobre cada tabla |
| Bitácora de acciones críticas (audit logs) | ✅ | Tabla `audit_logs` con servicio `logs.service.ts` |
| Historial de cambios de estado de visitas | ✅ | Tabla `visit_status_history` |
| HTTPS | ✅ | Garantizado por el hosting (Vercel) |
| Notificaciones en tiempo real (push/SMS) | ❌ | No implementado |

---

## 3️⃣ Requerimientos No Funcionales

### 3.1 Seguridad

| Requerimiento | Estado |
|---|---|
| Encriptación de contraseñas | ✅ |
| JWT / Autenticación segura | ✅ |
| Control de acceso por roles | ✅ |
| HTTPS obligatorio | ✅ |

---

### 3.2 Rendimiento

| Requerimiento | Estado | Notas |
|---|---|---|
| Tiempo de respuesta < 2 segundos | ✅ | Consultas paginadas; React + Vite con SWC |
| Soporte para 50–200 usuarios concurrentes | ✅ | Delegado a Supabase (PostgreSQL gestionado) |

---

### 3.3 Disponibilidad

| Requerimiento | Estado | Notas |
|---|---|---|
| Sistema disponible 24/7 | ✅ | Supabase + Vercel garantizan alta disponibilidad |
| Backup automático diario | ✅ | Incluido en los planes de Supabase |

---

### 3.4 Usabilidad y Responsividad

| Requerimiento | Estado | Notas |
|---|---|---|
| Interfaz adaptada para guardias (botones grandes y visibles) | ✅ | Diseño operativo en `/scan` |
| Compatible con tablet y móvil | ✅ | Layout responsive + hook `useResponsive` |
| Diseño moderno con Tailwind CSS v4 | ✅ | |

---

### 3.5 Calidad de Código

| Requerimiento | Estado | Notas |
|---|---|---|
| Pruebas unitarias | ✅ | Vitest + React Testing Library; 8 suites en `src/test/` |
| Linting estático | ✅ | ESLint + TypeScript ESLint |
| Reporte de cobertura de código | ✅ | `vitest run --coverage` con proveedor V8 |

---

## 4️⃣ Modelo de Datos (Tablas Principales)

| Tabla | Descripción |
|---|---|
| `communities` | Residenciales registrados en el sistema |
| `profiles` | Perfiles de usuario extendidos (rol, comunidad, estado) |
| `units` | Unidades habitacionales (casa/depto) con titular y co-titular |
| `visits` | Visitas registradas por residentes con token QR único |
| `access_logs` | Registro de entrada/salida por cada visita |
| `visit_status_history` | Historial de cambios de estado de cada visita |
| `audit_logs` | Bitácora de acciones críticas del sistema |

---

## 5️⃣ Pendientes y Mejoras Futuras

| Feature | Prioridad sugerida |
|---|---|
| Recuperación de contraseña autónoma (forgot password) | Alta |
| Pantalla CRUD de comunidades y unidades para admin | Media |
| Filtro de visitas por rango de fechas | Media |
| Exportación de reportes en PDF / Excel | Media |
| Notificaciones en tiempo real (Supabase Realtime / push) | Media |
| Campo de identidad (DPI / pasaporte) en el formulario de visita | Baja |
| Campo de placa vehicular en el formulario de visita | Baja |
| Integración completa de captura de fotografía del visitante en formulario | Baja |