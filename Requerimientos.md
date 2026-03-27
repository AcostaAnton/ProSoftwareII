# Sistema de gestión de visitas en residencial (PasaYa / ProSoftware)

Documento de **requerimientos alineados con la implementación actual** del código (React + Supabase). Las reglas de persistencia y permisos finales dependen de **políticas RLS** y del esquema en Supabase.

---

## 1. Objetivo del sistema

Permitir **registrar, autorizar y auditar** el acceso de visitantes a una comunidad cerrada: el **residente** (o administrador en nombre del conjunto) crea la visita y obtiene un **QR / enlace**; el **personal de seguridad** valida el código en garita y registra **entrada**, **denegación** o **salida**; el **administrador** gestiona **usuarios**, **unidades** (vía asignación) y **estadísticas** dentro de su comunidad.

---

## 2. Actores y roles

| Rol | Identificador en código | Alcance principal |
|-----|-------------------------|-------------------|
| Administrador | `admin` | Usuarios de la comunidad, estadísticas, lista global de visitas, escaneo, creación de visitas |
| Residente | `resident` | Propias visitas, creación de visitas, “Mis visitas”, dashboard |
| Guardia / seguridad | `security` | Lista de visitas y escaneo QR en garita |

El acceso a pantallas se controla con **rutas protegidas** (`AuthGuard` para sesión + `ProtectedRoute` por rol). La página de **actividad de guardias** (`/admin/guards`) usa **datos simulados** en el cliente; no persiste en Supabase.

---

## 3. Autenticación y usuarios

### 3.1 Implementado

- **Inicio de sesión** con correo y contraseña (Supabase Auth).
- **Cierre de sesión** desde la barra lateral.
- **Cambio obligatorio de contraseña** tras alta por administrador: metadata `must_change_password`; redirección a `/account/cambiar-contrasena` hasta actualizar (mínimo 8 caracteres).
- **Alta de usuarios por administrador** (`createCommunityUser`): contraseña temporal generada, `upsert` en tabla `profiles`, asignación opcional de **unidad** para residentes (hasta **2** residentes por unidad si existe columna `co_owner_id` en `units`).
- **Edición de usuarios**: rol, estado (`active` | `inactive` | `suspended`), comunidad y unidad según reglas del servicio.
- Perfiles con **comunidad** (`community_id`) y, en listados, **número de unidad** derivado de `units` (titular o co-titular).

### 3.2 No implementado en esta app (pantalla)

- **Autoregistro público** del visitante (no hay flujo de registro en UI; existe `registerUser` en servicio pero no se expone como pantalla principal).
- **Recuperación de contraseña** (pantalla “olvidé mi contraseña”); el login contempla mensajes de correo no confirmado según Supabase.

---

## 4. Estructura organizacional (datos)

- **Comunidades** (`communities`): el administrador opera sobre la comunidad asociada a su perfil.
- **Unidades / viviendas** (`units`): número de unidad, `owner_id` y opcionalmente `co_owner_id`. El código contempla **bases sin** `co_owner_id` (consultas alternativas).
- **Perfiles** (`profiles`): nombre, teléfono, correo, rol, estado, comunidad.

---

## 5. Visitas — reglas de negocio

### 5.1 Estados de visita

Valores usados en tipos y servicios: `pending` | `approved` | `rejected` | `completed` | `cancelled`.

- **Creación**: la visita queda en **`pending`** y se genera un **`qr_token`** único.
- **Garita — entrada**: pasa a **`approved`**, se registra log de acceso y línea en historial de estados.
- **Garita — denegación**: **`rejected`**, con motivo obligatorio en notas.
- **Garita — salida**: visita **`completed`** (asociada a actualización del log de acceso).
- **Cancelación** (p. ej. desde detalle): puede usarse **`cancelled`** vía actualización de estado.

### 5.2 Datos al crear una visita (formulario)

- **Obligatorios**: nombre del visitante, fecha de visita, hora (hora, minutos, AM/PM).
- **Opcionales**: teléfono del visitante, asunto / motivo (`visit_purpose`).
- En el modelo existe **`visit_destination`** en base y tipos; el formulario actual envía **`null`** (destino no capturado en UI).
- **No** se capturan en el alta: DPI/pasaporte, foto del visitante, placa de vehículo como campos dedicados (la foto en garita es del **vehículo** vía flujo de escaneo, con fallback si falla el storage).

### 5.3 QR y enlace de visitante

- Tras crear la visita se muestra **QR** (contenido basado en el token) para compartir.
- Ruta pública **`/acceso/:token`**: página para el visitante con QR y copia de enlace (sin login).

---

## 6. Funcionalidades por módulo (implementación)

### 6.1 Dashboard

- KPIs: **total**, **pendientes**, **aprobadas**, **completadas** (según rol: residente solo sus visitas; otros roles según consulta global o por comunidad).
- Tabla de **visitas recientes** con acción de ver QR si está pendiente (residente/admin).
- Botón **nueva visita** para **residente** y **admin**.

### 6.2 Listado de visitas

- **Residente**: solo sus visitas (`getVisitsByResident`).
- **Admin y seguridad**: todas las visitas (`getAllVisits`).
- **Filtros en cliente**: búsqueda por texto, rangos de fecha, atajos (hoy, semana, etc.), estados; **paginación** (tamaño de página fijo en código).

### 6.3 Detalle de visita

- Carga **perfil del residente**, **logs de acceso** e **historial de cambios de estado** (con joins o carga degradada si falla el join).
- Actualización manual de **estado** de la visita según `useVisits` / pantalla.

### 6.4 Garita — escaneo (`/scan`)

- Acceso **admin** y **security**.
- **Cámara** para leer QR o **entrada manual del token**.
- Coincidencia por `qr_token` contra la lista de visitas cargada en cliente.
- Modal de acciones: **entrada** (foto opcional, notas), **denegar** (motivo obligatorio), **salida** (notas), persistiendo en `access_logs`, `visits` y `visit_status_history`.

### 6.5 Administración

- **Usuarios** (`/admin/users`, solo admin): listado por comunidad, crear y editar.
- **Estadísticas** (`/admin/stats`, solo admin): rango de fechas, KPIs, top residentes por volumen, listado de incidentes (rechazadas), **exportación CSV** del periodo filtrado.
- **Actividad guardias** (`/admin/guards`): **demo con datos mock**, no integrado a Supabase.

---

## 7. Trazabilidad y bitácora

- **Entrada / salida / denegación** en garita generan o actualizan registros en **`access_logs`** (timestamps ISO, notas, foto de vehículo opcional).
- **`visit_status_history`** guarda transiciones con usuario que realizó el cambio (`changed_by_id`) y notas.
- **Subida de fotos** al bucket `visit-photos` (con URL de respaldo si la subida falla).

---

## 8. Requerimientos no funcionales (alineados al stack)

| Área | Criterio / implementación |
|------|---------------------------|
| Autenticación | Supabase Auth (sesión, refresh); **HTTPS** en despliegue del sitio |
| Autorización | Control por rol en frontend + **RLS** esperado en Supabase para datos reales |
| Seguridad de contraseñas | Delegada a Supabase (hashing); no almacenar contraseñas en texto en el cliente |
| Rendimiento | Listas con filtros locales; visitas paginadas en servicio donde aplica; `useDeferredValue` en búsqueda de lista |
| Usabilidad | Layout con **sidebar** y **topbar**; **responsive** (sidebar colapsable, backdrop en móvil); flujos de garita con botones grandes en pantalla de escaneo |
| Calidad | Tests unitarios (Vitest) en utilidades, helpers y pantallas puntuales |
| Desarrollo | `?skipAuth=1` solo en **modo desarrollo** para omitir guards (no usar en producción) |

---

## 9. Brecha respecto a documentos históricos o deseos iniciales

Si se comparaba con un alcance “ideal”, lo siguiente **no está cubierto** o está **parcial** en la versión actual:

- Notificaciones **push** o **tiempo real** a residentes cuando llega un visitante.
- Exportación **PDF** o **Excel** nativa (solo **CSV** en estadísticas).
- Registro de **DPI / documento**, **foto del visitante** en el alta, **placa** como campo propio.
- **Recuperación de contraseña** desde la app.
- **Gestión real de guardias** y métricas de guardias desde base de datos (pantalla mock).
- **Disponibilidad 24/7**, **backups diarios** y **N usuarios concurrentes**: dependen del plan y configuración de Supabase/infra, no del código del cliente.

---

## 10. Variables de entorno

La aplicación requiere al menos:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Opcionalmente, URL pública del sitio para enlaces de correo/redirecciones (según `getPublicSiteUrl`).

---

*Última revisión según el código de la aplicación cliente; migraciones SQL y políticas RLS deben documentarse en el repositorio del backend o en Supabase.*
