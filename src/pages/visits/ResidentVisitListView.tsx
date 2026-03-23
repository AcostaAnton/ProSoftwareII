import type { CSSProperties, MouseEvent } from 'react'
import type { Visit } from '../../types/index'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getVisitStatusColor, getVisitStatusLabel } from './visitStatus.helpers'
import { Button } from '../../components/ui/Button'
import type { ResidentTab } from './residentVisit.types'

interface ResidentVisitListViewProps {
    activeTab: ResidentTab
    cancellingId: string | null
    confirmCancelId: string | null
    error: string | null
    historyVisits: Visit[]
    loading: boolean
    manageableVisits: Visit[]
    upcomingVisits: Visit[]
    onCancelConfirm: () => void
    onCancelDismiss: () => void
    onRequestCancel: (visitId: string) => void
    onTabChange: (tab: ResidentTab) => void
    onVisitSelect: (visitId: string) => void
}

const styles = {
    page: {
        backgroundColor: '#080c0f',
        minHeight: '100vh',
        padding: '24px 20px',
        color: '#ffffff'
    } as CSSProperties,
    container: {
        maxWidth: '820px',
        margin: '0 auto'
    } as CSSProperties,
    header: {
        marginBottom: '28px'
    } as CSSProperties,
    title: {
        fontSize: '30px',
        fontWeight: 700,
        margin: '0 0 6px 0',
        background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    } as CSSProperties,
    subtitle: {
        color: '#64748b',
        fontSize: '14px',
        margin: 0
    } as CSSProperties,
    tabBar: {
        display: 'flex',
        gap: '4px',
        backgroundColor: '#111518',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '24px',
        border: '1px solid #1e2a33'
    } as CSSProperties,
    tabButton: (active: boolean): CSSProperties => ({
        flex: 1,
        padding: '10px 14px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        backgroundColor: active ? '#1e3a5f' : 'transparent',
        color: active ? '#60a5fa' : '#64748b',
        boxShadow: active ? '0 0 0 1px rgba(96,165,250,0.3)' : 'none'
    }),
    visitList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    } as CSSProperties,
    card: {
        backgroundColor: '#111518',
        borderRadius: '12px',
        border: '1px solid #1e2a33',
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s'
    } as CSSProperties,
    cardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px'
    } as CSSProperties,
    visitorName: {
        fontSize: '17px',
        fontWeight: 700,
        margin: '0 0 4px 0',
        color: '#f1f5f9'
    } as CSSProperties,
    cardMeta: {
        color: '#64748b',
        fontSize: '13px',
        margin: '0 0 2px 0'
    } as CSSProperties,
    statusBadge: (color: string): CSSProperties => ({
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: color,
        color: '#000000',
        whiteSpace: 'nowrap',
        flexShrink: 0
    }),
    cancelBtn: {
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'flex-end'
    } as CSSProperties,
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#475569'
    } as CSSProperties,
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '12px'
    } as CSSProperties,
    emptyText: {
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 6px 0'
    } as CSSProperties,
    emptyHint: {
        fontSize: '13px',
        margin: 0
    } as CSSProperties,
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    } as CSSProperties,
    modal: {
        backgroundColor: '#111518',
        border: '1px solid #1e2a33',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '380px',
        width: '90%',
        textAlign: 'center'
    } as CSSProperties,
    modalTitle: {
        fontSize: '20px',
        fontWeight: 700,
        margin: '0 0 10px 0',
        color: '#f1f5f9'
    } as CSSProperties,
    modalText: {
        color: '#94a3b8',
        fontSize: '14px',
        margin: '0 0 22px 0'
    } as CSSProperties,
    modalActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
    } as CSSProperties
}

interface VisitCardProps {
    cancelling: boolean
    showCancel: boolean
    visit: Visit
    onRequestCancel: (id: string) => void
    onVisitSelect: (id: string) => void
}

function VisitCard({ cancelling, showCancel, visit, onRequestCancel, onVisitSelect }: VisitCardProps) {
    function handleClick() {
        onVisitSelect(visit.id)
    }

    function handleCancelClick(e: MouseEvent) {
        e.stopPropagation()
        onRequestCancel(visit.id)
    }

    function handleMouseEnter(e: MouseEvent<HTMLDivElement>) {
        e.currentTarget.style.borderColor = '#334155'
        e.currentTarget.style.backgroundColor = '#161c21'
    }

    function handleMouseLeave(e: MouseEvent<HTMLDivElement>) {
        e.currentTarget.style.borderColor = '#1e2a33'
        e.currentTarget.style.backgroundColor = '#111518'
    }

    return (
        <div
            style={styles.card}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={styles.cardRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={styles.visitorName}>{visit.visitor_name}</h3>
                    <p style={styles.cardMeta}>
                        📅 {formatDate(visit.visit_date)}
                        {visit.visit_time ? ` · 🕐 ${formatTime(visit.visit_time)}` : ''}
                    </p>
                    {visit.visit_purpose && (
                        <p style={styles.cardMeta}>📝 {visit.visit_purpose}</p>
                    )}
                </div>
                <div style={styles.statusBadge(getVisitStatusColor(visit.status))}>
                    {getVisitStatusLabel(visit.status)}
                </div>
            </div>
            {showCancel && (
                <div style={styles.cancelBtn}>
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleCancelClick}
                        disabled={cancelling}
                        style={{ borderRadius: 6, fontSize: 13, padding: '6px 14px' }}
                    >
                        {cancelling ? 'Cancelando...' : 'Cancelar visita'}
                    </Button>
                </div>
            )}
        </div>
    )
}

function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
    return (
        <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>{icon}</div>
            <p style={styles.emptyText}>{title}</p>
            <p style={styles.emptyHint}>{hint}</p>
        </div>
    )
}

function CancelConfirmModal({ onConfirm, onDismiss }: { onConfirm: () => void; onDismiss: () => void }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <p style={styles.modalTitle}>¿Cancelar visita?</p>
                <p style={styles.modalText}>
                    Esta acción no se puede deshacer. La visita quedará marcada como cancelada.
                </p>
                <div style={styles.modalActions}>
                    <Button type="button" variant="secondary" onClick={onDismiss} style={{ borderRadius: 8, padding: '8px 20px' }}>
                        Regresar
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} style={{ borderRadius: 8, padding: '8px 20px' }}>
                        Sí, cancelar
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
                    icon="📅"
                    title="Sin próximas visitas"
                    hint="Crea una nueva visita desde el menú lateral."
                />
            )
        }
        return (
            <div style={styles.visitList}>
                {upcomingVisits.map((v) => (
                    <VisitCard
                        key={v.id}
                        visit={v}
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
                    icon="🕰️"
                    title="Sin historial de visitas"
                    hint="Aquí aparecerán tus visitas pasadas."
                />
            )
        }
        return (
            <div style={styles.visitList}>
                {historyVisits.map((v) => (
                    <VisitCard
                        key={v.id}
                        visit={v}
                        showCancel={false}
                        cancelling={false}
                        onRequestCancel={onRequestCancel}
                        onVisitSelect={onVisitSelect}
                    />
                ))}
            </div>
        )
    }

    // manage tab
    if (manageableVisits.length === 0) {
        return (
            <EmptyState
                icon="✅"
                title="No hay visitas por gestionar"
                hint="Solo aparecen visitas futuras pendientes o aprobadas."
            />
        )
    }
    return (
        <div style={styles.visitList}>
            {manageableVisits.map((v) => (
                <VisitCard
                    key={v.id}
                    visit={v}
                    showCancel
                    cancelling={cancellingId === v.id}
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
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <p style={{ color: '#64748b' }}>Cargando tus visitas...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <p style={{ color: '#ef4444' }}>Error: {error}</p>
                </div>
            </div>
        )
    }

    const TABS: { id: ResidentTab; label: string; count: number }[] = [
        { id: 'upcoming', label: '📅 Próximas', count: upcomingVisits.length },
        { id: 'history', label: '🕰️ Historial', count: historyVisits.length },
        { id: 'manage', label: '⚙️ Gestionar', count: manageableVisits.length }
    ]

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Mis Visitas</h1>
                    <p style={styles.subtitle}>Consulta y gestiona todas las visitas registradas a tu nombre.</p>
                </div>

                <div style={styles.tabBar}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            style={styles.tabButton(activeTab === tab.id)}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span style={{
                                    marginLeft: '6px',
                                    backgroundColor: activeTab === tab.id ? 'rgba(96,165,250,0.2)' : 'rgba(100,116,139,0.2)',
                                    borderRadius: '10px',
                                    padding: '1px 7px',
                                    fontSize: '12px'
                                }}>
                                    {tab.count}
                                </span>
                            )}
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
            </div>

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
