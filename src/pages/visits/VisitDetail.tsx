import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVisitById } from '../../services/visits.service'
import { formatDate, formatTime, formatPhone } from '../../utils/formatDate'
import QRGenerator from '../../components/shared/QRGenerator'
import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import type { Visit } from '../../types/index'

const VisitDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [visit, setVisit] = useState<Visit | null>(null)
    const [newStatus, setNewStatus] = useState<Visit['status']>('pending')
    const { role } = useAuth()
    const { changeStatus, refresh } = useVisits()
    const [isUpdating, setIsUpdating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)

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
            setNewStatus(visitData.status)
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

    const handleStatusUpdate = async () => {
        if (!visit) return
        setIsUpdating(true)
        try {
            const updated = await changeStatus(visit.id, newStatus)
            setVisit(updated)
            await refresh()
            setShowSuccessModal(true)
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
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
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #2a3034' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#a0a0a0' }}>Estado:</span>
                            {role === 'admin' ? (
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as Visit['status'])}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#1a2024',
                                        color: '#ffffff',
                                        border: '1px solid #334155'
                                    }}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="approved">Aprobado</option>
                                    <option value="rejected">Rechazado</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            ) : (
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
                            )}
                            {role === 'admin' && (
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={isUpdating}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '6px 12px',
                                        backgroundColor: '#22c55e',
                                        color: '#080c0f',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {isUpdating ? '...' : 'Guardar'}
                                </button>
                            )}
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
                                    {formatPhone(visit.visitor_phone) || 'No proporcionado'}
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
                                <p style={{ margin: 0, fontSize: '16px' }}>{formatTime(visit.visit_time)}</p>
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
                        onClick={() => setShowQRModal(true)}
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
                        Ver QR
                    </button>
                    <button
                        onClick={() => navigate('/visits/list')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#2a3034',
                            color: '#ffffff',
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

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: '#1a2024',
                        padding: '30px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ color: '#22d3ee', marginBottom: '20px' }}>¡Cambios realizados!</h3>
                        <p style={{ color: '#ffffff', marginBottom: '25px' }}>
                            El estado de la visita ha sido actualizado correctamente.
                        </p>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false)
                                navigate('/visits/list')
                            }}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#22d3ee',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Modal QR */}
            {showQRModal && visit && (
                <QRGenerator 
                    visit={visit}
                    mode="modal"
                    onClose={() => setShowQRModal(false)}
                />
            )}
        </div>
    )
}

export default VisitDetail
