import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import {
    getVisitWithQrDisplay,
    type VisitDetailRecord,
    type VisitQrDisplayData,
} from '../../services/visits.service'
import type { Visit } from '../../types/index'
import VisitDetailView from './VisitDetailView'

function VisitDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { role } = useAuth()
    const { changeStatus, refresh } = useVisits()

    const [visit, setVisit] = useState<VisitDetailRecord | null>(null)
    const [qrDisplay, setQrDisplay] = useState<VisitQrDisplayData | null>(null)
    const [newStatus, setNewStatus] = useState<Visit['status']>('pending')
    const [isUpdating, setIsUpdating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)

    useEffect(() => {
        async function run() {
            setLoading(true)
            setError(null)

            try {
                if (!id) {
                    setError('ID de visita no proporcionado')
                    return
                }

                const data = await getVisitWithQrDisplay(id)
                setVisit(data.visit)
                setQrDisplay(data)
                setNewStatus(data.visit.status)
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Error al cargar la visita')
            } finally {
                setLoading(false)
            }
        }

        void run()
    }, [id])

    async function handleStatusUpdate() {
        if (!visit) {
            return
        }

        setIsUpdating(true)

        try {
            const updatedVisit = await changeStatus(visit.id, newStatus)
            setVisit(updatedVisit)
            await refresh()
            setShowSuccessModal(true)
        } catch (updateError) {
            console.error(updateError)
        } finally {
            setIsUpdating(false)
        }
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
            error={error}
            isAdmin={role === 'admin'}
            isUpdating={isUpdating}
            loading={loading}
            newStatus={newStatus}
            showQRModal={showQRModal}
            showSuccessModal={showSuccessModal}
            visit={visit}
            qrDisplay={qrDisplay}
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
