import type {
    ChangeEvent,
    MouseEvent,
    ReactNode
} from 'react'
import type { Visit } from '../../types/index'
import { formatDate, formatPhone, formatTime } from '../../utils/formatDate'
import {
    DATE_FILTER_OPTIONS,
    getVisitListEmptyMessage,
    hasActiveVisitListFilters,
    type FilterType,
    type VisitListFilters,
    STATUS_FILTER_OPTIONS
} from './visitList.helpers'
import {
    getVisitStatusColor,
    getVisitStatusLabel
} from './visitStatus.helpers'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
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
    visits: Visit[]
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
    visit: Visit
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
            style={{ justifyContent: 'space-between', borderRadius: 14, padding: '12px 14px' }}
        >
            <span>{label}</span>
            <span>{isOpen ? 'Arriba' : 'Abrir'}</span>
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

    function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) {
        event.currentTarget.style.transform = 'translateY(-2px)'
    }

    function handleMouseLeave(event: MouseEvent<HTMLButtonElement>) {
        event.currentTarget.style.transform = 'translateY(0)'
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="visit-history-card"
        >
            <div className="visit-card-top">
                <div className="visit-card-copy">
                    <p className="visit-card-eyebrow">
                        {formatDate(visit.visit_date)}
                        {visit.visit_time ? ` · ${formatTime(visit.visit_time)}` : ''}
                    </p>
                    <h3 className="visit-card-title">{visit.visitor_name}</h3>
                </div>

                <span
                    className="visit-status-badge"
                    style={{
                        backgroundColor: getVisitStatusColor(visit.status),
                        color: '#082f49'
                    }}
                >
                    {getVisitStatusLabel(visit.status)}
                </span>
            </div>

            <div className="visit-card-meta-group">
                {visit.visitor_phone && (
                    <p className="visit-card-meta">
                        Telefono: {formatPhone(visit.visitor_phone)}
                    </p>
                )}

                {visit.visit_purpose && (
                    <p className="visit-card-purpose">{visit.visit_purpose}</p>
                )}

            </div>

            <div className="visit-card-footer">
                <span className="visit-card-token">
                    QR {visit.qr_token.slice(0, 8).toUpperCase()}
                </span>
                <span className="visit-card-link">Ver detalle</span>
            </div>
        </button>
    )
}

function renderDateFilterOptions(
    selectedFilters: Set<FilterType>,
    onToggleDateFilter: (filter: FilterType) => void
) {
    return DATE_FILTER_OPTIONS.map((option) => (
        <CheckboxFilterOption
            key={option.value}
            checked={selectedFilters.has(option.value)}
            label={option.label}
            onToggle={createDateFilterToggleHandler(option.value, onToggleDateFilter)}
        />
    ))
}

function renderStatusFilterOptions(
    selectedStatuses: Set<Visit['status']>,
    onToggleStatusFilter: (status: Visit['status']) => void
) {
    return STATUS_FILTER_OPTIONS.map((option) => (
        <CheckboxFilterOption
            key={option.value}
            checked={selectedStatuses.has(option.value)}
            label={option.label}
            onToggle={createStatusFilterToggleHandler(option.value, onToggleStatusFilter)}
        />
    ))
}

function renderVisitCards(visits: Visit[], onVisitSelect: (visitId: string) => void) {
    return visits.map((visit) => (
        <VisitCard
            key={visit.id}
            visit={visit}
            onVisitSelect={onVisitSelect}
        />
    ))
}

function createDateFilterToggleHandler(
    filter: FilterType,
    onToggleDateFilter: (filter: FilterType) => void
) {
    function handleToggle() {
        onToggleDateFilter(filter)
    }

    return handleToggle
}

function createStatusFilterToggleHandler(
    status: Visit['status'],
    onToggleStatusFilter: (status: Visit['status']) => void
) {
    function handleToggle() {
        onToggleStatusFilter(status)
    }

    return handleToggle
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
    if (loading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} />
    }

    const hasActiveFilters = hasActiveVisitListFilters(filters)
    const isSearching = filters.searchTerm.trim().length > 0

    return (
        <div className="visit-workspace">
            <section className="visit-panel">
                <div className="visit-panel-header visit-panel-header--split">
                    <div>
                        <h1 className="visit-panel-title">Lista de visitas</h1>
                        <p className="visit-panel-note">
                            {isSearching
                                ? 'Estas buscando en visitas actuales y antiguas.'
                                : 'Sin busqueda, la lista se mantiene enfocada en visitas actuales y futuras.'}
                        </p>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClearAllFilters}
                            style={{ borderRadius: 14 }}
                        >
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <div className="visit-history-toolbar">
                    <input
                        type="search"
                        placeholder="Buscar por nombre, proposito, telefono o token QR..."
                        value={filters.searchTerm}
                        onChange={onSearchTermChange}
                        className="visit-search-input"
                    />
                </div>

                <div className="visit-filter-grid">
                    <article className="visit-filter-card">
                        <p className="visit-filter-kicker">Rango de fechas</p>
                        <p className="visit-filter-value">Desde y hasta</p>

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
                        <p className="visit-filter-kicker">Fechas rapidas</p>
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
                                    style={{ borderRadius: 12 }}
                                >
                                    Ninguno
                                </Button>

                                <div className="visit-dropdown-options">
                                    {renderDateFilterOptions(filters.quickDateFilters, onToggleDateFilter)}
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
                                    style={{ borderRadius: 12 }}
                                >
                                    Ninguno
                                </Button>

                                <div className="visit-dropdown-options">
                                    {renderStatusFilterOptions(filters.statusFilters, onToggleStatusFilter)}
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
                            {filteredCount} resultado{filteredCount === 1 ? '' : 's'} disponible{filteredCount === 1 ? '' : 's'}.
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
                            {renderVisitCards(visits, onVisitSelect)}
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
