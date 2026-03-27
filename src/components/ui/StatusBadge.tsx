import type { ProfileStatus } from '../../types'

const STATUS_STYLES: Record<ProfileStatus, Record<string, string | number>> = {
  active: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: 'var(--badge-status-active-bg)',
    color: 'var(--badge-status-active-text)',
  },
  inactive: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: 'var(--badge-status-inactive-bg)',
    color: 'var(--badge-status-inactive-text)',
  },
  suspended: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: 'var(--badge-status-suspended-bg)',
    color: 'var(--badge-status-suspended-text)',
  },
}

const LABELS: Record<ProfileStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
}

export interface StatusBadgeProps {
  
  status?: ProfileStatus | null
}

export function StatusBadge({ status = 'active' }: StatusBadgeProps) {
  const key = status === 'inactive' || status === 'suspended' ? status : 'active'
  return <span style={STATUS_STYLES[key]}>{LABELS[key]}</span>
}

