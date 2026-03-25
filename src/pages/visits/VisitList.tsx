import { useDeferredValue, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAllVisits, getVisitsByResident } from '../../services/visits.service'
import type { Visit } from '../../types/index'
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
        async function run() {
            if (!userId) {
                setVisits([])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const visitsData = role === 'resident'
                    ? await getVisitsByResident(userId)
                    : await getAllVisits()

                setVisits(visitsData)
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Error al cargar las visitas')
            } finally {
                setLoading(false)
            }
        }

        void run()
    }, [role, userId])

    useEffect(() => {
        setCurrentPage(1)
    }, [
        filters.searchTerm,
        filters.startDate,
        filters.endDate,
        filters.quickDateFilters,
        filters.statusFilters
    ])

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

    useEffect(() => {
        if (safeCurrentPage !== currentPage) {
            setCurrentPage(safeCurrentPage)
        }
    }, [currentPage, safeCurrentPage])

    function updateFilters(nextFilters: Partial<VisitListFilters>) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            ...nextFilters
        }))
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
            visits={paginatedVisits}
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
