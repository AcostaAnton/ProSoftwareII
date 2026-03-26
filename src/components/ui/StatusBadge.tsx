import type { ProfileStatus } from '../../types'

const STATUS_STYLES: Record<ProfileStatus, Record<string, string | number>> = {
  active: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    background: 'rgba(34,197,94,.2)',
    color: '#4ade80',
  },
  inactive: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    background: 'rgba(148,163,184,.2)',
    color: '#94a3b8',
  },
  suspended: {
    display: 'inline-flex',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    background: 'rgba(239,68,68,.2)',
    color: '#f87171',
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

