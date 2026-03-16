import type { UserRole } from '../../types'

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: 'rgba(126,34,206,.25)', text: '#c084fc' },
  resident: { bg: 'rgba(8,145,178,.2)', text: '#22d3ee' },
  security: { bg: 'rgba(217,119,6,.2)', text: '#fbbf24' },
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
        fontWeight: 500,
        background: bg,
        color: text,
      }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
