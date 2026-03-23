import type { CSSProperties } from 'react'
import type { ProfileStatus, UserRole } from '../../types'
import type { CommunityUnitRow } from '../../services/users.service'
import { MAX_RESIDENTS_PER_UNIT } from '../../services/users.service'

export const ROLES: UserRole[] = ['admin', 'resident', 'security']
export const STATUSES: ProfileStatus[] = ['active', 'inactive', 'suspended']

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  resident: 'Residente',
  security: 'Guardia',
}

export const STATUS_LABELS: Record<ProfileStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
}

export const ROLE_ACTIVE: Record<UserRole, CSSProperties> = {
  admin: { borderColor: '#22d3ee', color: '#22d3ee', background: 'rgba(34,211,238,.1)' },
  resident: { borderColor: '#818cf8', color: '#818cf8', background: 'rgba(129,140,248,.1)' },
  security: { borderColor: '#fb923c', color: '#fb923c', background: 'rgba(251,146,60,.1)' },
}

export const STATUS_ACTIVE: Record<ProfileStatus, CSSProperties> = {
  active: { borderColor: '#4ade80', color: '#4ade80', background: 'rgba(74,222,128,.08)' },
  inactive: { borderColor: '#fbbf24', color: '#fbbf24', background: 'rgba(251,191,36,.08)' },
  suspended: { borderColor: '#f87171', color: '#f87171', background: 'rgba(248,113,113,.08)' },
}

/** Cierre del modal tras guardado exitoso (feedback verde). */
export const ADMIN_USERS_MODAL_SUCCESS_MS = 1200

export function isValidEmail(value: string): boolean {
  const v = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function residentSlotsUsed(u: CommunityUnitRow): number {
  const a = u.owner_id != null && String(u.owner_id).length > 0 ? 1 : 0
  const b = u.co_owner_id != null && String(u.co_owner_id).length > 0 ? 1 : 0
  return a + b
}

function isUnitFullForResidents(u: CommunityUnitRow): boolean {
  return residentSlotsUsed(u) >= MAX_RESIDENTS_PER_UNIT
}

function profileHasSlotInUnit(u: CommunityUnitRow, profileId: string): boolean {
  return u.owner_id === profileId || u.co_owner_id === profileId
}

/**
 * `disabled` y texto extra del <option>: en edición, si el usuario ya tiene cupo en esa vivienda,
 * no se bloquea aunque esté 2/2 (muestra " (2/2)" en vez de " (completa)").
 */
export function getHousingSelectOptionState(
  u: CommunityUnitRow,
  currentProfileId?: string
): { disabled: boolean; suffix: string } {
  const used = residentSlotsUsed(u)
  const blocked =
    isUnitFullForResidents(u) &&
    (!currentProfileId || !profileHasSlotInUnit(u, currentProfileId))
  const suffix = blocked
    ? ' (completa)'
    : used > 0
      ? ` (${used}/${MAX_RESIDENTS_PER_UNIT})`
      : ''
  return { disabled: blocked, suffix }
}
