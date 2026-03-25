import type { Visit } from '../../types/index'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export interface DateRangeDto {
    end: Date
    start: Date
}

export function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * DAY_IN_MILLISECONDS)
}

export function createDateKey(year: number, month: number, day: number): string {
    return [
        year.toString().padStart(4, '0'),
        month.toString().padStart(2, '0'),
        day.toString().padStart(2, '0')
    ].join('-')
}

export function getDateKey(dateValue: string): string {
    return dateValue.slice(0, 10)
}

export function createDateOnly(dateValue: string): Date {
    const [year, month, day] = getDateKey(dateValue).split('-').map(Number)

    return new Date(year, month - 1, day)
}

export function createDateRange(startDate: Date, durationInDays: number): DateRangeDto {
    return {
        start: startDate,
        end: addDays(startDate, durationInDays)
    }
}

export function getTodayDateKey(): string {
    const now = new Date()

    return createDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function isCurrentOrFutureVisit(visit: Pick<Visit, 'visit_date'>): boolean {
    return getDateKey(visit.visit_date) >= getTodayDateKey()
}

export function isPastVisit(visit: Pick<Visit, 'visit_date'>): boolean {
    return getDateKey(visit.visit_date) < getTodayDateKey()
}

export function createVisitDateTime(visit: Pick<Visit, 'visit_date' | 'visit_time'>): number {
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

export function compareVisitsByDateTimeAsc(firstVisit: Visit, secondVisit: Visit): number {
    return createVisitDateTime(firstVisit) - createVisitDateTime(secondVisit)
}

export function compareVisitsByDateTimeDesc(firstVisit: Visit, secondVisit: Visit): number {
    return createVisitDateTime(secondVisit) - createVisitDateTime(firstVisit)
}
