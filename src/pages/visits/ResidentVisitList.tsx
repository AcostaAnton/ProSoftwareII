import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cancelVisit, getVisitsByResident } from '../../services/visits.service'
import type { Visit } from '../../types/index'
import { resolveAsync } from './visitAsync.helpers'
import { createVisitCardDtos } from './visitCard.dto'
import { buildResidentVisitSections } from './residentVisit.helpers'
import type { ResidentTab } from './residentVisit.types'
import ResidentVisitListView from './ResidentVisitListView'

function ResidentVisitList() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [visits, setVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ResidentTab>('upcoming')
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
    const userId = user?.id

    useEffect(() => {
        let isActive = true

        if (!userId) {
            setVisits([])
            setError(null)
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        void resolveAsync(
            getVisitsByResident(userId),
            'Error al cargar las visitas'
        ).then((result) => {
            if (!isActive) {
                return
            }

            if (result.error !== null) {
                setVisits([])
                setError(result.error)
                setLoading(false)
                return
            }

            setVisits(result.data)
            setLoading(false)
        })

        return () => {
            isActive = false
        }
    }, [userId])

    const sections = buildResidentVisitSections(visits)
    const upcomingVisits = createVisitCardDtos(sections.upcomingVisits)
    const historyVisits = createVisitCardDtos(sections.historyVisits)
    const manageableVisits = createVisitCardDtos(sections.manageableVisits)

    function handleVisitSelect(visitId: string) {
        navigate(`/visits/${visitId}`)
    }

    function handleTabChange(tab: ResidentTab) {
        setActiveTab(tab)
    }

    function handleRequestCancel(visitId: string) {
        setConfirmCancelId(visitId)
    }

    function handleCancelDismiss() {
        setConfirmCancelId(null)
    }

    function handleCancelConfirm() {
        if (!confirmCancelId) {
            return
        }

        const visitId = confirmCancelId

        setConfirmCancelId(null)
        setCancellingId(visitId)
        setError(null)

        void resolveAsync(
            cancelVisit(visitId),
            'Error al cancelar la visita'
        ).then((result) => {
            setCancellingId(null)

            if (result.error !== null) {
                setError(result.error)
                return
            }

            setVisits((currentVisits) =>
                currentVisits.map((visit) =>
                    visit.id === visitId
                        ? { ...visit, status: 'cancelled' }
                        : visit
                )
            )
        })
    }

    return (
        <ResidentVisitListView
            activeTab={activeTab}
            cancellingId={cancellingId}
            confirmCancelId={confirmCancelId}
            error={error}
            historyVisits={historyVisits}
            loading={loading}
            manageableVisits={manageableVisits}
            upcomingVisits={upcomingVisits}
            onCancelConfirm={handleCancelConfirm}
            onCancelDismiss={handleCancelDismiss}
            onRequestCancel={handleRequestCancel}
            onTabChange={handleTabChange}
            onVisitSelect={handleVisitSelect}
        />
    )
}

export default ResidentVisitList
