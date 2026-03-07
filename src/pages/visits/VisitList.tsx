import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getVisitsByResident } from '../../services/visits.service'
import type { Visit } from '../../types/index'

type FilterType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth'

const VisitList: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [visits, setVisits] = useState<Visit[]>([])
    const [filteredVisits, setFilteredVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedFilters, setSelectedFilters] = useState<Set<FilterType>>(new Set())

    useEffect(() => {
        if (user) {
            loadVisits()
        }
    }, [user])

    useEffect(() => {
        applyFilters()
    }, [visits, selectedFilters])

    const loadVisits = async () => {
        try {
            const visitsData = await getVisitsByResident(user!.id)
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
            case 'today':
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
            case 'tomorrow':
                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
                return { start: tomorrow, end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) }
            case 'thisWeek':
                const monday = new Date(today)
                monday.setDate(today.getDate() - today.getDay() + 1) // Lunes de esta semana
                const sunday = new Date(monday)
                sunday.setDate(monday.getDate() + 6) // Domingo de esta semana
                return { start: monday, end: new Date(sunday.getTime() + 24 * 60 * 60 * 1000) }
            case 'nextWeek':
                const nextMonday = new Date(today)
                nextMonday.setDate(today.getDate() - today.getDay() + 8) // Lunes de la próxima semana
                const nextSunday = new Date(nextMonday)
                nextSunday.setDate(nextMonday.getDate() + 6) // Domingo de la próxima semana
                return { start: nextMonday, end: new Date(nextSunday.getTime() + 24 * 60 * 60 * 1000) }
            case 'thisMonth':
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                return { start: firstDay, end: new Date(lastDay.getTime() + 24 * 60 * 60 * 1000) }
            default:
                return { start: new Date(0), end: new Date() }
        }
    }

    const applyFilters = () => {
        if (selectedFilters.size === 0) {
            setFilteredVisits(visits)
            return
        }

        const filtered = visits.filter(visit => {
            const visitDate = new Date(visit.visit_date)
            return Array.from(selectedFilters).some(filter => {
                const { start, end } = getDateRange(filter)
                return visitDate >= start && visitDate < end
            })
        })
        setFilteredVisits(filtered)
    }

    const toggleFilter = (filter: FilterType) => {
        const newFilters = new Set(selectedFilters)
        if (newFilters.has(filter)) {
            newFilters.delete(filter)
        } else {
            newFilters.add(filter)
        }
        setSelectedFilters(newFilters)
    }

    const clearFilters = () => {
        setSelectedFilters(new Set())
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

                {/* Filtros */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1a2024', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Filtros por fecha</h3>
                        {selectedFilters.size > 0 && (
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[
                            { key: 'today' as FilterType, label: 'Hoy' },
                            { key: 'tomorrow' as FilterType, label: 'Mañana' },
                            { key: 'thisWeek' as FilterType, label: 'Esta semana' },
                            { key: 'nextWeek' as FilterType, label: 'Próxima semana' },
                            { key: 'thisMonth' as FilterType, label: 'Este mes' }
                        ].map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.has(key)}
                                    onChange={() => toggleFilter(key)}
                                    style={{ marginRight: '5px' }}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {filteredVisits.length === 0 ? (
                    <p style={{ color: '#a0a0a0' }}>
                        {visits.length === 0 ? 'No tienes visitas registradas.' : 'No hay visitas que coincidan con los filtros seleccionados.'}
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
                                            {visit.visit_date} - {visit.visit_time}
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', color: '#a0a0a0', fontSize: '14px' }}>
                                            Tel: {visit.visitor_phone}
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
