import type { Visit } from '../../types/index'

export type FilterType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth'

export interface VisitListFilters {
    quickDateFilters: Set<FilterType>
    searchTerm: string
    startDate: string
    endDate: string
    statusFilters: Set<Visit['status']>
}

interface DateFilterOption {
    label: string
    value: FilterType
}

interface StatusFilterOption {
    label: string
    value: Visit['status']
}

export const DATE_FILTER_OPTIONS: DateFilterOption[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'tomorrow', label: 'Manana' },
    { value: 'thisWeek', label: 'Esta semana' },
    { value: 'nextWeek', label: 'Proxima semana' },
    { value: 'thisMonth', label: 'Este mes' }
]

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
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
    let filteredVisits = hasCustomDateRange(filters)
        ? [...visits]
        : visits.filter(isCurrentOrFutureVisit)

    if (filters.searchTerm) {
        const normalizedTerm = filters.searchTerm.toLowerCase()

        filteredVisits = filteredVisits.filter((visit) => matchesSearchTerm(visit, normalizedTerm))
    }

    if (filters.startDate || filters.endDate) {
        filteredVisits = filteredVisits.filter((visit) =>
            matchesCustomDateRange(visit.visit_date, filters.startDate, filters.endDate)
        )
    } else if (filters.quickDateFilters.size > 0) {
        filteredVisits = filteredVisits.filter((visit) =>
            matchesQuickDateFilters(visit.visit_date, filters.quickDateFilters)
        )
    }

    if (filters.statusFilters.size > 0) {
        filteredVisits = filteredVisits.filter((visit) => filters.statusFilters.has(visit.status))
    }

    return sortVisitsByDateTimeAsc(filteredVisits)
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
    } else {
        nextValues.add(value)
    }

    return nextValues
}

function matchesSearchTerm(visit: Visit, term: string): boolean {
    return (
        visit.visitor_name.toLowerCase().includes(term) ||
        containsText(visit.visit_purpose, term) ||
        containsText(visit.visitor_phone, term) ||
        containsText(visit.visit_destination, term) ||
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

function matchesCustomDateRange(visitDateValue: string, startDateValue: string, endDateValue: string): boolean {
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

function matchesQuickDateFilters(visitDateValue: string, quickDateFilters: Set<FilterType>): boolean {
    const visitDate = createDateOnly(visitDateValue)

    for (const filter of quickDateFilters) {
        const dateRange = getDateRange(filter)

        if (visitDate >= dateRange.start && visitDate < dateRange.end) {
            return true
        }
    }

    return false
}

function getDateRange(filter: FilterType): { end: Date; start: Date } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (filter) {
        case 'today':
            return createRange(today, 1)
        case 'tomorrow': {
            const tomorrow = addDays(today, 1)
            return createRange(tomorrow, 1)
        }
        case 'thisWeek': {
            const monday = new Date(today)
            monday.setDate(today.getDate() - today.getDay() + 1)
            return createRange(monday, 7)
        }
        case 'nextWeek': {
            const nextMonday = new Date(today)
            nextMonday.setDate(today.getDate() - today.getDay() + 8)
            return createRange(nextMonday, 7)
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

function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function createRange(startDate: Date, durationInDays: number) {
    return {
        start: startDate,
        end: addDays(startDate, durationInDays)
    }
}

function isCurrentOrFutureVisit(visit: Visit): boolean {
    return getDateKey(visit.visit_date) >= getTodayDateKey()
}

function sortVisitsByDateTimeAsc(visits: Visit[]): Visit[] {
    return [...visits].sort(compareVisitsByDateTimeAsc)
}

function compareVisitsByDateTimeAsc(firstVisit: Visit, secondVisit: Visit): number {
    const firstTimestamp = createVisitDateTime(firstVisit)
    const secondTimestamp = createVisitDateTime(secondVisit)

    return firstTimestamp - secondTimestamp
}

function createVisitDateTime(visit: Visit): number {
    const visitDate = createDateOnly(visit.visit_date)
    const visitTime = visit.visit_time ?? '23:59'
    const [hours, minutes] = visitTime.split(':').map(Number)

    return new Date(
        visitDate.getFullYear(),
        visitDate.getMonth(),
        visitDate.getDate(),
        hours,
        minutes
    ).getTime()
}

function createDateOnly(dateValue: string): Date {
    const [year, month, day] = getDateKey(dateValue).split('-').map(Number)

    return new Date(year, month - 1, day)
}

function getTodayDateKey(): string {
    const now = new Date()

    return createDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

function getDateKey(dateValue: string): string {
    return dateValue.slice(0, 10)
}

function createDateKey(year: number, month: number, day: number): string {
    return [
        year.toString().padStart(4, '0'),
        month.toString().padStart(2, '0'),
        day.toString().padStart(2, '0')
    ].join('-')
}
