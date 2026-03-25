import type { Visit } from '../../types/index'
import {
    addDays,
    createDateOnly,
    createDateRange,
    getDateKey,
    isCurrentOrFutureVisit,
    compareVisitsByDateTimeAsc,
    compareVisitsByDateTimeDesc
} from './visitDate.helpers'

export type FilterType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth'

export interface VisitListFilters {
    quickDateFilters: Set<FilterType>
    searchTerm: string
    startDate: string
    endDate: string
    statusFilters: Set<Visit['status']>
}

interface VisitFilterOptionDto<T> {
    label: string
    value: T
}

export const DATE_FILTER_OPTIONS: VisitFilterOptionDto<FilterType>[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'tomorrow', label: 'Manana' },
    { value: 'thisWeek', label: 'Esta semana' },
    { value: 'nextWeek', label: 'Proxima semana' },
    { value: 'thisMonth', label: 'Este mes' }
]

export const STATUS_FILTER_OPTIONS: VisitFilterOptionDto<Visit['status']>[] = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'approved', label: 'Aprobada' },
    { value: 'rejected', label: 'Rechazada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' }
]

export function createInitialVisitListFilters(): VisitListFilters {
    return {
        quickDateFilters: new Set<FilterType>(),
        searchTerm: '',
        startDate: '',
        endDate: '',
        statusFilters: new Set<Visit['status']>()
    }
}

export function filterVisits(visits: Visit[], filters: VisitListFilters): Visit[] {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase()
    const shouldSearchAcrossAllVisits = normalizedSearchTerm.length > 0 || hasCustomDateRange(filters)
    const searchableVisits = shouldSearchAcrossAllVisits
        ? [...visits]
        : visits.filter(isCurrentOrFutureVisit)

    const visitsBySearch = normalizedSearchTerm
        ? searchableVisits.filter((visit) => matchesSearchTerm(visit, normalizedSearchTerm))
        : searchableVisits

    const visitsByDate = filterVisitsByDate(visitsBySearch, filters)
    const visitsByStatus = filterVisitsByStatus(visitsByDate, filters.statusFilters)

    if (normalizedSearchTerm) {
        return [...visitsByStatus].sort(compareVisitsByDateTimeDesc)
    }

    return [...visitsByStatus].sort(compareVisitsByDateTimeAsc)
}

export function hasActiveVisitListFilters(filters: VisitListFilters): boolean {
    return (
        filters.quickDateFilters.size > 0 ||
        filters.statusFilters.size > 0 ||
        filters.searchTerm.length > 0 ||
        filters.startDate.length > 0 ||
        filters.endDate.length > 0
    )
}

export function getVisitListEmptyMessage(totalVisits: number, filters: VisitListFilters): string {
    if (totalVisits === 0) {
        return 'No tienes visitas registradas.'
    }

    if (hasActiveVisitListFilters(filters)) {
        return 'No hay visitas que coincidan con los filtros y busqueda seleccionados.'
    }

    return 'No hay visitas disponibles.'
}

export function toggleSetValue<T>(values: Set<T>, value: T): Set<T> {
    const nextValues = new Set(values)

    if (nextValues.has(value)) {
        nextValues.delete(value)
        return nextValues
    }

    nextValues.add(value)

    return nextValues
}

function filterVisitsByDate(visits: Visit[], filters: VisitListFilters): Visit[] {
    if (filters.startDate || filters.endDate) {
        return visits.filter((visit) =>
            matchesCustomDateRange(visit.visit_date, filters.startDate, filters.endDate)
        )
    }

    if (filters.quickDateFilters.size === 0) {
        return visits
    }

    return visits.filter((visit) =>
        matchesQuickDateFilters(visit.visit_date, filters.quickDateFilters)
    )
}

function filterVisitsByStatus(visits: Visit[], statusFilters: Set<Visit['status']>): Visit[] {
    if (statusFilters.size === 0) {
        return visits
    }

    return visits.filter((visit) => statusFilters.has(visit.status))
}

function matchesSearchTerm(visit: Visit, term: string): boolean {
    return (
        visit.visitor_name.toLowerCase().includes(term) ||
        containsText(visit.visit_purpose, term) ||
        containsText(visit.visitor_phone, term) ||
        visit.qr_token.toLowerCase().includes(term)
    )
}

function containsText(value: string | null, term: string): boolean {
    if (!value) {
        return false
    }

    return value.toLowerCase().includes(term)
}

function hasCustomDateRange(filters: VisitListFilters): boolean {
    return filters.startDate.length > 0 || filters.endDate.length > 0
}

function matchesCustomDateRange(
    visitDateValue: string,
    startDateValue: string,
    endDateValue: string
): boolean {
    const visitDate = getDateKey(visitDateValue)
    const startDate = startDateValue ? getDateKey(startDateValue) : null
    const endDate = endDateValue ? getDateKey(endDateValue) : null

    if (startDate && endDate) {
        return visitDate >= startDate && visitDate <= endDate
    }

    if (startDate) {
        return visitDate >= startDate
    }

    if (endDate) {
        return visitDate <= endDate
    }

    return true
}

function matchesQuickDateFilters(
    visitDateValue: string,
    quickDateFilters: Set<FilterType>
): boolean {
    const visitDate = createDateOnly(visitDateValue)

    for (const filter of quickDateFilters) {
        const dateRange = getDateRange(filter)

        if (visitDate >= dateRange.start && visitDate < dateRange.end) {
            return true
        }
    }

    return false
}

function getDateRange(filter: FilterType) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (filter) {
        case 'today':
            return createDateRange(today, 1)
        case 'tomorrow':
            return createDateRange(addDays(today, 1), 1)
        case 'thisWeek': {
            const monday = new Date(today)
            monday.setDate(today.getDate() - today.getDay() + 1)
            return createDateRange(monday, 7)
        }
        case 'nextWeek': {
            const nextMonday = new Date(today)
            nextMonday.setDate(today.getDate() - today.getDay() + 8)
            return createDateRange(nextMonday, 7)
        }
        case 'thisMonth': {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

            return {
                start: firstDay,
                end: firstDayOfNextMonth
            }
        }
    }
}
