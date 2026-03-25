import type { Visit } from '../../types/index'
import { formatDate, formatPhone, formatTime } from '../../utils/formatDate'
import {
    getVisitStatusColor,
    getVisitStatusLabel
} from './visitStatus.helpers'

export interface VisitCardDto {
    id: string
    qrTokenPreview: string
    statusColor: string
    statusLabel: string
    visitDateLabel: string
    visitPurpose: string | null
    visitTimeLabel: string | null
    visitorName: string
    visitorPhone: string | null
}

export function createVisitCardDto(visit: Visit): VisitCardDto {
    return {
        id: visit.id,
        qrTokenPreview: visit.qr_token.slice(0, 8).toUpperCase(),
        statusColor: getVisitStatusColor(visit.status),
        statusLabel: getVisitStatusLabel(visit.status),
        visitDateLabel: formatDate(visit.visit_date),
        visitPurpose: visit.visit_purpose,
        visitTimeLabel: visit.visit_time ? formatTime(visit.visit_time) : null,
        visitorName: visit.visitor_name,
        visitorPhone: visit.visitor_phone ? formatPhone(visit.visitor_phone) : null
    }
}

export function createVisitCardDtos(visits: Visit[]): VisitCardDto[] {
    return visits.map(createVisitCardDto)
}
