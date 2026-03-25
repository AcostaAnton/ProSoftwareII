import { useState, type ChangeEvent, type ReactNode } from 'react'
import QRGenerator from '../../components/shared/QRGenerator'
import { Button } from '../../components/ui/Button'
import type {
    VisitDetailRecord,
    VisitQrDisplayData
} from '../../services/visits.service'
import type { Visit } from '../../types/index'
import type { VisitDetailDto } from './visitDetail.dto'
import { VISIT_STATUS_OPTIONS } from './visitStatus.helpers'
import './visitPages.css'

interface VisitDetailViewProps {
    canSaveStatus: boolean
    detail: VisitDetailDto | null
    error: string | null
    isAdmin: boolean
    isUpdating: boolean
    loading: boolean
    newStatus: Visit['status']
    qrDisplay: VisitQrDisplayData | null
    showQRModal: boolean
    showSuccessModal: boolean
    visit: VisitDetailRecord | null
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

function ImageWithFallback({ src, alt }: { alt: string; src: string | null }) {
    const [hasError, setHasError] = useState(false)

    if (hasError || !src) {
        return (
            <div className="visit-photo-fallback">
                <span>No se pudo cargar la imagen</span>
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="visit-photo"
        />
    )
}

function DetailField({ children, label }: DetailFieldProps) {
    return (
        <div className="visit-detail-field">
            <p className="visit-detail-field-label">{label}</p>
            <div className="visit-detail-field-value">{children}</div>
        </div>
    )
}

function Section({ children, title }: SectionProps) {
    return (
        <section className="visit-detail-section">
            <h2 className="visit-detail-section-title">{title}</h2>
            <div className="visit-detail-section-content">{children}</div>
        </section>
    )
}

function LoadingState() {
    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-state-card">Cargando detalles de la visita...</div>
            </section>
        </div>
    )
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-state-card visit-state-card--error">{error}</div>
                <div className="visit-detail-actions visit-detail-actions--stacked">
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={onBack}
                        className="visit-rounded-button"
                    >
                        Volver a la lista
                    </Button>
                </div>
            </section>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-state-card">Visita no encontrada.</div>
            </section>
        </div>
    )
}

function VisitDetailView({
    canSaveStatus,
    detail,
    error,
    isAdmin,
    isUpdating,
    loading,
    newStatus,
    qrDisplay,
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

    if (!visit || !detail) {
        return <EmptyState />
    }

    return (
        <div className="visit-workspace visit-detail-workspace">
            <section className="visit-panel">
                <div className="visit-detail-header">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onBack}
                        className="visit-rounded-button"
                    >
                        Volver
                    </Button>

                    <div>
                        <h1 className="visit-panel-title">Detalles de la visita</h1>
                        <p className="visit-panel-note">
                            Consulta la informacion del visitante, el acceso y el historial de cambios.
                        </p>
                    </div>
                </div>

                <div className="visit-detail-banner">
                    <p className="visit-detail-banner-primary">{detail.invitationPrimary}</p>
                    {detail.invitationSecondary && (
                        <p className="visit-detail-banner-secondary">{detail.invitationSecondary}</p>
                    )}
                </div>

                <div className="visit-detail-status-row">
                    <div>
                        <p className="visit-detail-field-label">Estado actual</p>
                        {!isAdmin && (
                            <span
                                className="visit-status-badge"
                                style={{
                                    backgroundColor: detail.statusColor,
                                    color: '#082f49'
                                }}
                            >
                                {detail.statusLabel}
                            </span>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="visit-detail-status-editor">
                            <select
                                value={newStatus}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    onStatusChange(event.target.value as Visit['status'])
                                }
                                className="visit-control visit-detail-select"
                            >
                                {VISIT_STATUS_OPTIONS.map((statusOption) => (
                                    <option key={statusOption.value} value={statusOption.value}>
                                        {statusOption.label}
                                    </option>
                                ))}
                            </select>

                            <Button
                                variant="success"
                                size="sm"
                                onClick={onSaveStatus}
                                disabled={isUpdating || !canSaveStatus}
                                className="visit-rounded-button visit-rounded-button--sm"
                            >
                                {isUpdating ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    )}
                </div>

                <Section title="Informacion del visitante">
                    <DetailField label="Nombre">
                        <p>{detail.visitorName}</p>
                    </DetailField>
                    <DetailField label="Telefono">
                        <p>{detail.visitorPhone}</p>
                    </DetailField>
                </Section>

                <Section title="Informacion de la visita">
                    <DetailField label="Fecha">
                        <p>{detail.visitDateLabel}</p>
                    </DetailField>
                    <DetailField label="Hora">
                        <p>{detail.visitTimeLabel}</p>
                    </DetailField>
                    <DetailField label="Asunto">
                        <p>{detail.visitPurpose}</p>
                    </DetailField>
                </Section>

                {detail.accessLogs.length > 0 && (
                    <Section title="Registro de acceso">
                        {detail.accessLogs.map((accessLog) => (
                            <article key={accessLog.id} className="visit-detail-block">
                                <p className="visit-detail-log-title">Entrada: {accessLog.entryLabel}</p>

                                {accessLog.vehiclePhotoUrl && (
                                    <div className="visit-photo-frame">
                                        <ImageWithFallback
                                            src={accessLog.vehiclePhotoUrl}
                                            alt="Foto de acceso"
                                        />
                                    </div>
                                )}

                                {accessLog.vehicleNotes && (
                                    <DetailField label="Notas de la foto">
                                        <p>{accessLog.vehicleNotes}</p>
                                    </DetailField>
                                )}

                                {accessLog.entryNotes && (
                                    <DetailField label="Notas de entrada">
                                        <p>{accessLog.entryNotes}</p>
                                    </DetailField>
                                )}

                                {accessLog.exitLabel && (
                                    <p className="visit-detail-log-title visit-detail-log-title--exit">
                                        Salida: {accessLog.exitLabel}
                                    </p>
                                )}

                                {accessLog.exitNotes && (
                                    <DetailField label="Notas de salida">
                                        <p>{accessLog.exitNotes}</p>
                                    </DetailField>
                                )}
                            </article>
                        ))}
                    </Section>
                )}

                {detail.statusHistory.length > 0 && (
                    <Section title="Historial de cambios">
                        <div className="visit-detail-history">
                            {detail.statusHistory.map((historyEntry) => (
                                <article key={historyEntry.id} className="visit-detail-history-entry">
                                    <p className="visit-detail-history-date">{historyEntry.changedAtLabel}</p>
                                    <p className="visit-detail-history-text">
                                        Cambio de <strong>{historyEntry.oldStatusLabel}</strong> a{' '}
                                        <strong style={{ color: historyEntry.newStatusColor }}>
                                            {historyEntry.newStatusLabel}
                                        </strong>
                                    </p>
                                    {historyEntry.actorLabel && (
                                        <p className="visit-detail-history-meta">Por {historyEntry.actorLabel}</p>
                                    )}
                                    {historyEntry.notes && (
                                        <p className="visit-detail-history-note">{historyEntry.notes}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </Section>
                )}

                <Section title="Informacion del sistema">
                    <DetailField label="ID de visita">
                        <p className="visit-detail-mono">{detail.visitId}</p>
                    </DetailField>
                    <DetailField label="Creado">
                        <p>{detail.createdAtLabel}</p>
                    </DetailField>
                    <DetailField label="Token QR">
                        <p className="visit-detail-mono visit-detail-mono--wrap">{detail.qrToken}</p>
                    </DetailField>
                </Section>

                <div className="visit-detail-actions">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={onOpenQR}
                        className="visit-rounded-button"
                    >
                        Ver QR
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={onBack}
                        className="visit-rounded-button"
                    >
                        Volver a visitas
                    </Button>
                </div>
            </section>

            {showSuccessModal && (
                <div className="visit-modal-backdrop">
                    <div className="visit-modal-card">
                        <h3 className="visit-modal-title">Cambios guardados</h3>
                        <p className="visit-modal-text">
                            El estado de la visita fue actualizado correctamente.
                        </p>
                        <div className="visit-modal-actions">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onCloseSuccess}
                                className="visit-rounded-button"
                            >
                                OK
                            </Button>
                        </div>
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
