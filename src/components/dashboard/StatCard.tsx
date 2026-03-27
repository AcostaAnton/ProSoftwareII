import type { DashboardStatVariant } from './DashboardStatsPanel'
import { useCountUp } from '../../hooks/useCountUp'

const VARIANT_ICON: Record<DashboardStatVariant, string> = {
  total: '📋',
  pending: '⏳',
  approved: '✅',
  done: '🏁',
}

type StatCardProps = {
  title: string
  value: number
  variant: DashboardStatVariant
}

export default function StatCard({ title, value, variant }: StatCardProps) {
  const display = useCountUp(value)

  const mod = `dashboard-kpi-card--${variant}`

  return (
    <div className={`dashboard-kpi-card ${mod}`}>
      <div className="dashboard-kpi-glow" aria-hidden />
      <div className="dashboard-kpi-icon">{VARIANT_ICON[variant]}</div>
      <div className="dashboard-kpi-num">{display}</div>
      <div className="dashboard-kpi-label">{title}</div>
      {variant === 'total' ? (
        <div
          className="stat-trend up"
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--green)',
          }}
        >
          ↑ este mes
        </div>
      ) : null}
    </div>
  )
}
