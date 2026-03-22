import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createVisit, checkOptionalFields } from '../../services/visits.service'
import QRGenerator from '../../components/shared/QRGenerator'
import type { VisitStatus, Visit } from '../../types/index'

const NewVisit: React.FC = () => {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_phone: '',
        visit_date: '',
        visit_hour: '12',
        visit_minute: '00',
        visit_period: 'AM',
        visit_purpose: '',
        visit_destination: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [createdVisit, setCreatedVisit] = useState<Visit | null>(null)

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
            // Validar y convertir fecha
            let formattedDate = formData.visit_date
            if (formattedDate.includes('/')) {
                // Convertir de DD/MM/YYYY a YYYY-MM-DD
                const [day, month, year] = formattedDate.split('/')
                formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            }

            // Validar campos requeridos
            if (!formData.visitor_name.trim()) {
                setError('El nombre del visitante es requerido')
                return
            }
            if (!formattedDate) {
                setError('La fecha de la visita es requerida')
                return
            }
            const cleanPhone = formData.visitor_phone.replace(/[\s\-]/g, '')

            // Convertir hora de 12h a 24h
            const hour24 = formData.visit_period === 'PM' 
                ? (parseInt(formData.visit_hour) === 12 ? 12 : parseInt(formData.visit_hour) + 12)
                : (parseInt(formData.visit_hour) === 12 ? 0 : parseInt(formData.visit_hour))
            const visit_time = `${hour24.toString().padStart(2, '0')}:${formData.visit_minute}`

            const visitData = {
                resident_id: user.id,
                visitor_name: formData.visitor_name.trim(),
                visitor_phone: cleanPhone || undefined,
                visit_date: formattedDate,
                visit_time: visit_time || undefined,
                // visit_purpose: formData.visit_purpose.trim() || undefined,
                // visit_destination: formData.visit_destination.trim() || undefined,
                status: 'pending' as VisitStatus
            }
            
            console.log('Creating visit with data:', visitData)
            console.log('Raw form data:', formData)
            console.log('visit_time format:', visit_time, 'type:', typeof visit_time)
            console.log('visit_date format:', formData.visit_date, 'type:', typeof formData.visit_date)

            // Verificar si los campos opcionales existen
            const fieldCheck = await checkOptionalFields()
            console.log('Optional fields check:', fieldCheck)

            let finalVisitData = { ...visitData } as any
            
            if (fieldCheck.exist) {
                finalVisitData.visit_purpose = formData.visit_purpose.trim() || undefined
                finalVisitData.visit_destination = formData.visit_destination.trim() || undefined
                console.log('Including optional fields in final data')
            } else {
                console.log('Optional fields not available, using basic data only')
            }

            const visit: Visit = await createVisit(finalVisitData)
            
            setCreatedVisit(visit)
            setFormData({
                visitor_name: '',
                visitor_phone: '',
                visit_date: '',
                visit_hour: '12',
                visit_minute: '00',
                visit_period: 'AM',
                visit_purpose: '',
                visit_destination: ''
            })
        } catch (err) {
            console.error('Error creating visit:', err)
            console.error('Error details:', JSON.stringify(err, null, 2))
            
            // Mostrar mensaje más específico del error
            if (err && typeof err === 'object' && 'message' in err) {
                setError(`Error al crear la visita: ${err.message}`)
            } else if (err && typeof err === 'object' && 'code' in err) {
                setError(`Error al crear la visita (código: ${err.code})`)
            } else {
                setError('Error al crear la visita')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (createdVisit) {
        return (
            <QRGenerator 
                visit={createdVisit}
                onCreateAnother={() => setCreatedVisit(null)}
            />
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
                            placeholder="9999-9999"
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
                            min={new Date().toISOString().split('T')[0]}
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <select
                                    name="visit_hour"
                                    value={formData.visit_hour}
                                    onChange={handleChange}
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
                                >
                                    <option value="">Hora</option>
                                    <option value="01">1</option>
                                    <option value="02">2</option>
                                    <option value="03">3</option>
                                    <option value="04">4</option>
                                    <option value="05">5</option>
                                    <option value="06">6</option>
                                    <option value="07">7</option>
                                    <option value="08">8</option>
                                    <option value="09">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    name="visit_minute"
                                    value={formData.visit_minute}
                                    onChange={handleChange}
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
                                >
                                    <option value="">Min</option>
                                    <option value="00">00</option>
                                    <option value="15">15</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    name="visit_period"
                                    value={formData.visit_period}
                                    onChange={handleChange}
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
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>Asunto</label>
                        <input
                            type="text"
                            name="visit_purpose"
                            value={formData.visit_purpose}
                            onChange={handleChange}
                            placeholder="Motivo de la visita"
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
                        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px' }}>A donde va</label>
                        <input
                            type="text"
                            name="visit_destination"
                            value={formData.visit_destination}
                            onChange={handleChange}
                            placeholder="Unidad o lugar de destino"
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
