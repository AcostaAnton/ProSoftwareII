import type { Visit } from '../types/index'

export type QrInvitationLines = {
    /** Primera línea, p. ej. «Gilberto Salguero, Noel Díaz te ha invitado a:» */
    primary: string
    /** Segunda línea (nombre de la comunidad), o null */
    secondary: string | null
}

export type QrDisplayLike = {
    residentName?: string | null
    communityName?: string | null
} | null

/**
 * Mismo texto que la tarjeta del QR: «Visitante, Residente te ha invitado a:» + comunidad.
 */
export function getQrInvitationLines(
    visit: Pick<Visit, 'visitor_name'>,
    qrDisplay?: QrDisplayLike,
): QrInvitationLines {
    const visitorName = visit.visitor_name?.trim() || 'Visitante'
    const residentName = qrDisplay?.residentName?.trim() || null
    const communityName = qrDisplay?.communityName?.trim() || null

    if (residentName && communityName) {
        return {
            primary: `${visitorName}, ${residentName} te ha invitado a:`,
            secondary: communityName,
        }
    }
    if (residentName && !communityName) {
        return {
            primary: `${visitorName}, ${residentName} te ha invitado a:`,
            secondary: null,
        }
    }
    if (communityName && !residentName) {
        return {
            primary: `Acceso de visita para ${visitorName}`,
            secondary: communityName,
        }
    }
    return {
        primary: `Invitación para ${visitorName}`,
        secondary: null,
    }
}
