import type { UserRole } from '../../types'

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: 'var(--badge-role-admin-bg)', text: 'var(--badge-role-admin-text)' },
  resident: { bg: 'var(--badge-role-resident-bg)', text: 'var(--badge-role-resident-text)' },
  security: { bg: 'var(--badge-role-security-bg)', text: 'var(--badge-role-security-text)' },
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  resident: 'Residente',
  security: 'Guardia'
}

export interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const { bg, text } = ROLE_COLORS[role]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color: text,
      }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
