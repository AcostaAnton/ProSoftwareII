import StatCard from './StatCard'
import { cn } from '../../lib/cn'

export type DashboardStatVariant = 'total' | 'pending' | 'approved' | 'done'

export type DashboardStat = {
  title: string
  value: number
  variant: DashboardStatVariant
}

type DashboardStatsPanelProps = {
  stats: DashboardStat[]
}

export default function DashboardStatsPanel({ stats }: DashboardStatsPanelProps) {
  return (
    <div
      className={cn(
        'dashboard-stats-grid mb-5 grid min-w-0 grid-cols-1 gap-3 max-[419px]:grid-cols-1 min-[420px]:grid-cols-2 xl:mb-7 xl:grid-cols-4 xl:gap-4',
      )}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          variant={stat.variant}
        />
      ))}
    </div>
  )
}
