import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import type { Visit } from '../../types/index'

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

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={downloadQR}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#22d3ee',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            Descargar
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2a3034',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cerrar
                        </button>
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

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={downloadQR}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#22d3ee',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Descargar QR
                    </button>
                    <button
                        onClick={onCreateAnother}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2a3034',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Crear otra visita
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QRGenerator
