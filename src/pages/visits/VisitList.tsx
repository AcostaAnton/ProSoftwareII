import {
    startTransition,
    useDeferredValue,
    useEffect,
    useState
} from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAllVisits, getVisitsByResident } from '../../services/visits.service'
import type { Visit } from '../../types/index'
import { resolveAsync } from './visitAsync.helpers'
import { createVisitCardDtos } from './visitCard.dto'
import VisitListView from './VisitListView'
import {
    createInitialVisitListFilters,
    filterVisits,
    toggleSetValue,
    type FilterType,
    type VisitListFilters
} from './visitList.helpers'

type OpenDropdown = 'date' | 'status' | null

const VISIT_LIST_PAGE_SIZE = 8

function VisitList() {
    const { user, role } = useAuth()
    const navigate = useNavigate()

    const [visits, setVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<VisitListFilters>(createInitialVisitListFilters)
    const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const deferredSearchTerm = useDeferredValue(filters.searchTerm)
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

        const visitsRequest = role === 'resident'
            ? getVisitsByResident(userId)
            : getAllVisits()

        void resolveAsync(visitsRequest, 'Error al cargar las visitas').then((result) => {
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
    }, [role, userId])

    const deferredFilters: VisitListFilters = {
        ...filters,
        searchTerm: deferredSearchTerm
    }
    const filteredVisits = filterVisits(visits, deferredFilters)
    const totalPages = Math.max(1, Math.ceil(filteredVisits.length / VISIT_LIST_PAGE_SIZE))
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const paginatedVisits = filteredVisits.slice(
        (safeCurrentPage - 1) * VISIT_LIST_PAGE_SIZE,
        safeCurrentPage * VISIT_LIST_PAGE_SIZE
    )
    const visitCards = createVisitCardDtos(paginatedVisits)

    function updateFilters(nextFilters: Partial<VisitListFilters>) {
        setCurrentPage(1)

        startTransition(() => {
            setFilters((currentFilters) => ({
                ...currentFilters,
                ...nextFilters
            }))
        })
    }

    function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
        updateFilters({ searchTerm: event.target.value })
    }

    function handleStartDateChange(event: ChangeEvent<HTMLInputElement>) {
        updateFilters({ startDate: event.target.value })
    }

    function handleEndDateChange(event: ChangeEvent<HTMLInputElement>) {
        updateFilters({ endDate: event.target.value })
    }

    function handleToggleDateFilter(filter: FilterType) {
        updateFilters({
            quickDateFilters: toggleSetValue(filters.quickDateFilters, filter)
        })
        setOpenDropdown(null)
    }

    function handleToggleStatusFilter(status: Visit['status']) {
        updateFilters({
            statusFilters: toggleSetValue(filters.statusFilters, status)
        })
        setOpenDropdown(null)
    }

    function handleClearDateFilters() {
        updateFilters({ quickDateFilters: new Set<FilterType>() })
        setOpenDropdown(null)
    }

    function handleClearStatusFilters() {
        updateFilters({ statusFilters: new Set<Visit['status']>() })
        setOpenDropdown(null)
    }

    function handleClearAllFilters() {
        setCurrentPage(1)
        setFilters(createInitialVisitListFilters())
        setOpenDropdown(null)
    }

    function handleToggleDateDropdown() {
        setOpenDropdown((currentDropdown) => currentDropdown === 'date' ? null : 'date')
    }

    function handleToggleStatusDropdown() {
        setOpenDropdown((currentDropdown) => currentDropdown === 'status' ? null : 'status')
    }

    function handleVisitSelect(visitId: string) {
        navigate(`/visits/${visitId}`)
    }

    function handlePageChange(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages) {
            return
        }

        setCurrentPage(nextPage)
    }

    return (
        <VisitListView
            currentPage={safeCurrentPage}
            error={error}
            filteredCount={filteredVisits.length}
            filters={filters}
            loading={loading}
            openDropdown={openDropdown}
            totalPages={totalPages}
            totalVisits={visits.length}
            visits={visitCards}
            onClearAllFilters={handleClearAllFilters}
            onClearDateFilters={handleClearDateFilters}
            onClearStatusFilters={handleClearStatusFilters}
            onEndDateChange={handleEndDateChange}
            onPageChange={handlePageChange}
            onSearchTermChange={handleSearchTermChange}
            onStartDateChange={handleStartDateChange}
            onToggleDateDropdown={handleToggleDateDropdown}
            onToggleDateFilter={handleToggleDateFilter}
            onToggleStatusDropdown={handleToggleStatusDropdown}
            onToggleStatusFilter={handleToggleStatusFilter}
            onVisitSelect={handleVisitSelect}
        />
    )
}

export default VisitList
