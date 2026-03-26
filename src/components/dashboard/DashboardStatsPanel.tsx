import StatCard from './StatCard'

export type DashboardStat = {
  title: string
  value: number
  accentColor: string
}

type DashboardStatsPanelProps = {
  stats: DashboardStat[]
}

export default function DashboardStatsPanel({
  stats,
}: DashboardStatsPanelProps) {
  return (
    <div
      className="dashboard-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          accentColor={stat.accentColor}
        />
      ))}
    </div>
  )
}
