import type {
    VisitDetailRecord,
    VisitQrDisplayData
} from '../../services/visits.service'
import { supabase } from '../../services/supabase'
import { formatDate, formatPhone, formatTime } from '../../utils/formatDate'
import { getQrInvitationLines } from '../../utils/qrInvitationMessage'
import {
    getVisitStatusColor,
    getVisitStatusLabel,
    VISIT_STATUS_OPTIONS
} from './visitStatus.helpers'

export interface VisitAccessLogDto {
    entryLabel: string
    entryNotes: string | null
    exitLabel: string | null
    exitNotes: string | null
    id: string
    vehicleNotes: string | null
    vehiclePhotoUrl: string | null
}

export interface VisitStatusHistoryDto {
    actorLabel: string | null
    changedAtLabel: string
    id: string
    newStatusColor: string
    newStatusLabel: string
    notes: string | null
    oldStatusLabel: string
}

export interface VisitDetailDto {
    accessLogs: VisitAccessLogDto[]
    createdAtLabel: string
    invitationPrimary: string
    invitationSecondary: string | null
    qrToken: string
    statusColor: string
    statusHistory: VisitStatusHistoryDto[]
    statusLabel: string
    visitDateLabel: string
    visitId: string
    visitPurpose: string
    visitTimeLabel: string
    visitorName: string
    visitorPhone: string
}

export function createVisitDetailDto(
    visit: VisitDetailRecord,
    qrDisplay: VisitQrDisplayData | null
): VisitDetailDto {
    const invitation = getQrInvitationLines(visit, qrDisplay)

    return {
        accessLogs: (visit.access_logs ?? []).map((accessLog, index) => ({
            entryLabel: formatTimestamp(accessLog.entry_time),
            entryNotes: accessLog.entry_notes ?? null,
            exitLabel: accessLog.exit_time ? formatTimestamp(accessLog.exit_time) : null,
            exitNotes: accessLog.exit_notes ?? null,
            id: accessLog.id ?? `access-log-${index}`,
            vehicleNotes: accessLog.vehicle_notes ?? null,
            vehiclePhotoUrl: getVisitPhotoUrl(accessLog.vehicle_photo_url),
        })),
        createdAtLabel: formatDate(visit.created_at),
        invitationPrimary: invitation.primary,
        invitationSecondary: invitation.secondary ?? null,
        qrToken: visit.qr_token,
        statusHistory: (visit.visit_status_history ?? []).map((historyEntry, index) => ({
            actorLabel: createActorLabel(historyEntry.profiles?.name, historyEntry.profiles?.role),
            changedAtLabel: formatTimestamp(historyEntry.changed_at),
            id: historyEntry.id ?? `visit-history-${index}`,
            newStatusColor: getVisitStatusColor(historyEntry.new_status),
            newStatusLabel: getVisitStatusLabel(historyEntry.new_status),
            notes: historyEntry.notes ?? null,
            oldStatusLabel: getHistoricalStatusLabel(historyEntry.old_status)
        })),
        statusColor: getVisitStatusColor(visit.status),
        statusLabel: getVisitStatusLabel(visit.status),
        visitDateLabel: formatDate(visit.visit_date),
        visitId: visit.id,
        visitPurpose: visit.visit_purpose || 'No especificado',
        visitTimeLabel: formatTime(visit.visit_time) || 'No especificada',
        visitorName: visit.visitor_name,
        visitorPhone: formatPhone(visit.visitor_phone) || 'No proporcionado'
    }
}

function createActorLabel(name?: string | null, role?: string | null): string | null {
    if (!name) {
        return null
    }

    if (!role) {
        return name
    }

    return `${name} (${role})`
}

function formatTimestamp(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    const dateLabel = date.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const timeLabel = date.toLocaleTimeString('es-HN', {
        hour: 'numeric',
        hour12: true,
        minute: '2-digit'
    })

    return `${dateLabel} ${timeLabel}`
}

function getHistoricalStatusLabel(status: string): string {
    const statusOption = VISIT_STATUS_OPTIONS.find((option) => option.value === status)

    if (!statusOption) {
        return status
    }

    return statusOption.label
}

function getVisitPhotoUrl(path?: string | null): string | null {
    if (!path) {
        return null
    }

    if (path.startsWith('http')) {
        return path
    }

    const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)

    return data.publicUrl
}
