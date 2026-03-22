# Esquema de tablas (001_initial_schema.sql)

---

## Tabla public.communities

Representa comunidades o residenciales.

| Columna     | Tipo        | Descripción |
|-------------|-------------|-------------|
| id          | UUID        | Clave primaria (auto). |
| name        | TEXT        | Nombre de la comunidad. NOT NULL. |
| address     | TEXT        | Dirección. Opcional. |
| created_at  | TIMESTAMPTZ | Fecha de creación. |

---

## Tabla public.profiles

Representa el perfil de usuario (1:1 con auth.users).

| Columna       | Tipo         | Descripción |
|---------------|--------------|-------------|
| id            | UUID         | Clave primaria (FK a auth.users). ON DELETE CASCADE. |
| name          | TEXT         | Nombre. Opcional. |
| phone         | TEXT         | Teléfono. Opcional. |
| role          | profile_role | Rol: admin, security, resident, visitor. NOT NULL. |
| community_id  | UUID         | Comunidad a la que pertenece (FK a communities). Opcional (SET NULL si se borra). |
| created_at    | TIMESTAMPTZ  | Fecha de creación. |

---

## Tabla public.units

Representa unidades dentro de una comunidad (por ejemplo departamentos, casas, lotes).

| Columna      | Tipo        | Descripción |
|--------------|-------------|-------------|
| id           | UUID        | Clave primaria (auto). |
| community_id | UUID        | Comunidad a la que pertenece (FK a communities). NOT NULL. |
| number       | TEXT        | Número o identificador de la unidad (ej. "101", "A-2"). NOT NULL. |
| owner_id     | UUID        | Dueño de la unidad (FK a profiles). Opcional (SET NULL si se borra). |
| created_at   | TIMESTAMPTZ | Fecha de creación. |

---

## Tabla public.visits

Representa visitas registradas por un residente.

| Columna        | Tipo          | Descripción |
|----------------|---------------|-------------|
| id             | UUID          | Clave primaria (auto). |
| resident_id    | UUID          | Resident que registra la visita (FK a profiles). NOT NULL. |
| visitor_name   | TEXT          | Nombre del visitante. NOT NULL. |
| visitor_phone  | TEXT          | Teléfono del visitante. Opcional. |
| visit_date     | DATE          | Fecha de la visita. NOT NULL. |
| visit_time     | TIME          | Hora. Opcional. |
| visit_purpose  | TEXT          | Asunto o motivo de la visita. Opcional. |
| visit_destination | TEXT        | Lugar o unidad de destino. Opcional. |
| qr_token       | TEXT          | Token único para QR. UNIQUE NOT NULL. |
| status         | visit_status  | Estado: pending, approved, rejected, completed, cancelled. NOT NULL. |
| created_at     | TIMESTAMPTZ   | Fecha de creación. |

---

## Tabla public.access_logs

Representa el registro de entrada y salida por visita y guardia.

| Columna    | Tipo        | Descripción |
|------------|-------------|-------------|
| id         | UUID        | Clave primaria (auto). |
| visit_id   | UUID        | Visita (FK a visits). NOT NULL. ON DELETE CASCADE. |
| guard_id   | UUID        | Guardia que registra (FK a profiles). NOT NULL. ON DELETE CASCADE. |
| entry_time | TIMESTAMPTZ | Hora de entrada. |
| exit_time  | TIMESTAMPTZ | Hora de salida. Opcional. |
| created_at | TIMESTAMPTZ | Fecha de creación. |

---

## ENUMs

- **profile_role:** admin, security, resident, visitor
- **visit_status:** pending, approved, rejected, completed, cancelled
