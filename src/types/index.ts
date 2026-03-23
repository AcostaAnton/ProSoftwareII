// Todos los tipos TypeScript de la aplicación
// Espejo exacto de las tablas de Supabase

// - Enums

export type UserRole = 'admin' |'resident' | 'security'

/** Estado del perfil de usuario (columna status en profiles) */
export type ProfileStatus = 'active' | 'inactive' | 'suspended'

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'

// - Interfaces

export interface Community {
    id: string
    name: string
    address: string
    created_at: string
}

export interface Unit {
    id: string
    community_id: string
    number: string
    owner_id: string | null
    /** Segundo residente de la misma vivienda (requiere migración 003_units_co_owner.sql). */
    co_owner_id?: string | null
    created_at: string
}

export interface Visit {
    id: string
    resident_id: string
    visitor_name: string
    visitor_phone: string | null
    visit_date: string
    visit_time: string | null
    visit_purpose: string | null
    visit_destination: string | null
    qr_token: string
    status: VisitStatus
    created_at: string
}

export interface CreateVisitInput {
    resident_id: string
    visitor_name: string
    visitor_phone?: string | null
    visit_date: string
    visit_time?: string | null
    visit_purpose?: string | null
    visit_destination?: string | null
    status: VisitStatus
}

export interface AccessLog {
    id: string
    visit_id: string
    guard_id: string
    entry_time: string
    exit_time: string
    created_at: string
}

export interface Profile {
    id: string
    name: string
    phone: string
    role: UserRole
    community_id: string
    created_at: string
    email?: string | null
    unit_number?: string | null    /** Estado del perfil: active, inactive, suspended */
    status?: ProfileStatus
}

// ── Vistas enriquecidas (JOINs de Supabase) ──────────────────
export interface VisitWithResident extends Visit {
    resident_name: string
    resident_phone: string | null
    unit_number: string | null
    community_name: string | null
}

export interface AccessLogDetail extends AccessLog {
    visit_name: string
    visit_phone: string | null
    qr_token: string
    reason: string
    resident_name: string
    unit_number: string | null
    guard_name: string
    guard_phone: string | null
}

// - Forms

export interface LoginForm {
    email: string
    password: string
}

export interface RegisterForm {
    email: string
    password: string
    name: string
    phone: string
    role: UserRole
    community_id: string
}

export interface NewVisitForm {
    visitor_name: string
    visitor_phone: string
    visit_date: string
    visit_hour: string
    visit_minute: string
    visit_period: 'AM' | 'PM'
    visit_purpose: string
    visit_destination: string
}

export interface AuthUser {
    id: string
    email: string
    profile: Profile | null
}
