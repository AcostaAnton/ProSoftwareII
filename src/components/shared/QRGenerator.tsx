import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import type { Visit } from '../../types/index'
import { Button } from '../ui/Button'
import { getVisitorAccessUrl } from '../../utils/visitorAccessUrl'

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
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ 
    visit, 
    onCreateAnother, 
    onClose,
    mode = 'fullscreen'
}) => {
    const [qrCode, setQrCode] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy')
    const [copyLinkStatus, setCopyLinkStatus] = useState<'copy' | 'copied'>('copy')
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

    const visitorAccessUrl = getVisitorAccessUrl(visit.qr_token)

    const copyVisitorLinkToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(visitorAccessUrl)
            setCopyLinkStatus('copied')
            setTimeout(() => setCopyLinkStatus('copy'), 2000)
        } catch (err) {
            console.error('Error copying link:', err)
        }
    }

    useEffect(() => {
        const generateQR = async () => {
            try {
                const qrData = visit.qr_token
                const qrCodeDataURL = await QRCode.toDataURL(qrData)
                setQrCode(qrCodeDataURL)
            } catch (err) {
                console.error('Error generating QR:', err)
            } finally {
                setIsLoading(false)
            }
        }

        generateQR()
    }, [visit.qr_token])

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
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: '#1a2024',
                    padding: '30px',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    textAlign: 'center',
                    color: '#ffffff'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#22d3ee' }}>
                        Código QR de la Visita
                    </h2>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <img src={qrCode} alt="Código QR" style={{ width: '200px', height: '200px' }} />
                    </div>

                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
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

                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: 12, color: '#a0a0a0' }}>
                            Enlace para el visitante (WhatsApp a veces no marca en azul las URLs locales):
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <code
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: 10,
                                    backgroundColor: '#0f172a',
                                    color: '#e2e8f0',
                                    fontSize: 11,
                                    wordBreak: 'break-all',
                                    maxWidth: '100%',
                                    flex: '1 1 200px',
                                }}
                            >
                                {visitorAccessUrl}
                            </code>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={copyVisitorLinkToClipboard}
                                style={{ borderRadius: 8, whiteSpace: 'nowrap' }}
                            >
                                {copyLinkStatus === 'copied' ? 'Copiado' : 'Copiar enlace'}
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
        <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#22d3ee' }}>
                    ¡Nueva visita creada exitosamente!
                </h2>
                <p style={{ color: '#a0a0a0', marginBottom: '30px' }}>
                    Código QR generado para el acceso del visitante
                </p>
                
                <div style={{ marginBottom: '30px' }}>
                    <img src={qrCode} alt="Código QR" style={{ width: '200px', height: '200px' }} />
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

                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: 12, color: '#a0a0a0' }}>
                        Enlace para el visitante (WhatsApp a veces no marca en azul las URLs locales):
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                        }}
                    >
                        <code
                            style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                fontSize: 11,
                                wordBreak: 'break-all',
                                maxWidth: '100%',
                                flex: '1 1 200px',
                                textAlign: 'left',
                            }}
                        >
                            {visitorAccessUrl}
                        </code>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={copyVisitorLinkToClipboard}
                            style={{ borderRadius: 8, whiteSpace: 'nowrap' }}
                        >
                            {copyLinkStatus === 'copied' ? 'Copiado' : 'Copiar enlace'}
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
