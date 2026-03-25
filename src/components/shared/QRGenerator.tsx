import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import type { Visit } from '../../types/index'
import { Button } from '../ui/Button'
import { getVisitorAccessUrl } from '../../utils/visitorAccessUrl'
import { formatQrCreatedAt } from '../../utils/formatDate'
import { getQrInvitationLines } from '../../utils/qrInvitationMessage'

const QR_IMG_SIZE = 280
/** Tamaño generado cuando el QR va en modal (móvil); se ve completo sin ocupar toda la pantalla. */
const QR_IMG_SIZE_MODAL = 200

/** Paleta alineada con el resto de la app (dashboard, formularios). */
const APP = {
    bgCard: '#0f172a',
    bgDeep: '#020617',
    bgMuted: '#1e293b',
    border: '#1e293b',
    borderLight: '#334155',
    accent: '#22d3ee',
    text: '#e2e8f0',
    textBright: '#ffffff',
    textMuted: '#94a3b8',
    qrLight: '#ffffff',
} as const

/** Datos opcionales para el encabezado tipo invitación (residente / comunidad / unidad). */
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

function greyBarText(unitNumber?: string | null): string | null {
    const u = unitNumber?.trim()
    if (u) return `Unidad: ${u}`
    return null
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

    /** Destaca «Residente» al inicio cuando el mensaje sigue el formato «X, Y te ha invitado a:» */
    const residentName = qrDisplay?.residentName?.trim()
    const primaryWithEmphasis =
        residentName && primary.startsWith(`${residentName},`) ? (
            <>
                <span style={{ fontWeight: 800 }}>{residentName}</span>
                {primary.slice(residentName.length)}
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

function VisitInvitationCard({
    visit,
    qrCode,
    qrDisplay,
    compact = false,
}: {
    visit: Visit
    qrCode: string
    qrDisplay?: QrDisplayContext
    /** Modal móvil: menos padding, QR y reglas más pequeños. */
    compact?: boolean
}) {
    const created = formatQrCreatedAt(visit.created_at)
    const grey = greyBarText(qrDisplay?.unitNumber)
    const qrMax = compact ? QR_IMG_SIZE_MODAL : QR_IMG_SIZE

    return (
        <div
            style={{
                background: APP.bgCard,
                border: `1px solid ${APP.border}`,
                borderRadius: compact ? 10 : 12,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                maxWidth: compact ? 340 : 400,
                margin: '0 auto',
                width: '100%',
            }}
        >
            <div style={{ height: compact ? 3 : 4, background: APP.accent }} />

            <div style={{ padding: compact ? '10px 12px 6px' : '18px 18px 8px' }}>
                <InviteHeadline visit={visit} qrDisplay={qrDisplay} compact={compact} />
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: compact ? '6px 10px 10px' : '8px 16px 16px',
                }}
            >
                <div
                    style={{
                        border: `2px solid ${APP.borderLight}`,
                        borderRadius: 4,
                        padding: compact ? 6 : 8,
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
                            maxWidth: qrMax,
                            height: 'auto',
                        }}
                    />
                </div>
            </div>

            <div
                style={{
                    padding: compact ? '0 12px 10px' : '0 18px 16px',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
            >
                <p style={{ margin: 0, fontSize: compact ? 12 : 14, color: APP.textMuted }}>
                    Se creó:{' '}
                    <strong style={{ color: APP.textBright }}>{created}</strong>
                </p>
            </div>

            {grey ? (
                <div
                    style={{
                        margin: compact ? '0 10px 10px' : '0 14px 16px',
                        padding: compact ? '8px 10px' : '12px 14px',
                        borderRadius: 8,
                        background: APP.bgMuted,
                        border: `1px solid ${APP.borderLight}`,
                        color: APP.text,
                        fontSize: compact ? 11 : 13,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}
                >
                    {grey}
                </div>
            ) : null}

            <div
                style={{
                    background: APP.bgDeep,
                    borderTop: `1px solid ${APP.border}`,
                    padding: compact ? '8px 6px 10px' : '14px 10px 18px',
                    color: APP.text,
                }}
            >
                <p
                    style={{
                        margin: compact ? '0 0 6px' : '0 0 12px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: compact ? 10 : 12,
                        letterSpacing: compact ? 0.5 : 1,
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
                        gap: compact ? 4 : 8,
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
                                    width: compact ? 30 : 40,
                                    height: compact ? 30 : 40,
                                    margin: compact ? '0 auto 4px' : '0 auto 6px',
                                    borderRadius: '50%',
                                    background: APP.bgMuted,
                                    border: `1px solid ${APP.borderLight}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: compact ? 15 : 20,
                                }}
                            >
                                {rule.icon}
                            </div>
                            <span
                                style={{
                                    fontSize: compact ? 7.5 : 9,
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
        </div>
    )
}

/** Texto para compartir (sin emojis: en wa.me a veces se ven mal). */
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

/**
 * Mensaje para wa.me: la URL en líneas propias ayuda a que WhatsApp la detecte.
 * Nota: muchas versiones NO convierten en enlace 127.0.0.1/localhost; con HTTPS público sí.
 */
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

async function dataUrlToQrFile(qrCode: string, visit: Visit): Promise<File | null> {
    if (!qrCode) return null
    try {
        const res = await fetch(qrCode)
        const blob = await res.blob()
        const type = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/png'
        return new File([blob], `qr-visita-${visit.qr_token.slice(0, 8)}.png`, { type })
    } catch {
        return null
    }
}

/**
 * Intenta compartir el PNG. En muchos Android, si va primero `text` con `files`, WhatsApp solo envía texto.
 */
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
                background: 'rgba(34,211,238,.1)',
                border: '1px solid rgba(34,211,238,.35)',
                color: '#e2e8f0',
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
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#94a3b8',
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
    qrCode: string
    buttonStyle?: React.CSSProperties
    /** Tras descargar el PNG para WhatsApp en escritorio (wa.me no envía la imagen). */
    onDesktopWhatsAppHint?: (message: string) => void
}

function ShareDropdown({ visit, qrCode, buttonStyle, onDesktopWhatsAppHint }: ShareDropdownProps) {
    const [open, setOpen] = useState(false)
    const wrapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const onDoc = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [open])

    const text = buildShareText(visit)

    const shareNative = async () => {
        try {
            const file = await dataUrlToQrFile(qrCode, visit)
            if (file && (await shareQrImageWithOptionalText(file, text))) {
                setOpen(false)
                return
            }
            if (navigator.share) {
                const textOnly: ShareData = { text }
                if (navigator.canShare?.(textOnly)) {
                    await navigator.share(textOnly)
                } else {
                    await navigator.share({ text })
                }
                setOpen(false)
            }
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') return
        }
    }

    const onWhatsApp = async () => {
        try {
            const file = await dataUrlToQrFile(qrCode, visit)
            if (file && (await shareQrImageWithOptionalText(file, text))) {
                setOpen(false)
                return
            }
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
                setOpen(false)
                return
            }
        }
        onDesktopWhatsAppHint?.(DESKTOP_WHATSAPP_HINT)
        openWhatsAppWeb(buildWhatsAppShortText(visit))
        setOpen(false)
    }

    /** Solo la URL en el texto: a veces WhatsApp enlaza mejor; con HTTPS público suele verse en azul. */
    const onWhatsAppLinkOnly = () => {
        onDesktopWhatsAppHint?.(DESKTOP_WHATSAPP_HINT)
        openWhatsAppWeb(getVisitorAccessUrl(visit.qr_token))
        setOpen(false)
    }

    const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

    return (
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
            <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setOpen((v) => !v)}
                style={buttonStyle}
            >
                Compartir
            </Button>
            {open ? (
                <div
                    role="menu"
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        marginTop: 8,
                        zIndex: 1100,
                        minWidth: 200,
                        padding: 6,
                        borderRadius: 12,
                        background: '#0f172a',
                        border: '1px solid #334155',
                        boxShadow: '0 16px 40px rgba(0,0,0,.45)',
                        textAlign: 'left',
                    }}
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onWhatsApp}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: 10,
                            padding: '10px 12px',
                            border: 'none',
                            borderRadius: 8,
                            background: '#25D366',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        WhatsApp (mensaje)
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onWhatsAppLinkOnly}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: 10,
                            padding: '10px 12px',
                            marginTop: 6,
                            border: '1px solid #128C7E',
                            borderRadius: 8,
                            background: '#0f172a',
                            color: '#86efac',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        WhatsApp (solo enlace)
                    </button>
                    {hasNativeShare ? (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => void shareNative()}
                            style={{
                                display: 'block',
                                width: '100%',
                                marginTop: 6,
                                padding: '10px 12px',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                background: '#1e293b',
                                color: '#e2e8f0',
                                fontSize: 13,
                                cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            Más opciones…
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}

interface QRGeneratorProps {
    visit: Visit
    onCreateAnother?: () => void
    onClose?: () => void
    mode?: 'fullscreen' | 'modal'
    /** Residente, comunidad y unidad cuando se conocen (p. ej. al crear o vía getVisitWithQrDisplay). */
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

    const downloadQR = () => {
        const link = document.createElement('a')
        link.href = qrCode
        link.download = `qr-visita-${visit.qr_token.slice(0, 8)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (isLoading) {
        return (
            <div style={{ 
                backgroundColor: mode === 'modal' ? 'transparent' : '#080c0f', 
                minHeight: mode === 'modal' ? 'auto' : '100vh', 
                padding: '20px', 
                color: '#ffffff' 
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
                        backgroundColor: '#1a2024',
                        padding: '14px',
                        borderRadius: '12px',
                        maxWidth: 'min(440px, 100%)',
                        width: '100%',
                        margin: '16px auto',
                        textAlign: 'center',
                        color: '#ffffff',
                    }}
                >
                    <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#94a3b8' }}>
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
                        <p style={{ margin: '0 0 6px 0', fontSize: 11, color: '#a0a0a0' }}>
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
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
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
                                style={{ borderRadius: 8, color: '#000000', whiteSpace: 'nowrap' }}
                            >
                                {copyStatus === 'copied' ? 'Copiado' : 'Copiar'}
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ color: '#000000', fontSize: 14 }}>
                            Descargar
                        </Button>
                        <ShareDropdown
                            visit={visit}
                            qrCode={qrCode}
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
        <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px 16px', color: '#ffffff' }}>
            <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#22d3ee' }}>
                    ¡Visita creada!
                </h2>
                <p style={{ color: '#a0a0a0', marginBottom: '20px', fontSize: 14 }}>
                    Comparte el código o la invitación con tu visitante.
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <VisitInvitationCard visit={visit} qrCode={qrCode} qrDisplay={qrDisplay} />
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: 12, color: '#a0a0a0' }}>
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
                            backgroundColor: '#0f172a',
                            color: '#e2e8f0',
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
                            style={{ borderRadius: 8, color: '#000000', whiteSpace: 'nowrap' }}
                        >
                            {copyStatus === 'copied' ? 'Copiado' : 'Copiar'}
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ borderRadius: 20, color: '#000000', fontSize: 14 }}>
                        Descargar QR
                    </Button>
                    <ShareDropdown
                        visit={visit}
                        qrCode={qrCode}
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
