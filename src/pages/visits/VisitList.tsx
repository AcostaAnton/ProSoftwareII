import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getVisitsByResident, getAllVisits } from '../../services/visits.service'
import { formatDate, formatTime, formatPhone } from '../../utils/formatDate'
import type { Visit } from '../../types/index'

type FilterType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth'

const VisitList: React.FC = () => {
    const { user, role } = useAuth()
    const navigate = useNavigate()
    const [visits, setVisits] = useState<Visit[]>([])
    const [filteredVisits, setFilteredVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedFilters, setSelectedFilters] = useState<Set<FilterType>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilters, setStatusFilters] = useState<Set<Visit['status']>>(new Set())
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [showDateDropdown, setShowDateDropdown] = useState(false)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)

    useEffect(() => {
        if (user) {
            loadVisits()
        }
    }, [user])

    useEffect(() => {
        applyFilters()
    }, [visits, selectedFilters, searchTerm, statusFilters, startDate, endDate])

    const loadVisits = async () => {
        try {
            let visitsData: Visit[] = []
            if (role === 'resident') {
                visitsData = await getVisitsByResident(user!.id)
            } else {
                visitsData = await getAllVisits()
            }
            setVisits(visitsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar las visitas')
        } finally {
            setLoading(false)
        }
    }

    const getDateRange = (filter: FilterType): { start: Date, end: Date } => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (filter) {
            case 'today': {
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
            }
            case 'tomorrow': {
                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
                return { start: tomorrow, end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) }
            }
            case 'thisWeek': {
                const monday = new Date(today)
                monday.setDate(today.getDate() - today.getDay() + 1) // Lunes de esta semana
                const sunday = new Date(monday)
                sunday.setDate(monday.getDate() + 6) // Domingo de esta semana
                return { start: monday, end: new Date(sunday.getTime() + 24 * 60 * 60 * 1000) }
            }
            case 'nextWeek': {
                const nextMonday = new Date(today)
                nextMonday.setDate(today.getDate() - today.getDay() + 8) // Lunes de la próxima semana
                const nextSunday = new Date(nextMonday)
                nextSunday.setDate(nextMonday.getDate() + 6) // Domingo de la próxima semana
                return { start: nextMonday, end: new Date(nextSunday.getTime() + 24 * 60 * 60 * 1000) }
            }
            case 'thisMonth': {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                return { start: firstDay, end: new Date(lastDay.getTime() + 24 * 60 * 60 * 1000) }
            }
            default:
                return { start: new Date(0), end: new Date() }
        }
    }

    const applyFilters = () => {
        let filtered = visits

        // Filtrar por búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(visit =>
                visit.visitor_name.toLowerCase().includes(term) ||
                (visit.visit_purpose && visit.visit_purpose.toLowerCase().includes(term)) ||
                (visit.visitor_phone && visit.visitor_phone.includes(term)) ||
                (visit.visit_destination && visit.visit_destination.toLowerCase().includes(term))
            )
        }

        // Filtrar por fechas personalizadas
        if (startDate || endDate) {
            filtered = filtered.filter(visit => {
                const visitDate = new Date(visit.visit_date)
                const start = startDate ? new Date(startDate) : null
                const end = endDate ? new Date(endDate) : null
                if (start && end) {
                    return visitDate >= start && visitDate <= end
                } else if (start) {
                    return visitDate >= start
                } else if (end) {
                    return visitDate <= end
                }
                return true
            })
        } else if (selectedFilters.size > 0) {
            // Filtrar por fechas predefinidas solo si no hay fechas personalizadas
            filtered = filtered.filter(visit => {
                const visitDate = new Date(visit.visit_date)
                return Array.from(selectedFilters).some(filter => {
                    const { start, end } = getDateRange(filter)
                    return visitDate >= start && visitDate < end
                })
            })
        }

        // Filtrar por status
        if (statusFilters.size > 0) {
            filtered = filtered.filter(visit => statusFilters.has(visit.status))
        }

        setFilteredVisits(filtered)
    }

    const handleDateFilterChange = (filter: FilterType) => {
        const newFilters = new Set(selectedFilters)
        if (newFilters.has(filter)) {
            newFilters.delete(filter)
        } else {
            newFilters.add(filter)
        }
        setSelectedFilters(newFilters)
        setShowDateDropdown(false) // Cerrar dropdown al seleccionar
    }

    const handleStatusFilterChange = (status: Visit['status']) => {
        const newFilters = new Set(statusFilters)
        if (newFilters.has(status)) {
            newFilters.delete(status)
        } else {
            newFilters.add(status)
        }
        setStatusFilters(newFilters)
        setShowStatusDropdown(false) // Cerrar dropdown al seleccionar
    }

    const clearDateFilters = () => {
        setSelectedFilters(new Set())
        setShowDateDropdown(false)
    }

    const clearStatusFilters = () => {
        setStatusFilters(new Set())
        setShowStatusDropdown(false)
    }

    const clearFilters = () => {
        setSelectedFilters(new Set())
        setStatusFilters(new Set())
        setSearchTerm('')
        setStartDate('')
        setEndDate('')
        setShowDateDropdown(false)
        setShowStatusDropdown(false)
    }

    const handleVisitClick = (visitId: string) => {
        navigate(`/visits/${visitId}`)
    }

    if (loading) {
        return (
            <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    Cargando visitas...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    Error: {error}
                </div>
            </div>
        )
    }

    return (
        <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Lista de Visitas</h1>

                {/* Barra de Búsqueda */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, propósito, teléfono o destino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            backgroundColor: '#1a2024',
                            color: '#ffffff',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {/* Filtros */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1a2024', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Filtros</h3>
                        {(selectedFilters.size > 0 || statusFilters.size > 0 || searchTerm || startDate || endDate) && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#2a3034',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* Filtros por fecha personalizada */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Filtrar por fecha</h4>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Desde</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #334155',
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Hasta</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #334155',
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filtros rápidos y por estado en fila */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {/* Filtros rápidos por fecha */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>Filtros rápidos por fecha</div>
                                <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                                    {selectedFilters.size === 0 ? 'Ninguno' : `${selectedFilters.size} seleccionado${selectedFilters.size > 1 ? 's' : ''}`}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDateDropdown(!showDateDropdown)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{selectedFilters.size === 0 ? 'Seleccionar filtros' : `${selectedFilters.size} filtro${selectedFilters.size > 1 ? 's' : ''} seleccionado${selectedFilters.size > 1 ? 's' : ''}`}</span>
                                <span>{showDateDropdown ? '▲' : '▼'}</span>
                            </button>
                            {showDateDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{ padding: '10px' }}>
                                        <button
                                            onClick={clearDateFilters}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                backgroundColor: '#ef4444',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            Ninguno
                                        </button>
                                        {[
                                            { key: 'today' as FilterType, label: 'Hoy' },
                                            { key: 'tomorrow' as FilterType, label: 'Mañana' },
                                            { key: 'thisWeek' as FilterType, label: 'Esta semana' },
                                            { key: 'nextWeek' as FilterType, label: 'Próxima semana' },
                                            { key: 'thisMonth' as FilterType, label: 'Este mes' }
                                        ].map(({ key, label }) => (
                                            <label key={key} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                backgroundColor: selectedFilters.has(key) ? '#334155' : 'transparent',
                                                marginBottom: '5px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.has(key)}
                                                    onChange={() => handleDateFilterChange(key)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filtros por estado */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>Filtrar por estado</div>
                                <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                                    {statusFilters.size === 0 ? 'Ninguno' : `${statusFilters.size} seleccionado${statusFilters.size > 1 ? 's' : ''}`}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{statusFilters.size === 0 ? 'Seleccionar estados' : `${statusFilters.size} estado${statusFilters.size > 1 ? 's' : ''} seleccionado${statusFilters.size > 1 ? 's' : ''}`}</span>
                                <span>{showStatusDropdown ? '▲' : '▼'}</span>
                            </button>
                            {showStatusDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#1a2024',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{ padding: '10px' }}>
                                        <button
                                            onClick={clearStatusFilters}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                backgroundColor: '#ef4444',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            Ninguno
                                        </button>
                                        {[
                                            { key: 'pending' as Visit['status'], label: 'Pendiente' },
                                            { key: 'approved' as Visit['status'], label: 'Aprobada' },
                                            { key: 'rejected' as Visit['status'], label: 'Rechazada' },
                                            { key: 'completed' as Visit['status'], label: 'Completada' },
                                            { key: 'cancelled' as Visit['status'], label: 'Cancelada' }
                                        ].map(({ key, label }) => (
                                            <label key={key} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                backgroundColor: statusFilters.has(key) ? '#334155' : 'transparent',
                                                marginBottom: '5px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={statusFilters.has(key)}
                                                    onChange={() => handleStatusFilterChange(key)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {filteredVisits.length === 0 ? (
                    <p style={{ color: '#a0a0a0' }}>
                        {visits.length === 0 ? 'No tienes visitas registradas.' : 
                         (selectedFilters.size > 0 || statusFilters.size > 0 || searchTerm || startDate || endDate) ? 
                         'No hay visitas que coincidan con los filtros y búsqueda seleccionados.' : 
                         'No hay visitas disponibles.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredVisits.map((visit) => (
                            <div
                                key={visit.id}
                                onClick={() => handleVisitClick(visit.id)}
                                style={{
                                    backgroundColor: '#1a2024',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: '1px solid #2a3034'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2a3034')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1a2024')}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                                            {visit.visitor_name}
                                        </h3>
                                        <p style={{ margin: '0', color: '#a0a0a0', fontSize: '14px' }}>
                                            {formatDate(visit.visit_date)} - {formatTime(visit.visit_time)}
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', color: '#a0a0a0', fontSize: '14px' }}>
                                            Tel: {formatPhone(visit.visitor_phone)}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: visit.status === 'approved' ? '#22d3ee' : visit.status === 'pending' ? '#f59e0b' : '#ef4444',
                                        color: '#000000'
                                    }}>
                                        {visit.status === 'pending' ? 'Pendiente' :
                                         visit.status === 'approved' ? 'Aprobada' :
                                         visit.status === 'completed' ? 'Completada' : 'Cancelada'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitList
