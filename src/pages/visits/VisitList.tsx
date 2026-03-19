import { useEffect, useState } from 'react'
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

function VisitList() {
    const { user, role } = useAuth()
    const navigate = useNavigate()

    const [visits, setVisits] = useState<Visit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<VisitListFilters>(createInitialVisitListFilters)
    const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null)

    useEffect(() => {
        void loadVisits()
    }, [role, user])

    const filteredVisits = filterVisits(visits, filters)

    async function loadVisits() {
        if (!user) {
            setVisits([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const visitsData = role === 'resident'
                ? await getVisitsByResident(user.id)
                : await getAllVisits()

            setVisits(visitsData)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Error al cargar las visitas')
        } finally {
            setLoading(false)
        }
    }

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

    return (
        <VisitListView
            error={error}
            filteredVisits={filteredVisits}
            filters={filters}
            loading={loading}
            openDropdown={openDropdown}
            totalVisits={visits.length}
            onClearAllFilters={handleClearAllFilters}
            onClearDateFilters={handleClearDateFilters}
            onClearStatusFilters={handleClearStatusFilters}
            onEndDateChange={handleEndDateChange}
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
