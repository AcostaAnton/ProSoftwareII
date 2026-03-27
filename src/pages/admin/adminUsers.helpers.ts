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
  admin: { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'rgba(0, 229, 200, 0.1)' },
  resident: { borderColor: 'var(--accent-violet)', color: 'var(--accent-violet)', background: 'rgba(139, 92, 246, 0.1)' },
  security: { borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)', background: 'rgba(245, 166, 35, 0.1)' },
}

export const STATUS_ACTIVE: Record<ProfileStatus, CSSProperties> = {
  active: { borderColor: '#4ade80', color: '#4ade80', background: 'rgba(74,222,128,.08)' },
  inactive: { borderColor: '#fbbf24', color: '#fbbf24', background: 'rgba(251,191,36,.08)' },
  suspended: { borderColor: '#f87171', color: '#f87171', background: 'rgba(248,113,113,.08)' },
}

export const ADMIN_USERS_MODAL_SUCCESS_MS = 1200

const MAX_EMAIL_LEN = 254


export function isValidEmail(value: string): boolean {
  const v = value.trim()
  if (v.length === 0 || v.length > MAX_EMAIL_LEN) return false
  if (v.includes(' ')) return false
  const at = v.indexOf('@')
  if (at <= 0) return false
  if (v.indexOf('@', at + 1) !== -1) return false
  const local = v.slice(0, at)
  const domain = v.slice(at + 1)
  if (local.length > 64 || domain.length === 0) return false
  if (!domain.includes('.')) return false
  return true
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
