import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { toPng } from 'html-to-image'
import type { Visit } from '../../types/index'
import { Button } from '../ui/Button'
import { getVisitorAccessUrl } from '../../utils/visitorAccessUrl'
import { formatQrCreatedAt } from '../../utils/formatDate'
import { getQrInvitationLines } from '../../utils/qrInvitationMessage'

const QR_IMG_SIZE = 280

const QR_IMG_SIZE_MODAL = 200


const APP = {
    bgCard: 'var(--surface)',
    bgDeep: 'var(--bg)',
    bgMuted: 'var(--surface2)',
    border: 'var(--border-bright)',
    borderLight: 'var(--border-bright)',
    accent: 'var(--accent-cyan)',
    text: 'var(--text)',
    textBright: 'var(--text)',
    textMuted: 'var(--muted)',
    qrLight: '#ffffff',
} as const


export type QrDisplayContext = {
    residentName?: string | null
    communityName?: string | null
    unitNumber?: string | null
}

const VISITOR_RULES: { icon: string; text: string }[] = [
    { icon: '🪪', text: 'Presente QR e identidad' },
    { icon: '🏍️', text: 'Quítate el casco' },
    { icon: '🚗', text: 'Baja vidrios y abre el baúl' },
    { icon: '⛔', text: 'Respeta las señales' },
    { icon: '🏁', text: 'Velocidad máx. 20 km/h' },
]

function formatUnitBannerText(unitNumber?: string | null): string | null {
    const u = unitNumber?.trim()
    if (u) return `Unidad: ${u}`
    return null
}

type InvitationCardMetrics = {
    accentBarHeight: number
    headlinePadding: string
    qrSectionPadding: string
    qrFramePadding: number
    qrImgMax: number
    cardBorderRadius: number
    cardMaxWidth: number
    createdPadding: string
    createdFontSize: number
    unitBannerMargin: string
    unitBannerPadding: string
    unitBannerFontSize: number
    rulesFooterPadding: string
    rulesTitleMargin: string
    rulesTitleFontSize: number
    rulesTitleLetterSpacing: number
    rulesGridGap: number
    ruleIconSize: number
    ruleIconMarginBottom: string
    ruleIconFontSize: number
    ruleLabelFontSize: number
}

const INVITATION_CARD_METRICS_REGULAR: InvitationCardMetrics = {
    accentBarHeight: 4,
    headlinePadding: '18px 18px 8px',
    qrSectionPadding: '8px 16px 16px',
    qrFramePadding: 8,
    qrImgMax: QR_IMG_SIZE,
    cardBorderRadius: 12,
    cardMaxWidth: 400,
    createdPadding: '0 18px 16px',
    createdFontSize: 14,
    unitBannerMargin: '0 14px 16px',
    unitBannerPadding: '12px 14px',
    unitBannerFontSize: 13,
    rulesFooterPadding: '14px 10px 18px',
    rulesTitleMargin: '0 0 12px',
    rulesTitleFontSize: 12,
    rulesTitleLetterSpacing: 1,
    rulesGridGap: 8,
    ruleIconSize: 40,
    ruleIconMarginBottom: '0 auto 6px',
    ruleIconFontSize: 20,
    ruleLabelFontSize: 9,
}

const INVITATION_CARD_METRICS_COMPACT: InvitationCardMetrics = {
    accentBarHeight: 3,
    headlinePadding: '10px 12px 6px',
    qrSectionPadding: '6px 10px 10px',
    qrFramePadding: 6,
    qrImgMax: QR_IMG_SIZE_MODAL,
    cardBorderRadius: 10,
    cardMaxWidth: 340,
    createdPadding: '0 12px 10px',
    createdFontSize: 12,
    unitBannerMargin: '0 10px 10px',
    unitBannerPadding: '8px 10px',
    unitBannerFontSize: 11,
    rulesFooterPadding: '8px 6px 10px',
    rulesTitleMargin: '0 0 6px',
    rulesTitleFontSize: 10,
    rulesTitleLetterSpacing: 0.5,
    rulesGridGap: 4,
    ruleIconSize: 30,
    ruleIconMarginBottom: '0 auto 4px',
    ruleIconFontSize: 15,
    ruleLabelFontSize: 7.5,
}

function getInvitationCardMetrics(compact: boolean): InvitationCardMetrics {
    return compact ? INVITATION_CARD_METRICS_COMPACT : INVITATION_CARD_METRICS_REGULAR
}

function InvitationCardAccentBar({ height }: { height: number }) {
    return <div style={{ height, background: APP.accent }} />
}

function InvitationQrSection({
    qrCode,
    metrics: m,
}: {
    qrCode: string
    metrics: InvitationCardMetrics
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                padding: m.qrSectionPadding,
            }}
        >
            <div
                style={{
                    border: `2px solid ${APP.borderLight}`,
                    borderRadius: 4,
                    padding: m.qrFramePadding,
                    background: APP.qrLight,
                    lineHeight: 0,
                }}
            >
                <img
                    src={qrCode}
                    alt="Código QR de acceso"
                    style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: m.qrImgMax,
                        height: 'auto',
                    }}
                />
            </div>
        </div>
    )
}

function InvitationCreatedTimestamp({
    createdAtLabel,
    metrics: m,
}: {
    createdAtLabel: string
    metrics: InvitationCardMetrics
}) {
    return (
        <div
            style={{
                padding: m.createdPadding,
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
        >
            <p style={{ margin: 0, fontSize: m.createdFontSize, color: APP.textMuted }}>
                Se creó:{' '}
                <strong style={{ color: APP.textBright }}>{createdAtLabel}</strong>
            </p>
        </div>
    )
}

function InvitationUnitBanner({
    text,
    metrics: m,
}: {
    text: string
    metrics: InvitationCardMetrics
}) {
    return (
        <div
            style={{
                margin: m.unitBannerMargin,
                padding: m.unitBannerPadding,
                borderRadius: 8,
                background: APP.bgMuted,
                border: `1px solid ${APP.borderLight}`,
                color: APP.text,
                fontSize: m.unitBannerFontSize,
                fontWeight: 600,
                lineHeight: 1.4,
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
        >
            {text}
        </div>
    )
}

function InvitationVisitorRulesFooter({ metrics: m }: { metrics: InvitationCardMetrics }) {
    return (
        <div
            style={{
                background: APP.bgDeep,
                borderTop: `1px solid ${APP.border}`,
                padding: m.rulesFooterPadding,
                color: APP.text,
            }}
        >
            <p
                style={{
                    margin: m.rulesTitleMargin,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: m.rulesTitleFontSize,
                    letterSpacing: m.rulesTitleLetterSpacing,
                    textTransform: 'uppercase',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    color: APP.accent,
                }}
            >
                Reglas de visitante
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: m.rulesGridGap,
                    alignItems: 'start',
                    width: '100%',
                }}
            >
                {VISITOR_RULES.map((rule) => (
                    <div
                        key={rule.text}
                        style={{
                            textAlign: 'center',
                            minWidth: 0,
                        }}
                    >
                        <div
                            style={{
                                width: m.ruleIconSize,
                                height: m.ruleIconSize,
                                margin: m.ruleIconMarginBottom,
                                borderRadius: '50%',
                                background: APP.bgMuted,
                                border: `1px solid ${APP.borderLight}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: m.ruleIconFontSize,
                            }}
                        >
                            {rule.icon}
                        </div>
                        <span
                            style={{
                                fontSize: m.ruleLabelFontSize,
                                lineHeight: 1.25,
                                display: 'block',
                                fontWeight: 600,
                                color: APP.textMuted,
                            }}
                        >
                            {rule.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function InviteHeadline({
    visit,
    qrDisplay,
    compact,
}: {
    visit: Pick<Visit, 'visitor_name'>
    qrDisplay?: QrDisplayContext
    compact?: boolean
}) {
    const base: React.CSSProperties = {
        color: APP.text,
        fontWeight: 700,
        fontSize: compact ? 13 : 15,
        margin: 0,
        lineHeight: 1.45,
        fontFamily: "'DM Sans', system-ui, sans-serif",
    }
    const communityStyle: React.CSSProperties = {
        color: APP.accent,
        fontWeight: 800,
        fontSize: compact ? 14 : 17,
        margin: compact ? '6px 0 0' : '10px 0 0',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        fontFamily: "'DM Sans', system-ui, sans-serif",
    }

    const { primary, secondary } = getQrInvitationLines(visit, qrDisplay ?? null)

    
    const visitorName = visit.visitor_name?.trim() || 'Visitante'
    const primaryWithEmphasis =
        primary.startsWith(`${visitorName},`) ? (
            <>
                <span style={{ fontWeight: 800 }}>{visitorName}</span>
                {primary.slice(visitorName.length)}
            </>
        ) : primary.startsWith('Acceso de visita para ') ? (
            <>
                Acceso de visita para{' '}
                <span style={{ fontWeight: 800 }}>{visit.visitor_name?.trim() || 'Visitante'}</span>
            </>
        ) : primary.startsWith('Invitación para ') ? (
            <>
                Invitación para{' '}
                <span style={{ fontWeight: 800 }}>{visit.visitor_name?.trim() || 'Visitante'}</span>
            </>
        ) : (
            primary
        )

    return (
        <>
            <p style={base}>{primaryWithEmphasis}</p>
            {secondary ? <p style={communityStyle}>{secondary}</p> : null}
        </>
    )
}

type VisitInvitationCardProps = {
    visit: Visit
    qrCode: string
    qrDisplay?: QrDisplayContext
    compact?: boolean
}

function VisitInvitationCard({
    visit,
    qrCode,
    qrDisplay,
    compact = false,
}: VisitInvitationCardProps) {
    const m = getInvitationCardMetrics(compact)
    const createdAtLabel = formatQrCreatedAt(visit.created_at)
    const unitInfoText = formatUnitBannerText(qrDisplay?.unitNumber)

    return (
        <div
            id="visit-card-container"
            style={{
                background: APP.bgCard,
                border: `1px solid ${APP.border}`,
                borderRadius: m.cardBorderRadius,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                maxWidth: m.cardMaxWidth,
                margin: '0 auto',
                width: '100%',
            }}
        >
            <InvitationCardAccentBar height={m.accentBarHeight} />

            <div style={{ padding: m.headlinePadding }}>
                <InviteHeadline visit={visit} qrDisplay={qrDisplay} compact={compact} />
            </div>

            <InvitationQrSection qrCode={qrCode} metrics={m} />

            <InvitationCreatedTimestamp createdAtLabel={createdAtLabel} metrics={m} />

            {unitInfoText ? <InvitationUnitBanner text={unitInfoText} metrics={m} /> : null}

            <InvitationVisitorRulesFooter metrics={m} />
        </div>
    )
}


function buildShareText(visit: Visit) {
    const name = visit.visitor_name?.trim()
    const link = getVisitorAccessUrl(visit.qr_token)
    return [
        'Acceso de visita',
        name ? `Visitante: ${name}` : '',
        `Código: ${visit.qr_token}`,
        'Ver QR en el navegador (tocar el enlace si aparece en azul):',
        link,
        'Muestra el QR en portería o indica el código.',
    ]
        .filter(Boolean)
        .join('\n')
}


function buildWhatsAppShortText(visit: Visit) {
    const name = visit.visitor_name?.trim()
    const link = getVisitorAccessUrl(visit.qr_token)
    const head = [
        'Acceso de visita',
        name ? `Visitante: ${name}` : '',
        `Código: ${visit.qr_token}`,
    ]
        .filter(Boolean)
        .join('\n')
    return `${head}\n\nVer tu QR en el navegador:\n${link}`
}

const DESKTOP_WHATSAPP_HINT =
    'WhatsApp a veces no marca en azul las URLs a esta máquina (127.0.0.1). Usa «Copiar enlace» abajo y pégalo en el chat, o publica la app con HTTPS (VITE_PUBLIC_APP_URL). También: menú Compartir → WhatsApp (solo enlace).'

function openWhatsAppWeb(text: string) {
    const u = new URL('https://wa.me/')
    u.searchParams.set('text', text)
    window.open(u.toString(), '_blank', 'noopener,noreferrer')
}


async function shareQrImageWithOptionalText(
    file: File,
    text: string,
): Promise<boolean> {
    if (!navigator.share) return false

    const attempts: ShareData[] = [
        { files: [file] },
        { files: [file], title: 'Acceso de visita' },
        { files: [file], text },
        { files: [file], text, title: 'Acceso de visita' },
    ]

    for (const data of attempts) {
        try {
            if (!navigator.canShare?.(data)) continue
            await navigator.share(data)
            return true
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') throw e
        }
    }
    return false
}

function DesktopShareHintBanner({ text, onDismiss }: { text: string | null; onDismiss: () => void }) {
    if (!text) return null
    return (
        <div
            style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                background: 'rgba(0, 229, 200, 0.1)',
                border: '1px solid rgba(0, 229, 200, 0.35)',
                color: 'var(--text)',
                fontSize: 13,
                lineHeight: 1.55,
                textAlign: 'left',
            }}
        >
            <p style={{ margin: '0 0 10px 0' }}>{text}</p>
            <button
                type="button"
                onClick={onDismiss}
                style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-bright)',
                    background: 'var(--surface2)',
                    color: 'var(--muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                }}
            >
                Cerrar aviso
            </button>
        </div>
    )
}

type ShareDropdownProps = {
    visit: Visit
    buttonStyle?: React.CSSProperties
    
    onDesktopWhatsAppHint?: (message: string) => void
}

function ShareDropdown({ visit, buttonStyle, onDesktopWhatsAppHint }: ShareDropdownProps) {
    const text = buildShareText(visit)

    const onWhatsApp = async () => {
        try {
            const el = document.getElementById('visit-card-container')
            if (!el) return
            
            const reqWidth = el.offsetWidth
            const reqHeight = el.offsetHeight

            const dataUrl = await toPng(el, { 
                cacheBust: true, 
                pixelRatio: 2,
                width: reqWidth,
                height: reqHeight,
                style: { margin: '0', transform: 'none' }
            })
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            const file = new File([blob], `visita-${visit.qr_token.slice(0, 8)}.png`, { type: 'image/png' })

            if (file && (await shareQrImageWithOptionalText(file, text))) {
                return
            }
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
                return
            }
        }
        onDesktopWhatsAppHint?.(DESKTOP_WHATSAPP_HINT)
        openWhatsAppWeb(buildWhatsAppShortText(visit))
    }

    return (
        <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onWhatsApp}
            style={{ ...buttonStyle, display: 'flex', gap: '6px', alignItems: 'center' }}
        >
            Compartir
        </Button>
    )
}

interface QRGeneratorProps {
    visit: Visit
    onCreateAnother?: () => void
    onClose?: () => void
    mode?: 'fullscreen' | 'modal'
    
    qrDisplay?: QrDisplayContext
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ 
    visit, 
    onCreateAnother, 
    onClose,
    mode = 'fullscreen',
    qrDisplay,
}) => {
    const [qrCode, setQrCode] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy')
    const [desktopShareHint, setDesktopShareHint] = useState<string | null>(null)

    useEffect(() => {
        if (!desktopShareHint) return
        const id = window.setTimeout(() => setDesktopShareHint(null), 32000)
        return () => window.clearTimeout(id)
    }, [desktopShareHint])

    const copyTokenToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(visit.qr_token)
            setCopyStatus('copied')
            setTimeout(() => setCopyStatus('copy'), 2000)
        } catch (err) {
            console.error('Error copying token:', err)
        }
    }

    useEffect(() => {
        const generateQR = async () => {
            try {
                const qrData = visit.qr_token
                const width = mode === 'modal' ? QR_IMG_SIZE_MODAL : QR_IMG_SIZE
                const qrCodeDataURL = await QRCode.toDataURL(qrData, {
                    width,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' },
                })
                setQrCode(qrCodeDataURL)
            } catch (err) {
                console.error('Error generating QR:', err)
            } finally {
                setIsLoading(false)
            }
        }

        generateQR()
    }, [visit.qr_token, mode])

    const downloadQR = async () => {
        try {
            const el = document.getElementById('visit-card-container')
            if (!el) return

            const reqWidth = el.offsetWidth
            const reqHeight = el.offsetHeight

            const dataUrl = await toPng(el, { 
                cacheBust: true, 
                pixelRatio: 2,
                width: reqWidth,
                height: reqHeight,
                style: { margin: '0', transform: 'none' }
            })
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `visita-${visit.qr_token.slice(0, 8)}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Error downloading QR:', err)
        }
    }

    if (isLoading) {
        return (
            <div style={{ 
                backgroundColor: mode === 'modal' ? 'transparent' : 'var(--bg)', 
                minHeight: mode === 'modal' ? 'auto' : '100vh', 
                padding: '20px', 
                color: 'var(--text)' 
            }}>
                <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                    <p>Generando código QR...</p>
                </div>
            </div>
        )
    }

    if (mode === 'modal') {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '12px',
                    paddingTop: 'max(12px, env(safe-area-inset-top))',
                    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        backgroundColor: 'var(--surface2)',
                        border: '1px solid var(--border-bright)',
                        padding: '14px',
                        borderRadius: '12px',
                        maxWidth: 'min(440px, 100%)',
                        width: '100%',
                        margin: '16px auto',
                        textAlign: 'center',
                        color: 'var(--text)',
                    }}
                >
                    <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--muted)' }}>
                        Código QR de la visita
                    </h2>

                    <div style={{ marginBottom: '14px' }}>
                        <VisitInvitationCard
                            visit={visit}
                            qrCode={qrCode}
                            qrDisplay={qrDisplay}
                            compact
                        />
                    </div>

                    <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: 11, color: 'var(--muted)' }}>
                            Token (para copiar / validar):
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            flexWrap: 'wrap'
                        }}>
                            <code style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text)',
                                fontSize: 12,
                                wordBreak: 'break-all',
                                maxWidth: '100%',
                                flex: '1 1 180px',
                            }}>
                                {visit.qr_token}
                            </code>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={copyTokenToClipboard}
                                style={{ borderRadius: 8, color: '#08130f', whiteSpace: 'nowrap' }}
                            >
                                {copyStatus === 'copied' ? 'Copiado' : 'Copiar'}
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ color: '#08130f', fontSize: 14 }}>
                            Descargar
                        </Button>
                        <ShareDropdown
                            visit={visit}
                            buttonStyle={{ fontSize: 14 }}
                            onDesktopWhatsAppHint={setDesktopShareHint}
                        />
                        <Button type="button" variant="secondary" size="md" onClick={onClose} style={{ fontSize: 14 }}>
                            Cerrar
                        </Button>
                    </div>
                    <DesktopShareHintBanner text={desktopShareHint} onDismiss={() => setDesktopShareHint(null)} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '20px 16px', color: 'var(--text)' }}>
            <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--accent-cyan)' }}>
                    ¡Visita creada!
                </h2>
                <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: 14 }}>
                    Comparte el código o la invitación con tu visitante.
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <VisitInvitationCard visit={visit} qrCode={qrCode} qrDisplay={qrDisplay} />
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: 12, color: 'var(--muted)' }}>
                        Token (para copiar / validar):
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        flexWrap: 'wrap'
                    }}>
                        <code style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text)',
                            fontSize: 13,
                            wordBreak: 'break-all',
                            maxWidth: '240px'
                        }}>
                            {visit.qr_token}
                        </code>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={copyTokenToClipboard}
                            style={{ borderRadius: 8, color: '#08130f', whiteSpace: 'nowrap' }}
                        >
                            {copyStatus === 'copied' ? 'Copiado' : 'Copiar'}
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ borderRadius: 20, color: '#08130f', fontSize: 14 }}>
                        Descargar QR
                    </Button>
                    <ShareDropdown
                        visit={visit}
                        buttonStyle={{ borderRadius: 20, fontSize: 14 }}
                        onDesktopWhatsAppHint={setDesktopShareHint}
                    />
                    <Button type="button" variant="secondary" size="md" onClick={onCreateAnother} style={{ borderRadius: 20, fontSize: 14 }}>
                        Volver
                    </Button>
                </div>
                <DesktopShareHintBanner text={desktopShareHint} onDismiss={() => setDesktopShareHint(null)} />
            </div>
        </div>
    )
}

export default QRGenerator

