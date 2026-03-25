import {
    useEffect,
    useEffectEvent,
    useState
} from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { Button } from '../../components/ui/Button'
import { getVisitorAccessUrl } from '../../utils/visitorAccessUrl'
import './visitPages.css'

type CopyLabel = 'Copiar enlace' | 'Copiado'

export default function VisitorAccessPage() {
    const { token: tokenParam } = useParams<{ token: string }>()
    const token = tokenParam ? decodeURIComponent(tokenParam).trim() : ''
    const [qrDataUrl, setQrDataUrl] = useState('')
    const [copyLabel, setCopyLabel] = useState<CopyLabel>('Copiar enlace')
    const accessUrl = token ? getVisitorAccessUrl(token) : ''
    const resetCopyLabel = useEffectEvent(() => {
        setCopyLabel('Copiar enlace')
    })

    useEffect(() => {
        document.title = token ? 'Tu acceso - QR' : 'Acceso visita'
    }, [token])

    useEffect(() => {
        if (copyLabel !== 'Copiado') {
            return
        }

        const timeoutId = window.setTimeout(() => {
            resetCopyLabel()
        }, 2000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [copyLabel])

    useEffect(() => {
        if (!token) {
            setQrDataUrl('')
            return
        }

        let isActive = true

        void QRCode.toDataURL(token, {
            width: 280,
            margin: 2,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        })
            .then((url) => {
                if (!isActive) {
                    return
                }

                setQrDataUrl(url)
            })
            .catch(() => {
                if (!isActive) {
                    return
                }

                setQrDataUrl('')
            })

        return () => {
            isActive = false
        }
    }, [token])

    function handleCopyLink() {
        if (!accessUrl) {
            return
        }

        void copyText(accessUrl).then((copied) => {
            if (!copied) {
                return
            }

            setCopyLabel('Copiado')
        })
    }

    function handleCopyToken() {
        if (!token) {
            return
        }

        void copyText(token)
    }

    if (!token) {
        return (
            <div className="visitor-access-page visitor-access-page--invalid">
                <p>Enlace no valido.</p>
            </div>
        )
    }

    return (
        <div className="visitor-access-page">
            <div className="visitor-access-container">
                <h1 className="visitor-access-title">Tu acceso</h1>
                <p className="visitor-access-note">Muestra este codigo en porteria.</p>

                <div className="visitor-access-card">
                    {qrDataUrl ? (
                        <img
                            src={qrDataUrl}
                            alt="Codigo QR de acceso"
                            width={260}
                            height={260}
                            className="visitor-access-qr"
                        />
                    ) : (
                        <div className="visitor-access-qr-placeholder">
                            Generando...
                        </div>
                    )}
                </div>

                <p className="visitor-access-code-label">
                    Codigo alterno:
                </p>

                <code className="visitor-access-code">
                    {token}
                </code>

                <div className="visitor-access-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyToken}
                        className="visit-rounded-button visit-rounded-button--sm"
                    >
                        Copiar codigo
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleCopyLink}
                        className="visit-rounded-button visit-rounded-button--sm"
                    >
                        {copyLabel}
                    </Button>
                </div>

                <p className="visitor-access-footnote">
                    No compartas este enlace con otras personas. Quien lo tenga puede usar el mismo acceso.
                </p>

                {import.meta.env.DEV && (
                    <p className="visitor-access-devnote">
                        Desarrollo: en otro movil, `localhost` no apunta a tu PC. Usa `VITE_PUBLIC_APP_URL=http://TU_IP:5173`
                        en `.env.local`.
                    </p>
                )}
            </div>
        </div>
    )
}

function copyText(value: string): Promise<boolean> {
    if (!navigator.clipboard || !value) {
        return Promise.resolve(false)
    }

    return navigator.clipboard.writeText(value)
        .then(() => true)
        .catch(() => false)
}
