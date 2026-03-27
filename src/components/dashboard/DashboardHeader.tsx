import { cn } from '../../lib/cn'

type DashboardHeaderProps = {
  userName: string
  secondaryText: string
  showNewVisitButton?: boolean
  onNewVisit?: () => void
}

export default function DashboardHeader({
  userName,
  secondaryText,
  showNewVisitButton = false,
  onNewVisit,
}: DashboardHeaderProps) {
  const firstName = userName.trim().split(' ')[0] || 'Usuario'

  return (
    <div
      className={cn(
        'mb-6 flex animate-[fadeUp_0.4s_ease_both] flex-col items-stretch justify-between gap-4 sm:mb-7 md:flex-row md:items-end',
      )}
    >
      <div className="min-w-0">
        <h1 className="font-syne m-0 text-xl font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-2xl md:text-[28px]">
          Bienvenido,{' '}
          <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">
            {firstName}
          </span>{' '}
          👋
        </h1>
        <p className="mb-0 mt-1.5 text-[13px] font-light leading-relaxed text-[var(--muted)]">
          {secondaryText}
        </p>
      </div>
      {showNewVisitButton ? (
        <button
          type="button"
          onClick={onNewVisit}
          className={cn(
            'font-syne inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-[13px] font-bold tracking-wide text-[#08130f]',
            'bg-gradient-to-br from-[var(--accent-cyan)] to-[#00c4ad] shadow-[0_4px_20px_rgba(0,229,200,0.3)] transition-all duration-200',
            'hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(0,229,200,0.4)]',
            'w-full md:w-auto',
          )}
        >
          ＋ Nueva Visita
        </button>
      ) : null}
    </div>
  )
}
