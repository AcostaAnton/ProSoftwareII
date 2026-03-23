import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import type { Visit } from '../../types/index'
import { Button } from '../ui/Button'

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
        link.download = `qr-visita-${Date.now()}.png`
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

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ color: '#000000', fontSize: 14 }}>
                            Descargar
                        </Button>
                        <Button type="button" variant="secondary" size="md" onClick={onClose} style={{ fontSize: 14 }}>
                            Cerrar
                        </Button>
                    </div>
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

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button type="button" variant="primary" size="md" onClick={downloadQR} style={{ borderRadius: 20, color: '#000000', fontSize: 14 }}>
                        Descargar QR
                    </Button>
                    <Button type="button" variant="secondary" size="md" onClick={onCreateAnother} style={{ borderRadius: 20, fontSize: 14 }}>
                        Volver
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default QRGenerator
