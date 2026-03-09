import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVisitById } from '../../services/visits.service'
import { formatDate } from '../../utils/formatDate'
import type { Visit } from '../../types/index'

const VisitDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [visit, setVisit] = useState<Visit | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadVisit()
    }, [id])

    const loadVisit = async () => {
        try {
            if (!id) {
                setError('ID de visita no proporcionado')
                return
            }
            const visitData = await getVisitById(id)
            setVisit(visitData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar la visita')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return '#22c55e'
            case 'pending':
                return '#f59e0b'
            case 'rejected':
                return '#ef4444'
            case 'completed':
                return '#06b6d4'
            case 'cancelled':
                return '#6b7280'
            default:
                return '#gray'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Aprobado'
            case 'pending':
                return 'Pendiente'
            case 'rejected':
                return 'Rechazado'
            case 'completed':
                return 'Completado'
            case 'cancelled':
                return 'Cancelado'
            default:
                return status
        }
    }

    if (loading) {
        return (
            <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <p>Cargando detalles de la visita...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#2a3034',
                        border: '1px solid #ff6b6b',
                        borderRadius: '8px',
                        color: '#ff6b6b',
                        marginBottom: '20px'
                    }}>
                        Error: {error}
                    </div>
                    <button
                        onClick={() => navigate('/visits/list')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2a3034',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Volver a lista de visitas
                    </button>
                </div>
            </div>
        )
    }

    if (!visit) {
        return (
            <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <p>Visita no encontrada</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <button
                        onClick={() => navigate('/visits/list')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#2a3034',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        ← Volver
                    </button>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Detalles de la Visita</h1>
                </div>

                {/* Card Principal */}
                <div style={{
                    backgroundColor: '#1a2024',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {/* Estatus */}
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #2a3034' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#a0a0a0' }}>Estado:</span>
                            <span
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: getStatusColor(visit.status),
                                    color: '#ffffff',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {getStatusLabel(visit.status)}
                            </span>
                        </div>
                    </div>

                    {/* Información del Visitante */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#22d3ee', marginBottom: '15px' }}>Información del Visitante</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Nombre
                                </label>
                                <p style={{ margin: 0, fontSize: '16px' }}>{visit.visitor_name}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Teléfono
                                </label>
                                <p style={{ margin: 0, fontSize: '16px' }}>
                                    {visit.visitor_phone || 'No proporcionado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información de la Visita */}
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #2a3034' }}>
                        <h3 style={{ color: '#22d3ee', marginBottom: '15px' }}>Información de la Visita</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Fecha
                                </label>
                                <p style={{ margin: 0, fontSize: '16px' }}>
                                    {formatDate(visit.visit_date)}
                                </p>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Hora
                                </label>
                                <p style={{ margin: 0, fontSize: '16px' }}>{visit.visit_time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información del Sistema */}
                    <div>
                        <h3 style={{ color: '#22d3ee', marginBottom: '15px' }}>Información del Sistema</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    ID de Visita
                                </label>
                                <p style={{ margin: 0, fontSize: '12px', color: '#808080', fontFamily: 'monospace' }}>
                                    {visit.id}
                                </p>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Creado
                                </label>
                                <p style={{ margin: 0, fontSize: '16px' }}>
                                    {formatDate(visit.created_at)}
                                </p>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '14px', marginBottom: '5px' }}>
                                    Token QR
                                </label>
                                <p style={{ margin: 0, fontSize: '12px', color: '#808080', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {visit.qr_token}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/visits/list')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#22d3ee',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Volver a Visitas
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VisitDetail
