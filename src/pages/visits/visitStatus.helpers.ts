import type { VisitStatus } from '../../types/index'

export interface VisitStatusOptionDto {
    color: string
    label: string
    value: VisitStatus
}

const FALLBACK_STATUS: Omit<VisitStatusOptionDto, 'value'> = {
    color: '#6b7280',
    label: 'Desconocido'
}

const VISIT_STATUS_BY_VALUE = {
    pending: { color: '#f59e0b', label: 'Pendiente' },
    approved: { color: '#22c55e', label: 'Aprobada' },
    rejected: { color: '#ef4444', label: 'Rechazada' },
    completed: { color: '#06b6d4', label: 'Completada' },
    cancelled: { color: '#6b7280', label: 'Cancelada' },
} satisfies Record<VisitStatus, Omit<VisitStatusOptionDto, 'value'>>

/** Estados que a veces vienen del backend con otro nombre */
const STATUS_LABEL_ALIASES: Record<string, string> = {
    denied: 'Denegada',
}

export const VISIT_STATUS_OPTIONS: VisitStatusOptionDto[] = Object.entries(VISIT_STATUS_BY_VALUE).map(
    ([value, details]) => ({
        value: value as VisitStatus,
        ...details
    })
)

export function getVisitStatusColor(status: VisitStatus): string {
    return getVisitStatusOption(status).color
}

export function getVisitStatusLabel(status: VisitStatus | string): string {
    const alias = STATUS_LABEL_ALIASES[status]
    if (alias) return alias
    return getVisitStatusOption(status as VisitStatus).label
}

function getVisitStatusOption(status: VisitStatus): Omit<VisitStatusOptionDto, 'value'> {
    return VISIT_STATUS_BY_VALUE[status] ?? FALLBACK_STATUS
}
