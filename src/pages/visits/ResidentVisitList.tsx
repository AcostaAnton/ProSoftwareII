import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getVisitsByResident, cancelVisit } from '../../services/visits.service'
import type { Visit } from '../../types/index'
import type { ResidentTab } from './residentVisit.types'
import ResidentVisitListView from './ResidentVisitListView'

function isUpcoming(visit: Visit): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const visitDate = new Date(visit.visit_date.slice(0, 10) + 'T00:00:00')
    return visitDate >= today && (visit.status === 'pending' || visit.status === 'approved')
}

function isPast(visit: Visit): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const visitDate = new Date(visit.visit_date.slice(0, 10) + 'T00:00:00')
    return visitDate < today
}

function isManageable(visit: Visit): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const visitDate = new Date(visit.visit_date.slice(0, 10) + 'T00:00:00')
    return visitDate >= today && (visit.status === 'pending' || visit.status === 'approved')
}

function ResidentVisitList() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [visits, setVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ResidentTab>('upcoming')
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

    useEffect(() => {
        void loadVisits()
    }, [user])

    async function loadVisits() {
        if (!user) {
            setVisits([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const data = await getVisitsByResident(user.id)
            setVisits(data)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Error al cargar las visitas')
        } finally {
            setLoading(false)
        }
    }

    const upcomingVisits = visits.filter(isUpcoming).sort(sortAscByDate)
    const historyVisits = visits.filter(isPast).sort(sortDescByDate)
    const manageableVisits = visits.filter(isManageable).sort(sortAscByDate)

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

    async function handleCancelConfirm() {
        if (!confirmCancelId) return

        const idToCancel = confirmCancelId
        setConfirmCancelId(null)
        setCancellingId(idToCancel)

        try {
            await cancelVisit(idToCancel)
            setVisits((prev) =>
                prev.map((v) => v.id === idToCancel ? { ...v, status: 'cancelled' as const } : v)
            )
        } catch (cancelError) {
            setError(cancelError instanceof Error ? cancelError.message : 'Error al cancelar la visita')
        } finally {
            setCancellingId(null)
        }
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

function sortAscByDate(a: Visit, b: Visit): number {
    return a.visit_date.localeCompare(b.visit_date) || (a.visit_time ?? '').localeCompare(b.visit_time ?? '')
}

function sortDescByDate(a: Visit, b: Visit): number {
    return b.visit_date.localeCompare(a.visit_date) || (b.visit_time ?? '').localeCompare(a.visit_time ?? '')
}

export default ResidentVisitList
