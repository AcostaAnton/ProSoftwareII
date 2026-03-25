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
    approved: { color: '#22c55e', label: 'Aprobado' },
    rejected: { color: '#ef4444', label: 'Rechazado' },
    completed: { color: '#06b6d4', label: 'Completado' },
    cancelled: { color: '#6b7280', label: 'Cancelado' }
} satisfies Record<VisitStatus, Omit<VisitStatusOptionDto, 'value'>>

export const VISIT_STATUS_OPTIONS: VisitStatusOptionDto[] = Object.entries(VISIT_STATUS_BY_VALUE).map(
    ([value, details]) => ({
        value: value as VisitStatus,
        ...details
    })
)

export function getVisitStatusColor(status: VisitStatus): string {
    return getVisitStatusOption(status).color
}

export function getVisitStatusLabel(status: VisitStatus): string {
    return getVisitStatusOption(status).label
}

function getVisitStatusOption(status: VisitStatus): Omit<VisitStatusOptionDto, 'value'> {
    return VISIT_STATUS_BY_VALUE[status] ?? FALLBACK_STATUS
}
