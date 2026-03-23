// Página pública: el visitante abre el enlace y ve el mismo QR que en la app (token en la URL).

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { Button } from '../../components/ui/Button'
import { getVisitorAccessUrl } from '../../utils/visitorAccessUrl'

export default function VisitorAccessPage() {
    const { token: tokenParam } = useParams<{ token: string }>()
    const token = tokenParam ? decodeURIComponent(tokenParam).trim() : ''
    const [qrDataUrl, setQrDataUrl] = useState('')
    const [copyLabel, setCopyLabel] = useState<'Copiar enlace' | 'Copiado'>('Copiar enlace')

    useEffect(() => {
        document.title = token ? 'Tu acceso — QR' : 'Acceso visita'
    }, [token])

    useEffect(() => {
        if (!token) return
        let cancelled = false
        QRCode.toDataURL(token, { width: 280, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
            .then((url) => {
                if (!cancelled) setQrDataUrl(url)
            })
            .catch(() => {
                if (!cancelled) setQrDataUrl('')
            })
        return () => {
            cancelled = true
        }
    }, [token])

    const accessUrl = token ? getVisitorAccessUrl(token) : ''

    const copyLink = async () => {
        if (!accessUrl) return
        try {
            await navigator.clipboard.writeText(accessUrl)
            setCopyLabel('Copiado')
            setTimeout(() => setCopyLabel('Copiar enlace'), 2000)
        } catch {
            /* ignore */
        }
    }

    const copyToken = async () => {
        if (!token) return
        try {
            await navigator.clipboard.writeText(token)
        } catch {
            /* ignore */
        }
    }

    if (!token) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#020617',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
            >
                <p>Enlace no válido.</p>
            </div>
        )
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: '24px 16px 40px',
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
        >
            <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#22d3ee', margin: '0 0 8px' }}>
                    Tu acceso
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px' }}>Muestra este código en portería</p>

                <div
                    style={{
                        display: 'inline-block',
                        padding: 16,
                        background: '#fff',
                        borderRadius: 16,
                        marginBottom: 20,
                        boxShadow: '0 20px 50px rgba(0,0,0,.4)',
                    }}
                >
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Código QR de acceso" width={260} height={260} style={{ display: 'block' }} />
                    ) : (
                        <div style={{ width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            Generando…
                        </div>
                    )}
                </div>

                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Código (por si no puedes mostrar el QR):</p>
                <code
                    style={{
                        display: 'block',
                        padding: '10px 12px',
                        background: '#1e293b',
                        borderRadius: 10,
                        fontSize: 14,
                        wordBreak: 'break-all',
                        marginBottom: 16,
                        color: '#e2e8f0',
                    }}
                >
                    {token}
                </code>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                    <Button type="button" variant="secondary" size="sm" onClick={copyToken}>
                        Copiar código
                    </Button>
                    <Button type="button" variant="primary" size="sm" onClick={copyLink} style={{ color: '#0f172a' }}>
                        {copyLabel}
                    </Button>
                </div>

                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    No reenvíes este enlace a personas que no sean el visitante: quien lo tenga puede usar el mismo acceso.
                </p>
                {import.meta.env.DEV ? (
                    <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.45, margin: '16px 0 0', textAlign: 'left' }}>
                        <strong>Desarrollo:</strong> desde otro móvil, <code>localhost</code> no es tu PC. En{' '}
                        <code>.env.local</code> pon{' '}
                        <code style={{ wordBreak: 'break-all' }}>VITE_PUBLIC_APP_URL=http://TU_IP:5173</code> (IP de tu Mac en
                        la misma Wi‑Fi; con <code>npm run dev</code> el servidor ya escucha en la red por defecto).
                    </p>
                ) : null}
            </div>
        </div>
    )
}
