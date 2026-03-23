import type { Visit } from '../../types/index'

interface VisitStatusOption {
    color: string
    label: string
    value: Visit['status']
}

export const VISIT_STATUS_OPTIONS: VisitStatusOption[] = [
    { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
    { value: 'approved', label: 'Aprobado', color: '#22c55e' },
    { value: 'rejected', label: 'Rechazado', color: '#ef4444' },
    { value: 'completed', label: 'Completado', color: '#06b6d4' },
    { value: 'cancelled', label: 'Cancelado', color: '#6b7280' }
]

export function getVisitStatusColor(status: Visit['status']): string {
    const statusOption = findVisitStatusOption(status)

    if (!statusOption) {
        return '#6b7280'
    }

    return statusOption.color
}

export function getVisitStatusLabel(status: Visit['status']): string {
    const statusOption = findVisitStatusOption(status)

    if (!statusOption) {
        return status
    }

    return statusOption.label
}

function findVisitStatusOption(status: Visit['status']) {
    for (const statusOption of VISIT_STATUS_OPTIONS) {
        if (statusOption.value === status) {
            return statusOption
        }
    }

    return null
}
