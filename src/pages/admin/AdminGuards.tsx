import React, { useState, useEffect, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import {
  IconGuardTotal,
  IconGuardActive,
  IconGuardAccess,
  IconGuardToday,
  IconGuardAvg,
} from './AdminSectionIcons'
import { guardsService } from '../../services/guards.service'
import type { GuardActivity } from '../../services/guards.service'
import { useAuth } from '../../hooks/useAuth'
import { useCountUp } from '../../hooks/useCountUp'
import { cn } from '../../lib/cn'

type StatsType = {
  total_guards: number
  active_guards: number
  total_access: number
  today_access: number
  avg_per_guard: number
}

const STAT_COLORS = ['blue', 'green', 'purple', 'orange', 'indigo'] as const

function GuardsStatSkeletonRow() {
  return (
    <>
      {STAT_COLORS.map((color) => (
        <div key={color} className={`stat-card ${color}`}>
          <div className="guards-stat-skeleton-inner">
            <div className={`guards-stat-icon-wrap guards-stat-icon-wrap--${color}`}>
              <div className="guards-skeleton-pulse guards-stat-skeleton-icon" />
            </div>
            <div className="guards-stat-text min-w-0 flex-1">
              <div className="guards-skeleton-pulse guards-stat-skeleton-line guards-stat-skeleton-line--sm" />
              <div className="guards-skeleton-pulse guards-stat-skeleton-line guards-stat-skeleton-line--lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function GuardCardSkeleton() {
  return (
    <div className="guard-card-skeleton">
      <div className="guard-card-skeleton-row">
        <div className="flex items-center gap-3 min-w-0">
          <div className="guards-skeleton-pulse guard-card-skeleton-avatar" />
          <div className="guard-card-skeleton-lines space-y-2">
            <div className="guards-skeleton-pulse h-3.5 w-[55%] rounded" />
            <div className="guards-skeleton-pulse h-3 w-[80%] rounded" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="guards-skeleton-pulse h-2.5 w-12 rounded ml-auto" />
          <div className="guards-skeleton-pulse h-5 w-8 rounded ml-auto" />
        </div>
      </div>
      <div className="guards-skeleton-pulse guard-card-skeleton-footer" />
    </div>
  )
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
      const [activitiesData, statsData] = await Promise.all([
        guardsService.getGuardsActivity(),
        guardsService.getStats(),
      ])
      setActivities(activitiesData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      console.error('Error en loadData:', err)
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
    } catch (err) {
      console.error('Error en toggleStatus:', err)
      alert('Error al cambiar estado del guardia')
    }
  }

  const filteredActivities = activities.filter(
    (a) =>
      a.guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.guard.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isInitialLoading = loading && stats === null
  const isRefreshing = loading && stats !== null

  return (
    <div className="guards-container guards-minimal">
      <div className="animate-[fadeUp_0.4s_ease_both]">
        <h1 className="guards-title">Actividad de Guardias</h1>
        <p className="guards-subtitle">
          Monitorea el rendimiento y actividad del personal de seguridad
        </p>
      </div>

      {isRefreshing && (
        <p className="guards-refresh-hint" role="status">
          Actualizando datos…
        </p>
      )}

      {isInitialLoading ? (
        <div className="stats-grid">
          <GuardsStatSkeletonRow />
        </div>
      ) : stats ? (
        <div className="stats-grid">
          <StatCard title="Total Guardias" value={stats.total_guards} icon={<IconGuardTotal />} color="blue" />
          <StatCard title="Activos" value={stats.active_guards} icon={<IconGuardActive />} color="green" />
          <StatCard title="Total Accesos" value={stats.total_access} icon={<IconGuardAccess />} color="purple" />
          <StatCard title="Hoy" value={stats.today_access} icon={<IconGuardToday />} color="orange" />
          <StatCard title="Promedio" value={stats.avg_per_guard} icon={<IconGuardAvg />} color="indigo" />
        </div>
      ) : null}

      <div
        className={cn('filters-container', isInitialLoading && 'guards-filters--initial-loading')}
      >
        <div className="filters-grid">
          <div style={{ flex: 1 }}>
            <label className="filter-label">Buscar guardia</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o email..."
              className="filter-input"
              disabled={isInitialLoading}
            />
          </div>
          <div className="filter-buttons">
            <Button type="button" variant="outline" size="sm" onClick={() => setSearchTerm('')} disabled={isInitialLoading}>
              Limpiar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={loadData}
              style={{ boxShadow: 'none' }}
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isInitialLoading ? (
        <div className="guards-grid">
          <GuardCardSkeleton />
          <GuardCardSkeleton />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="empty-state">
          No hay guardias que coincidan con la búsqueda
        </div>
      ) : (
        <div className="guards-grid">
          {filteredActivities.map((activity, idx) => (
            <GuardCard
              key={activity.guard.id}
              activity={activity}
              isAdmin={isAdmin}
              onToggleStatus={handleToggleStatus}
              onClick={() =>
                setSelectedGuard(selectedGuard === activity.guard.id ? null : activity.guard.id)
              }
              expanded={selectedGuard === activity.guard.id}
              enterDelay={idx}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const StatCard: React.FC<{ title: string; value: number; icon: ReactNode; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => {
  const display = useCountUp(value)
  return (
    <div className={`stat-card ${color}`}>
      <div className="guards-stat-row">
        <div className={`guards-stat-icon-wrap guards-stat-icon-wrap--${color}`}>{icon}</div>
        <div className="guards-stat-text">
          <p className="stat-title">{title}</p>
          <p className="stat-value">{display}</p>
        </div>
      </div>
    </div>
  )
}

const GuardCard: React.FC<{
  activity: GuardActivity
  isAdmin: boolean
  onToggleStatus: (id: string, active: boolean) => void
  onClick: () => void
  expanded: boolean
  enterDelay: number
}> = ({ activity, isAdmin, onToggleStatus, onClick, expanded, enterDelay }) => {
  const { guard, total_access, last_access, logs } = activity
  const accessDisplay = useCountUp(total_access)

  return (
    <div
      className="guard-card sidebar-nav-animate"
      style={{ animationDelay: `${0.05 + enterDelay * 0.05}s` }}
    >
      <div onClick={onClick}>
        <div className="guard-header">
          <div className="guard-info">
            <div className="guard-avatar">
              {guard.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="guard-name">{guard.name}</h3>
              <p className="guard-email">{guard.email}</p>
            </div>
          </div>
          <div className="guard-stats">
            <p className="guard-stats-label">Accesos</p>
            <p className="guard-stats-value">{accessDisplay}</p>
          </div>
        </div>

        <p className="guard-last-access">Último: {last_access || 'Nunca'}</p>

        {isAdmin && (
          <div>
            <Button
              type="button"
              variant="unstyled"
              onClick={(e) => {
                e.stopPropagation()
                onToggleStatus(guard.id, guard.active)
              }}
              className={`guard-status ${guard.active ? 'status-active' : 'status-inactive'}`}
            >
              {guard.active ? 'Activo' : 'Inactivo'}
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="guard-details">
          <h4 className="details-title">Últimos accesos:</h4>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Sin accesos</p>
          ) : (
            logs.slice(0, 3).map((log, idx) => (
              <div key={idx} className="log-item">
                <span className="log-date">{log.date}</span>
                <span className="log-visitor">{log.visits?.visitor_name || 'Visitante'}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminGuards
