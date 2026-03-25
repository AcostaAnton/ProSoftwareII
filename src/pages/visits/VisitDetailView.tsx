import {
    useState,
    type ChangeEvent,
    type CSSProperties,
    type ReactNode
} from 'react'
import QRGenerator from '../../components/shared/QRGenerator'
import type {
    VisitAccessLogRecord,
    VisitDetailRecord,
    VisitQrDisplayData,
    VisitStatusHistoryRecord
} from '../../services/visits.service'
import type { Visit } from '../../types/index'
import { formatDate, formatPhone, formatTime } from '../../utils/formatDate'
import { getQrInvitationLines } from '../../utils/qrInvitationMessage'
import {
    getVisitStatusColor,
    getVisitStatusLabel,
    VISIT_STATUS_OPTIONS
} from './visitStatus.helpers'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../services/supabase'

interface VisitDetailViewProps {
    error: string | null
    isAdmin: boolean
    isUpdating: boolean
    loading: boolean
    newStatus: Visit['status']
    showQRModal: boolean
    showSuccessModal: boolean
    visit: VisitDetailRecord | null
    qrDisplay: VisitQrDisplayData | null
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

function getPhotoUrl(path: string) {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('visit-photos').getPublicUrl(path)
    return data.publicUrl
}

// Componente para manejar errores de carga de imagen
function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false)

    if (error || !src) {
        return (
            <div style={{ 
                width: '100%', height: 200, background: '#0f172a', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', borderRadius: 8, border: '1px dashed #334155'
            }}>
                <span style={{ fontSize: 24, marginBottom: 8 }}>🖼️</span>
                <span style={{ fontSize: 13 }}>No se pudo cargar la imagen</span>
            </div>
        )
    }

    return (
        <img src={src} alt={alt} onError={() => setError(true)}
            style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000', display: 'block' }} 
        />
    )
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
    actionBtn: {
        flex: 1,
    },
    backBtn: {
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
    saveBtnWrap: {
        marginLeft: '10px'
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
    },
    photoContainer: {
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #334155'
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

function renderAccessLog(log: VisitAccessLogRecord, index: number) {
    return (
        <div key={log.id || index} style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #2a3034' }}>
            <p style={{ color: '#22d3ee', fontSize: 13, margin: '0 0 5px 0' }}>
                Entrada: {formatDate(log.entry_time)} {formatTime(log.entry_time)}
            </p>

            {log.vehicle_photo_url && (
                <div style={styles.photoContainer}>
                    <ImageWithFallback
                        src={getPhotoUrl(log.vehicle_photo_url)}
                        alt="Foto de ingreso"
                    />
                </div>
            )}

            {log.vehicle_notes && <DetailField label="Notas Foto"><p style={styles.fieldValue}>{log.vehicle_notes}</p></DetailField>}
            {log.entry_notes && <DetailField label="Notas Entrada"><p style={styles.fieldValue}>{log.entry_notes}</p></DetailField>}
            {log.exit_time && (
                <>
                    <p style={{ color: '#f87171', fontSize: 13, margin: '10px 0 5px 0' }}>
                        Salida: {formatDate(log.exit_time)} {formatTime(log.exit_time)}
                    </p>
                    {log.exit_notes && <DetailField label="Notas Salida"><p style={styles.fieldValue}>{log.exit_notes}</p></DetailField>}
                </>
            )}
        </div>
    )
}

function renderStatusHistoryEntry(historyEntry: VisitStatusHistoryRecord, index: number) {
    return (
        <div key={historyEntry.id || index} style={{ marginBottom: 8, fontSize: 13, color: '#a0a0a0' }}>
            <span style={{ color: '#fff' }}>
                {formatDate(historyEntry.changed_at)} {formatTime(historyEntry.changed_at)}
            </span>
            : Cambio de <b>{historyEntry.old_status}</b> a{' '}
            <b style={{ color: getVisitStatusColor(historyEntry.new_status) }}>
                {historyEntry.new_status}
            </b>
            {historyEntry.profiles && (
                <span> por {historyEntry.profiles.name} ({historyEntry.profiles.role})</span>
            )}
            {historyEntry.notes && (
                <div style={{ fontStyle: 'italic', marginTop: 2, color: '#64748b' }}>
                    "{historyEntry.notes}"
                </div>
            )}
        </div>
    )
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
                <Button variant="secondary" size="lg" onClick={onBack} fullWidth>
                    Volver a lista de visitas
                </Button>
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
    qrDisplay,
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

    const invitation = getQrInvitationLines(visit, qrDisplay)

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={{ marginBottom: '30px' }}>
                    <Button variant="secondary" size="md" onClick={onBack} style={styles.backBtn}>
                        Volver
                    </Button>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Detalles de la Visita</h1>
                </div>

                <div
                    style={{
                        marginBottom: '20px',
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '16px',
                            lineHeight: 1.5,
                            color: '#e2e8f0',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                        }}
                    >
                        {qrDisplay?.residentName?.trim() &&
                        invitation.primary.startsWith(`${qrDisplay.residentName.trim()},`) ? (
                            <>
                                <span style={{ fontWeight: 800, color: '#ffffff' }}>
                                    {qrDisplay.residentName.trim()}
                                </span>
                                {invitation.primary.slice(qrDisplay.residentName.trim().length)}
                            </>
                        ) : invitation.primary.startsWith('Acceso de visita para ') ? (
                            <>
                                Acceso de visita para{' '}
                                <span style={{ fontWeight: 800, color: '#ffffff' }}>
                                    {visit.visitor_name?.trim() || 'Visitante'}
                                </span>
                            </>
                        ) : invitation.primary.startsWith('Invitación para ') ? (
                            <>
                                Invitación para{' '}
                                <span style={{ fontWeight: 800, color: '#ffffff' }}>
                                    {visit.visitor_name?.trim() || 'Visitante'}
                                </span>
                            </>
                        ) : (
                            invitation.primary
                        )}
                    </p>
                    {invitation.secondary ? (
                        <p
                            style={{
                                margin: '10px 0 0',
                                fontSize: '18px',
                                fontWeight: 800,
                                color: '#22d3ee',
                                textTransform: 'uppercase',
                                letterSpacing: 0.3,
                                fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif",
                            }}
                        >
                            {invitation.secondary}
                        </p>
                    ) : null}
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
                                    <span style={styles.saveBtnWrap}>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={onSaveStatus}
                                            disabled={isUpdating}
                                            style={{ borderRadius: 4, fontSize: 14 }}
                                        >
                                            {isUpdating ? '...' : 'Guardar'}
                                        </Button>
                                    </span>
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
                        </Section>
                    </div>

                    {/* Sección de Logs de Acceso (Fotos y Notas) */}
                    {visit.access_logs && visit.access_logs.length > 0 && (
                        <div style={styles.sectionDivider}>
                            <Section title="Registro de Acceso (Guardia)">
                                {visit.access_logs.map(renderAccessLog)}
                            </Section>
                        </div>
                    )}

                    {/* Sección de Historial */}
                    {visit.visit_status_history && visit.visit_status_history.length > 0 && (
                        <div style={styles.sectionDivider}>
                            <Section title="Historial de Cambios">
                                {visit.visit_status_history.map(renderStatusHistoryEntry)}
                            </Section>
                        </div>
                    )}

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
                    <Button variant="primary" size="lg" onClick={onOpenQR} style={styles.actionBtn}>
                        Ver QR
                    </Button>
                    <Button variant="secondary" size="lg" onClick={onBack} style={styles.actionBtn}>
                        Volver a Visitas
                    </Button>
                </div>
            </div>

            {showSuccessModal && (
                <div style={styles.modalBackdrop}>
                    <div style={styles.modalCard}>
                        <h3 style={{ color: '#22d3ee', marginBottom: '20px' }}>Cambios realizados</h3>
                        <p style={styles.modalText}>
                            El estado de la visita ha sido actualizado correctamente.
                        </p>
                        <Button variant="primary" size="lg" onClick={onCloseSuccess} fullWidth>
                            OK
                        </Button>
                    </div>
                </div>
            )}

            {showQRModal && (
                <QRGenerator
                    visit={visit}
                    mode="modal"
                    qrDisplay={
                        qrDisplay
                            ? {
                                  residentName: qrDisplay.residentName,
                                  communityName: qrDisplay.communityName,
                                  unitNumber: qrDisplay.unitNumber,
                              }
                            : undefined
                    }
                    onClose={onCloseQR}
                />
            )}
        </div>
    )
}

export default VisitDetailView
