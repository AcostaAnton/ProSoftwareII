import type {
    ChangeEvent,
    CSSProperties,
    ReactNode
} from 'react'
import QRGenerator from '../../components/shared/QRGenerator'
import type { Visit } from '../../types/index'
import { formatDate, formatPhone, formatTime } from '../../utils/formatDate'
import {
    getVisitStatusColor,
    getVisitStatusLabel,
    VISIT_STATUS_OPTIONS
} from './visitStatus.helpers'

interface VisitDetailViewProps {
    error: string | null
    isAdmin: boolean
    isUpdating: boolean
    loading: boolean
    newStatus: Visit['status']
    showQRModal: boolean
    showSuccessModal: boolean
    visit: Visit | null
    onBack: () => void
    onCloseQR: () => void
    onCloseSuccess: () => void
    onOpenQR: () => void
    onSaveStatus: () => void
    onStatusChange: (status: Visit['status']) => void
}

interface DetailFieldProps {
    children: ReactNode
    label: string
}

interface SectionProps {
    children: ReactNode
    title: string
}

const styles = {
    page: {
        backgroundColor: '#080c0f',
        minHeight: '100vh',
        padding: '20px',
        color: '#ffffff'
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto'
    },
    message: {
        padding: '15px',
        backgroundColor: '#2a3034',
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        color: '#ff6b6b',
        marginBottom: '20px'
    },
    card: {
        backgroundColor: '#1a2024',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    sectionTitle: {
        color: '#22d3ee',
        marginBottom: '15px'
    },
    sectionContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    fieldLabel: {
        display: 'block',
        color: '#a0a0a0',
        fontSize: '14px',
        marginBottom: '5px'
    },
    fieldValue: {
        margin: 0,
        fontSize: '16px'
    },
    systemValue: {
        margin: 0,
        fontSize: '12px',
        color: '#808080',
        fontFamily: 'monospace'
    },
    tokenValue: {
        margin: 0,
        fontSize: '12px',
        color: '#808080',
        fontFamily: 'monospace',
        wordBreak: 'break-all'
    },
    sectionDivider: {
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #2a3034'
    },
    actionRow: {
        display: 'flex',
        gap: '10px'
    },
    primaryButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#22d3ee',
        color: '#000000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    secondaryButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#2a3034',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    smallButton: {
        padding: '8px 16px',
        backgroundColor: '#2a3034',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '20px'
    },
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    statusBadge: {
        padding: '6px 12px',
        color: '#ffffff',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    statusSelect: {
        padding: '4px 8px',
        borderRadius: '4px',
        background: '#1a2024',
        color: '#ffffff',
        border: '1px solid #334155'
    },
    saveButton: {
        marginLeft: '10px',
        padding: '6px 12px',
        backgroundColor: '#22c55e',
        color: '#080c0f',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
    },
    modalCard: {
        backgroundColor: '#1a2024',
        padding: '30px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
    },
    modalText: {
        color: '#ffffff',
        marginBottom: '25px'
    }
} satisfies Record<string, CSSProperties>

function DetailField({ children, label }: DetailFieldProps) {
    return (
        <div>
            <label style={styles.fieldLabel}>{label}</label>
            {children}
        </div>
    )
}

function Section({ children, title }: SectionProps) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>{title}</h3>
            <div style={styles.sectionContent}>{children}</div>
        </div>
    )
}

function renderStatusOptions() {
    const options = []

    for (const statusOption of VISIT_STATUS_OPTIONS) {
        options.push(
            <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
            </option>
        )
    }

    return options
}

function LoadingState() {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <p>Cargando detalles de la visita...</p>
            </div>
        </div>
    )
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.message}>Error: {error}</div>
                <button onClick={onBack} style={styles.secondaryButton}>
                    Volver a lista de visitas
                </button>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <p>Visita no encontrada</p>
            </div>
        </div>
    )
}

function VisitDetailView({
    error,
    isAdmin,
    isUpdating,
    loading,
    newStatus,
    showQRModal,
    showSuccessModal,
    visit,
    onBack,
    onCloseQR,
    onCloseSuccess,
    onOpenQR,
    onSaveStatus,
    onStatusChange
}: VisitDetailViewProps) {
    if (loading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} onBack={onBack} />
    }

    if (!visit) {
        return <EmptyState />
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={{ marginBottom: '30px' }}>
                    <button onClick={onBack} style={styles.smallButton}>
                        Volver
                    </button>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Detalles de la Visita</h1>
                </div>

                <div style={styles.card}>
                    <div style={styles.sectionDivider}>
                        <div style={styles.statusRow}>
                            <span style={{ color: '#a0a0a0' }}>Estado:</span>
                            {isAdmin ? (
                                <>
                                    <select
                                        value={newStatus}
                                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                            onStatusChange(event.target.value as Visit['status'])
                                        }
                                        style={styles.statusSelect}
                                    >
                                        {renderStatusOptions()}
                                    </select>
                                    <button
                                        onClick={onSaveStatus}
                                        disabled={isUpdating}
                                        style={styles.saveButton}
                                    >
                                        {isUpdating ? '...' : 'Guardar'}
                                    </button>
                                </>
                            ) : (
                                <span
                                    style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getVisitStatusColor(visit.status)
                                    }}
                                >
                                    {getVisitStatusLabel(visit.status)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Section title="Informacion del Visitante">
                            <DetailField label="Nombre">
                                <p style={styles.fieldValue}>{visit.visitor_name}</p>
                            </DetailField>
                            <DetailField label="Telefono">
                                <p style={styles.fieldValue}>
                                    {formatPhone(visit.visitor_phone) || 'No proporcionado'}
                                </p>
                            </DetailField>
                        </Section>
                    </div>

                    <div style={styles.sectionDivider}>
                        <Section title="Informacion de la Visita">
                            <DetailField label="Fecha">
                                <p style={styles.fieldValue}>{formatDate(visit.visit_date)}</p>
                            </DetailField>
                            <DetailField label="Hora">
                                <p style={styles.fieldValue}>{formatTime(visit.visit_time)}</p>
                            </DetailField>
                            <DetailField label="Asunto">
                                <p style={styles.fieldValue}>{visit.visit_purpose || 'No especificado'}</p>
                            </DetailField>
                            <DetailField label="Destino">
                                <p style={styles.fieldValue}>{visit.visit_destination || 'No especificado'}</p>
                            </DetailField>
                        </Section>
                    </div>

                    <Section title="Informacion del Sistema">
                        <DetailField label="ID de Visita">
                            <p style={styles.systemValue}>{visit.id}</p>
                        </DetailField>
                        <DetailField label="Creado">
                            <p style={styles.fieldValue}>{formatDate(visit.created_at)}</p>
                        </DetailField>
                        <DetailField label="Token QR">
                            <p style={styles.tokenValue}>{visit.qr_token}</p>
                        </DetailField>
                    </Section>
                </div>

                <div style={styles.actionRow}>
                    <button onClick={onOpenQR} style={styles.primaryButton}>
                        Ver QR
                    </button>
                    <button onClick={onBack} style={styles.secondaryButton}>
                        Volver a Visitas
                    </button>
                </div>
            </div>

            {showSuccessModal && (
                <div style={styles.modalBackdrop}>
                    <div style={styles.modalCard}>
                        <h3 style={{ color: '#22d3ee', marginBottom: '20px' }}>Cambios realizados</h3>
                        <p style={styles.modalText}>
                            El estado de la visita ha sido actualizado correctamente.
                        </p>
                        <button onClick={onCloseSuccess} style={styles.primaryButton}>
                            OK
                        </button>
                    </div>
                </div>
            )}

            {showQRModal && (
                <QRGenerator
                    visit={visit}
                    mode="modal"
                    onClose={onCloseQR}
                />
            )}
        </div>
    )
}

export default VisitDetailView
