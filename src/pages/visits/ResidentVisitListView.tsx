import type { MouseEvent } from 'react'
import { Button } from '../../components/ui/Button'
import type { VisitCardDto } from './visitCard.dto'
import type { ResidentTab } from './residentVisit.types'
import './visitPages.css'

interface ResidentVisitListViewProps {
    activeTab: ResidentTab
    cancellingId: string | null
    confirmCancelId: string | null
    error: string | null
    historyVisits: VisitCardDto[]
    loading: boolean
    manageableVisits: VisitCardDto[]
    upcomingVisits: VisitCardDto[]
    onCancelConfirm: () => void
    onCancelDismiss: () => void
    onRequestCancel: (visitId: string) => void
    onTabChange: (tab: ResidentTab) => void
    onVisitSelect: (visitId: string) => void
}

interface ResidentVisitCardProps {
    cancelling: boolean
    showCancel: boolean
    visit: VisitCardDto
    onRequestCancel: (visitId: string) => void
    onVisitSelect: (visitId: string) => void
}

interface EmptyStateProps {
    hint: string
    title: string
}

function LoadingState() {
    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-state-card">Cargando tus visitas...</div>
            </section>
        </div>
    )
}

function ErrorState({ error }: { error: string }) {
    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-state-card visit-state-card--error">{error}</div>
            </section>
        </div>
    )
}

function ResidentVisitCard({
    cancelling,
    showCancel,
    visit,
    onRequestCancel,
    onVisitSelect
}: ResidentVisitCardProps) {
    function handleSelect() {
        onVisitSelect(visit.id)
    }

    function handleCancelClick(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation()
        onRequestCancel(visit.id)
    }

    return (
        <article className="resident-visit-card">
            <button
                type="button"
                onClick={handleSelect}
                className="resident-visit-card-button"
            >
                <div className="resident-visit-card-header">
                    <div className="resident-visit-card-copy">
                        <h3 className="resident-visit-card-title">{visit.visitorName}</h3>
                        <p className="resident-visit-card-meta">
                            {visit.visitDateLabel}
                            {visit.visitTimeLabel ? ` · ${visit.visitTimeLabel}` : ''}
                        </p>
                        {visit.visitPurpose && (
                            <p className="resident-visit-card-meta resident-visit-card-meta--soft">
                                {visit.visitPurpose}
                            </p>
                        )}
                    </div>

                    <span
                        className="visit-status-badge"
                        style={{
                            backgroundColor: visit.statusColor,
                            color: '#082f49'
                        }}
                    >
                        {visit.statusLabel}
                    </span>
                </div>
            </button>

            {showCancel && (
                <div className="resident-visit-card-actions">
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleCancelClick}
                        disabled={cancelling}
                        className="visit-rounded-button visit-rounded-button--sm"
                    >
                        {cancelling ? 'Cancelando...' : 'Cancelar visita'}
                    </Button>
                </div>
            )}
        </article>
    )
}

function EmptyState({ hint, title }: EmptyStateProps) {
    return (
        <div className="visit-state-card resident-visit-empty-state">
            <p className="resident-visit-empty-title">{title}</p>
            <p className="resident-visit-empty-hint">{hint}</p>
        </div>
    )
}

function CancelConfirmModal({ onConfirm, onDismiss }: { onConfirm: () => void; onDismiss: () => void }) {
    return (
        <div className="visit-modal-backdrop">
            <div className="visit-modal-card">
                <h3 className="visit-modal-title">Cancelar visita</h3>
                <p className="visit-modal-text">
                    Esta accion no se puede deshacer. La visita quedara marcada como cancelada.
                </p>
                <div className="visit-modal-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onDismiss}
                        className="visit-rounded-button"
                    >
                        Regresar
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        className="visit-rounded-button"
                    >
                        Si, cancelar
                    </Button>
                </div>
            </div>
        </div>
    )
}

function TabContent({
    activeTab,
    cancellingId,
    historyVisits,
    manageableVisits,
    upcomingVisits,
    onRequestCancel,
    onVisitSelect
}: Pick<ResidentVisitListViewProps, 'activeTab' | 'cancellingId' | 'historyVisits' | 'manageableVisits' | 'upcomingVisits' | 'onRequestCancel' | 'onVisitSelect'>) {
    if (activeTab === 'upcoming') {
        if (upcomingVisits.length === 0) {
            return (
                <EmptyState
                    title="Sin proximas visitas"
                    hint="Aqui apareceran tus visitas pendientes o aprobadas."
                />
            )
        }

        return (
            <div className="resident-visit-list">
                {upcomingVisits.map((visit) => (
                    <ResidentVisitCard
                        key={visit.id}
                        visit={visit}
                        showCancel={false}
                        cancelling={false}
                        onRequestCancel={onRequestCancel}
                        onVisitSelect={onVisitSelect}
                    />
                ))}
            </div>
        )
    }

    if (activeTab === 'history') {
        if (historyVisits.length === 0) {
            return (
                <EmptyState
                    title="Sin historial de visitas"
                    hint="Tus visitas pasadas apareceran en esta seccion."
                />
            )
        }

        return (
            <div className="resident-visit-list">
                {historyVisits.map((visit) => (
                    <ResidentVisitCard
                        key={visit.id}
                        visit={visit}
                        showCancel={false}
                        cancelling={false}
                        onRequestCancel={onRequestCancel}
                        onVisitSelect={onVisitSelect}
                    />
                ))}
            </div>
        )
    }

    if (manageableVisits.length === 0) {
        return (
            <EmptyState
                title="No hay visitas por gestionar"
                hint="Solo aparecen visitas futuras con estado pendiente o aprobado."
            />
        )
    }

    return (
        <div className="resident-visit-list">
            {manageableVisits.map((visit) => (
                <ResidentVisitCard
                    key={visit.id}
                    visit={visit}
                    showCancel
                    cancelling={cancellingId === visit.id}
                    onRequestCancel={onRequestCancel}
                    onVisitSelect={onVisitSelect}
                />
            ))}
        </div>
    )
}

function ResidentVisitListView({
    activeTab,
    cancellingId,
    confirmCancelId,
    error,
    historyVisits,
    loading,
    manageableVisits,
    upcomingVisits,
    onCancelConfirm,
    onCancelDismiss,
    onRequestCancel,
    onTabChange,
    onVisitSelect
}: ResidentVisitListViewProps) {
    if (loading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} />
    }

    const tabs: Array<{ count: number; id: ResidentTab; label: string }> = [
        { id: 'upcoming', label: 'Proximas', count: upcomingVisits.length },
        { id: 'history', label: 'Historial', count: historyVisits.length },
        { id: 'manage', label: 'Gestionar', count: manageableVisits.length }
    ]

    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-panel-header">
                    <div>
                        <h1 className="visit-panel-title">Mis visitas</h1>
                        <p className="visit-panel-note">
                            Consulta y gestiona todas las visitas registradas a tu nombre.
                        </p>
                    </div>
                </div>

                <div className="resident-visit-tab-bar" role="tablist" aria-label="Categorias de visitas">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`resident-visit-tab${activeTab === tab.id ? ' resident-visit-tab--active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                        >
                            <span>{tab.label}</span>
                            <span className="resident-visit-tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>

                <TabContent
                    activeTab={activeTab}
                    cancellingId={cancellingId}
                    historyVisits={historyVisits}
                    manageableVisits={manageableVisits}
                    upcomingVisits={upcomingVisits}
                    onRequestCancel={onRequestCancel}
                    onVisitSelect={onVisitSelect}
                />
            </section>

            {confirmCancelId && (
                <CancelConfirmModal
                    onConfirm={onCancelConfirm}
                    onDismiss={onCancelDismiss}
                />
            )}
        </div>
    )
}

export default ResidentVisitListView
