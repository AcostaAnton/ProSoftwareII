import type {
    ChangeEvent,
    ReactNode
} from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import type { Visit } from '../../types/index'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import type { VisitCardDto } from './visitCard.dto'
import {
    DATE_FILTER_OPTIONS,
    getVisitListEmptyMessage,
    hasActiveVisitListFilters,
    type FilterType,
    type VisitListFilters,
    STATUS_FILTER_OPTIONS
} from './visitList.helpers'
import './visitPages.css'

type OpenDropdown = 'date' | 'status' | null

interface VisitListViewProps {
    currentPage: number
    error: string | null
    filteredCount: number
    filters: VisitListFilters
    loading: boolean
    openDropdown: OpenDropdown
    totalPages: number
    totalVisits: number
    visits: VisitCardDto[]
    onClearAllFilters: () => void
    onClearDateFilters: () => void
    onClearStatusFilters: () => void
    onEndDateChange: (event: ChangeEvent<HTMLInputElement>) => void
    onPageChange: (page: number) => void
    onSearchTermChange: (event: ChangeEvent<HTMLInputElement>) => void
    onStartDateChange: (event: ChangeEvent<HTMLInputElement>) => void
    onToggleDateDropdown: () => void
    onToggleDateFilter: (filter: FilterType) => void
    onToggleStatusDropdown: () => void
    onToggleStatusFilter: (status: Visit['status']) => void
    onVisitSelect: (visitId: string) => void
}

interface PanelSectionProps {
    children: ReactNode
}

interface CheckboxFilterOptionProps {
    checked: boolean
    label: string
    onToggle: () => void
}

interface DropdownButtonProps {
    isOpen: boolean
    label: string
    onClick: () => void
}

interface VisitCardProps {
    onVisitSelect: (visitId: string) => void
    visit: VisitCardDto
}

function PanelSection({ children }: PanelSectionProps) {
    return (
        <div className="visit-filter-card visit-filter-card--menu">
            {children}
        </div>
    )
}

function CheckboxFilterOption({ checked, label, onToggle }: CheckboxFilterOptionProps) {
    return (
        <label className={`visit-checkbox-option${checked ? ' visit-checkbox-option--checked' : ''}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
            />
            <span>{label}</span>
        </label>
    )
}

function DropdownButton({ isOpen, label, onClick }: DropdownButtonProps) {
    return (
        <Button
            type="button"
            variant="panel"
            fullWidth
            onClick={onClick}
            className="visit-dropdown-button"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Cerrar opciones' : 'Abrir opciones'}
        >
            <span className="visit-dropdown-button-label">{label}</span>
            <span className="visit-dropdown-button-chevron" aria-hidden>
                {isOpen ? '▴' : '▾'}
            </span>
        </Button>
    )
}

function LoadingState() {
    return (
        <div className="visit-workspace">
            <div className="visit-state-card">Cargando visitas...</div>
        </div>
    )
}

function ErrorState({ error }: { error: string }) {
    return (
        <div className="visit-workspace">
            <div className="visit-state-card visit-state-card--error">{error}</div>
        </div>
    )
}

function VisitCard({ onVisitSelect, visit }: VisitCardProps) {
    function handleClick() {
        onVisitSelect(visit.id)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="visit-history-card"
        >
            <div className="visit-card-top">
                <div className="visit-card-copy">
                    <p className="visit-card-eyebrow">
                        {visit.visitDateLabel}
                        {visit.visitTimeLabel ? ` · ${visit.visitTimeLabel}` : ''}
                    </p>
                    <h3 className="visit-card-title">{visit.visitorName}</h3>
                </div>

                <span
                    className="visit-status-badge"
                    style={{
                        backgroundColor: visit.statusColor,
                        color: '#082f49'
                    }}
                >
                    {visit.statusLabel}
                </span>
            </div>

            <div className="visit-card-meta-group">
                {visit.visitorPhone && (
                    <p className="visit-card-meta">{visit.visitorPhone}</p>
                )}

                {visit.visitPurpose && (
                    <p className="visit-card-purpose">{visit.visitPurpose}</p>
                )}
            </div>

            <div className="visit-card-footer">
                <span className="visit-card-token">
                    QR {visit.qrTokenPreview}
                </span>
                <span className="visit-card-link">Ver detalle</span>
            </div>
        </button>
    )
}

function getSelectedCountLabel(count: number): string {
    if (count === 0) {
        return 'Ninguno'
    }

    if (count === 1) {
        return '1 seleccionado'
    }

    return `${count} seleccionados`
}

function getDropdownButtonLabel(count: number, singularLabel: string, pluralLabel: string): string {
    if (count === 0) {
        return singularLabel
    }

    if (count === 1) {
        return '1 seleccionado'
    }

    return `${count} ${pluralLabel}`
}

function VisitListView({
    currentPage,
    error,
    filteredCount,
    filters,
    loading,
    openDropdown,
    totalPages,
    totalVisits,
    visits,
    onClearAllFilters,
    onClearDateFilters,
    onClearStatusFilters,
    onEndDateChange,
    onPageChange,
    onSearchTermChange,
    onStartDateChange,
    onToggleDateDropdown,
    onToggleDateFilter,
    onToggleStatusDropdown,
    onToggleStatusFilter,
    onVisitSelect
}: VisitListViewProps) {
    const displayFilteredCount = useCountUp(filteredCount)

    if (loading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} />
    }

    const hasActiveFilters = hasActiveVisitListFilters(filters)
    const isSearching = filters.searchTerm.trim().length > 0

    return (
        <div className="visit-workspace visit-list-page">
            <section className="visit-panel">
                <div className="visit-panel-header visit-panel-header--split">
                    <div>
                        <h1 className="visit-panel-title">Lista de visitas</h1>
                        <p className="visit-panel-note">
                            {isSearching
                                ? 'Estás buscando una visita específica.'
                                : 'Busca por nombre, motivo, teléfono o código QR.'}
                        </p>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClearAllFilters}
                            className="visit-rounded-button"
                        >
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <div className="visit-history-toolbar">
                    <input
                        type="search"
                        placeholder="Buscar…"
                        value={filters.searchTerm}
                        onChange={onSearchTermChange}
                        className="visit-search-input"
                    />
                </div>

                <div className="visit-filter-grid">
                    <article className="visit-filter-card">
                        <p className="visit-filter-kicker">Rango de fechas</p>

                        <div className="visit-date-range">
                            <label className="visit-filter-label">
                                <span>Desde</span>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={onStartDateChange}
                                    className="visit-control"
                                />
                            </label>

                            <label className="visit-filter-label">
                                <span>Hasta</span>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={onEndDateChange}
                                    className="visit-control"
                                />
                            </label>
                        </div>
                    </article>

                    <PanelSection>
                        <p className="visit-filter-kicker">Fechas rápidas</p>
                        <p className="visit-filter-value">
                            {getSelectedCountLabel(filters.quickDateFilters.size)}
                        </p>

                        <DropdownButton
                            isOpen={openDropdown === 'date'}
                            label={getDropdownButtonLabel(
                                filters.quickDateFilters.size,
                                'Seleccionar filtros',
                                'filtros seleccionados'
                            )}
                            onClick={onToggleDateDropdown}
                        />

                        {openDropdown === 'date' && (
                            <div className="visit-dropdown-menu">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    fullWidth
                                    onClick={onClearDateFilters}
                                    className="visit-rounded-button visit-rounded-button--sm"
                                >
                                    Ninguno
                                </Button>

                                <div className="visit-dropdown-options">
                                    {DATE_FILTER_OPTIONS.map((option) => (
                                        <CheckboxFilterOption
                                            key={option.value}
                                            checked={filters.quickDateFilters.has(option.value)}
                                            label={option.label}
                                            onToggle={() => onToggleDateFilter(option.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </PanelSection>

                    <PanelSection>
                        <p className="visit-filter-kicker">Estado</p>
                        <p className="visit-filter-value">
                            {getSelectedCountLabel(filters.statusFilters.size)}
                        </p>

                        <DropdownButton
                            isOpen={openDropdown === 'status'}
                            label={getDropdownButtonLabel(
                                filters.statusFilters.size,
                                'Seleccionar estados',
                                'estados seleccionados'
                            )}
                            onClick={onToggleStatusDropdown}
                        />

                        {openDropdown === 'status' && (
                            <div className="visit-dropdown-menu">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    fullWidth
                                    onClick={onClearStatusFilters}
                                    className="visit-rounded-button visit-rounded-button--sm"
                                >
                                    Ninguno
                                </Button>

                                <div className="visit-dropdown-options">
                                    {STATUS_FILTER_OPTIONS.map((option) => (
                                        <CheckboxFilterOption
                                            key={option.value}
                                            checked={filters.statusFilters.has(option.value)}
                                            label={option.label}
                                            onToggle={() => onToggleStatusFilter(option.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </PanelSection>
                </div>
            </section>

            <section className="visit-panel">
                <div className="visit-panel-header visit-panel-header--split">
                    <div>
                        <h2 className="visit-panel-title">Resultados</h2>
                        <p className="visit-panel-note">
                            {displayFilteredCount === 1
                                ? '1 resultado disponible.'
                                : `${displayFilteredCount} resultados disponibles.`}
                        </p>
                    </div>

                    <span className="visit-count-chip">
                        Pagina {currentPage} de {totalPages}
                    </span>
                </div>

                {visits.length === 0 ? (
                    <div className="visit-state-card">
                        {getVisitListEmptyMessage(totalVisits, filters)}
                    </div>
                ) : (
                    <>
                        <div className="visit-card-grid">
                            {visits.map((visit) => (
                                <VisitCard
                                    key={visit.id}
                                    visit={visit}
                                    onVisitSelect={onVisitSelect}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </>
                )}
            </section>
        </div>
    )
}

export default VisitListView
