import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import type {
    VisitDetailRecord,
    VisitQrDisplayData
} from '../../services/visits.service'
import { getVisitWithQrDisplay } from '../../services/visits.service'
import type { Visit } from '../../types/index'
import { resolveAsync } from './visitAsync.helpers'
import {
    createVisitDetailDto,
    type VisitDetailDto
} from './visitDetail.dto'
import VisitDetailView from './VisitDetailView'

function VisitDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { role } = useAuth()
    const { changeStatus } = useVisits()

    const [visit, setVisit] = useState<VisitDetailRecord | null>(null)
    const [qrDisplay, setQrDisplay] = useState<VisitQrDisplayData | null>(null)
    const [newStatus, setNewStatus] = useState<Visit['status']>('pending')
    const [isUpdating, setIsUpdating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)

    useEffect(() => {
        let isActive = true

        if (!id) {
            setVisit(null)
            setQrDisplay(null)
            setError('ID de visita no proporcionado')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        void resolveAsync(
            getVisitWithQrDisplay(id),
            'Error al cargar la visita'
        ).then((result) => {
            if (!isActive) {
                return
            }

            if (result.error !== null) {
                setVisit(null)
                setQrDisplay(null)
                setError(result.error)
                setLoading(false)
                return
            }

            setVisit(result.data.visit)
            setQrDisplay(result.data)
            setNewStatus(result.data.visit.status)
            setLoading(false)
        })

        return () => {
            isActive = false
        }
    }, [id])

    const detail: VisitDetailDto | null = visit
        ? createVisitDetailDto(visit, qrDisplay)
        : null

    async function handleStatusUpdate() {
        if (!visit || newStatus === visit.status) {
            return
        }

        setIsUpdating(true)
        setError(null)

        const updateResult = await resolveAsync(
            changeStatus(visit.id, newStatus),
            'Error al actualizar el estado de la visita'
        )

        setIsUpdating(false)

        if (updateResult.error !== null) {
            setError(updateResult.error)
            return
        }

        setVisit((currentVisit) => (
            currentVisit
                ? {
                    ...currentVisit,
                    ...updateResult.data
                }
                : currentVisit
        ))
        setQrDisplay((currentQrDisplay) => (
            currentQrDisplay
                ? {
                    ...currentQrDisplay,
                    visit: {
                        ...currentQrDisplay.visit,
                        ...updateResult.data
                    }
                }
                : currentQrDisplay
        ))
        setShowSuccessModal(true)
    }

    function handleBack() {
        navigate('/visits/list')
    }

    function handleStatusChange(status: Visit['status']) {
        setNewStatus(status)
    }

    function handleOpenQR() {
        setShowQRModal(true)
    }

    function handleCloseQR() {
        setShowQRModal(false)
    }

    function handleCloseSuccess() {
        setShowSuccessModal(false)
        navigate('/visits/list')
    }

    return (
        <VisitDetailView
            canSaveStatus={visit ? newStatus !== visit.status : false}
            detail={detail}
            error={error}
            isAdmin={role === 'admin'}
            isUpdating={isUpdating}
            loading={loading}
            newStatus={newStatus}
            qrDisplay={qrDisplay}
            showQRModal={showQRModal}
            showSuccessModal={showSuccessModal}
            visit={visit}
            onBack={handleBack}
            onCloseQR={handleCloseQR}
            onCloseSuccess={handleCloseSuccess}
            onOpenQR={handleOpenQR}
            onSaveStatus={handleStatusUpdate}
            onStatusChange={handleStatusChange}
        />
    )
}

export default VisitDetail
