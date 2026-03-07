import React, { useState } from 'react'
import QRCode from 'qrcode'
import { useAuth } from '../../hooks/useAuth'
import { createVisit } from '../../services/visits.service'
import type { VisitStatus, Visit } from '../../types/index'

const NewVisit: React.FC = () => {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_phone: '',
        visit_date: '',
        visit_time: '',
        reason: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [qrCode, setQrCode] = useState<string>('')
    const [showSuccess, setShowSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            setError('Usuario no autenticado')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const visit: Visit = await createVisit({
                resident_id: user.id,
                visitor_name: formData.visitor_name,
                visitor_phone: formData.visitor_phone,
                visit_date: formData.visit_date,
                visit_time: formData.visit_time,
                status: 'pending' as VisitStatus
            })
            // Generar QR con la URL de VisitDetail
            const qrData = `${window.location.origin}/visits/${visit.id}`
            const qrCodeDataURL = await QRCode.toDataURL(qrData)
            setQrCode(qrCodeDataURL)
            setShowSuccess(true)
            setFormData({
                visitor_name: '',
                visitor_phone: '',
                visit_date: '',
                visit_time: '',
                reason: ''
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la visita')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (showSuccess) {
        const downloadQR = () => {
            const link = document.createElement('a')
            link.href = qrCode
            link.download = `qr-visita-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
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
                            onClick={() => setShowSuccess(false)}
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

    return (
        <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Nueva visita</h1>
                <p style={{ color: '#a0a0a0', marginBottom: '30px' }}>Completa los datos para generar el QR de acceso.</p>

                {error && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#2a3034',
                        border: '1px solid #ff6b6b',
                        borderRadius: '8px',
                        color: '#ff6b6b'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Nombre del visitante *</label>
                        <input
                            type="text"
                            name="visitor_name"
                            value={formData.visitor_name}
                            onChange={handleChange}
                            placeholder="Nombre Apellido"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#1a2024',
                                border: '1px solid #2a3034',
                                borderRadius: '20px',
                                color: '#ffffff',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Teléfono</label>
                        <input
                            type="tel"
                            name="visitor_phone"
                            value={formData.visitor_phone}
                            onChange={handleChange}
                            placeholder="+504 0000-0000"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#1a2024',
                                border: '1px solid #2a3034',
                                borderRadius: '20px',
                                color: '#ffffff',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Fecha *</label>
                        <input
                            type="date"
                            name="visit_date"
                            value={formData.visit_date}
                            onChange={handleChange}
                            placeholder="dd/mm/aaaa"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#1a2024',
                                border: '1px solid #2a3034',
                                borderRadius: '20px',
                                color: '#ffffff',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Hora *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="time"
                                name="visit_time"
                                value={formData.visit_time}
                                onChange={handleChange}
                                placeholder="--:-- ----"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #2a3034',
                                    borderRadius: '20px',
                                    color: '#ffffff',
                                    fontSize: '16px'
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#a0a0a0'
                            }}>
                                
                            </span>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Motivo</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #2a3034',
                                    borderRadius: '20px',
                                    color: '#ffffff',
                                    fontSize: '16px',
                                    appearance: 'none'
                                }}
                            >
                                <option value="">Seleccionar</option>
                                <option value="familiar">Familiar</option>
                                <option value="amigo">Amigo</option>
                                <option value="servicio">Servicio</option>
                                <option value="otro">Otro</option>
                            </select>
                            <span style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#a0a0a0'
                            }}>
                                
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px',
                            backgroundColor: '#22d3ee',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        {isSubmitting ? 'Creando...' : 'Crear visita y generar QR'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewVisit
