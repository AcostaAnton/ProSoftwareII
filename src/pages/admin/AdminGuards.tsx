// src/pages/admin/AdminGuards.tsx
import React, { useState, useEffect } from 'react'
import { guardsService } from '../../services/guards.service'
import type { GuardActivity } from '../../services/guards.service'
import { useAuth } from '../../hooks/useAuth'

type StatsType = {
    total_guards: number
    active_guards: number
    total_access: number
    today_access: number
    avg_per_guard: number
}

export const AdminGuards: React.FC = () => {
    const { role } = useAuth()
    const isAdmin = role === 'admin'

    const [activities, setActivities] = useState<GuardActivity[]>([])
    const [stats, setStats] = useState<StatsType | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedGuard, setSelectedGuard] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const loadData = async () => {
        try {
            setLoading(true)
            console.log('Cargando datos...')
            const [activitiesData, statsData] = await Promise.all([
                guardsService.getGuardsActivity(),
                guardsService.getStats()
            ])
            console.log('Datos cargados:', activitiesData, statsData)
            setActivities(activitiesData)
            setStats(statsData)
            setError(null)
        } catch (error) {
            console.error('Error en loadData:', error)
            setError('Error al cargar datos de guardias')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleToggleStatus = async (guardId: string, currentActive: boolean) => {
        if (!isAdmin) return
        try {
            await guardsService.toggleGuardStatus(guardId, !currentActive)
            await loadData()
        } catch (error) {
            console.error('Error en toggleStatus:', error)
            alert('Error al cambiar estado del guardia')
        }
    }

    const filteredActivities = activities.filter(a => {
        const matchesSearch = a.guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.guard.email.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="guards-container">
            <h1 className="guards-title">Actividad de Guardias</h1>
            <p className="guards-subtitle">
                Monitorea el rendimiento y actividad del personal de seguridad
            </p>

            {stats && (
                <div className="stats-grid">
                    <StatCard title="Total Guardias" value={stats.total_guards} icon="👥" color="blue" />
                    <StatCard title="Activos" value={stats.active_guards} icon="✅" color="green" />
                    <StatCard title="Total Accesos" value={stats.total_access} icon="📋" color="purple" />
                    <StatCard title="Hoy" value={stats.today_access} icon="📅" color="orange" />
                    <StatCard title="Promedio" value={stats.avg_per_guard} icon="📊" color="indigo" />
                </div>
            )}

            <div className="filters-container">
                <div className="filters-grid">
                    <div>
                        <label className="filter-label">Buscar guardia</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nombre o email..."
                            className="filter-input"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setSearchTerm('')}
                            className="filter-button"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={loadData}
                            className="filter-button"
                            style={{ marginLeft: '8px' }}
                        >
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {filteredActivities.length === 0 ? (
                <div className="empty-state">
                    No hay guardias que coincidan con la búsqueda
                </div>
            ) : (
                <div className="guards-grid">
                    {filteredActivities.map(activity => (
                        <GuardCard
                            key={activity.guard.id}
                            activity={activity}
                            isAdmin={isAdmin}
                            onToggleStatus={handleToggleStatus}
                            onClick={() => setSelectedGuard(
                                selectedGuard === activity.guard.id ? null : activity.guard.id
                            )}
                            expanded={selectedGuard === activity.guard.id}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// StatCard component con estilos personalizados
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = 
    ({ title, value, icon, color }) => {
        return (
            <div className={`stat-card ${color}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="stat-title">{title}</p>
                        <p className="stat-value">{value}</p>
                    </div>
                    <span className="stat-icon">{icon}</span>
                </div>
            </div>
        )
    }

// GuardCard component con estilos personalizados
const GuardCard: React.FC<{
    activity: GuardActivity
    isAdmin: boolean
    onToggleStatus: (id: string, active: boolean) => void
    onClick: () => void
    expanded: boolean
}> = ({ activity, isAdmin, onToggleStatus, onClick, expanded }) => {
    const { guard, total_access, last_access, logs } = activity

    return (
        <div className="guard-card">
            <div onClick={onClick}>
                <div className="guard-header">
                    <div className="guard-info">
                        <div className="guard-avatar">
                            {guard.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="guard-name">{guard.name}</h3>
                            <p className="guard-email">{guard.email}</p>
                        </div>
                    </div>
                    <div className="guard-stats">
                        <p className="guard-stats-label">Accesos</p>
                        <p className="guard-stats-value">{total_access}</p>
                    </div>
                </div>
                
                <p className="guard-last-access">
                    Último: {last_access || 'Nunca'}
                </p>
                
                {isAdmin && (
                    <div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleStatus(guard.id, guard.active)
                            }}
                            className={`guard-status ${guard.active ? 'status-active' : 'status-inactive'}`}
                        >
                            {guard.active ? 'Activo' : 'Inactivo'}
                        </button>
                    </div>
                )}
            </div>
            
            {expanded && (
                <div className="guard-details">
                    <h4 className="details-title">Últimos accesos:</h4>
                    {logs.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '12px' }}>Sin accesos</p>
                    ) : (
                        logs.slice(0, 3).map((log, idx) => (
                            <div key={idx} className="log-item">
                                <span className="log-date">{log.date}</span>
                                <span className="log-visitor">
                                    {log.visits?.visitor_name || 'Visitante'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminGuards
