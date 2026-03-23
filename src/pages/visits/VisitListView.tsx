import type {
    ChangeEvent,
    CSSProperties,
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

type OpenDropdown = 'date' | 'status' | null

interface VisitListViewProps {
    error: string | null
    filteredVisits: Visit[]
    filters: VisitListFilters
    loading: boolean
    openDropdown: OpenDropdown
    totalVisits: number
    onClearAllFilters: () => void
    onClearDateFilters: () => void
    onClearStatusFilters: () => void
    onEndDateChange: (event: ChangeEvent<HTMLInputElement>) => void
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

const styles = {
    page: {
        backgroundColor: '#080c0f',
        minHeight: '100vh',
        padding: '20px',
        color: '#ffffff'
    },
    container: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    searchInput: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: '#1a2024',
        color: '#ffffff',
        fontSize: '16px'
    },
    filtersPanel: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#1a2024',
        borderRadius: '8px'
    },
    dateRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    dateInput: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #334155',
        backgroundColor: '#0f172a',
        color: '#ffffff'
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1a2024',
        border: '1px solid #334155',
        borderRadius: '8px',
        zIndex: 1000,
        maxHeight: '200px',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    dropdownContent: {
        padding: '10px'
    },
    dropdownOption: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '4px',
        marginBottom: '5px'
    },
    visitCard: {
        backgroundColor: '#1a2024',
        padding: '15px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid #2a3034'
    },
    emptyMessage: {
        color: '#a0a0a0'
    },
    visitList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    statusBadge: {
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#000000'
    }
} satisfies Record<string, CSSProperties>

function PanelSection({ children }: PanelSectionProps) {
    return (
        <div style={{ flex: 1, position: 'relative' }}>
            {children}
        </div>
    )
}

function CheckboxFilterOption({ checked, label, onToggle }: CheckboxFilterOptionProps) {
    const optionStyle = {
        ...styles.dropdownOption,
        backgroundColor: checked ? '#334155' : 'transparent'
    }

    return (
        <label style={optionStyle}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                style={{ marginRight: '8px' }}
            />
            {label}
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
            style={{ justifyContent: 'space-between', fontWeight: 600 }}
        >
            <span>{label}</span>
            <span>{isOpen ? '▲' : '▼'}</span>
        </Button>
    )
}

function LoadingState() {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                Cargando visitas...
            </div>
        </div>
    )
}

function ErrorState({ error }: { error: string }) {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                Error: {error}
            </div>
        </div>
    )
}

function VisitCard({ onVisitSelect, visit }: VisitCardProps) {
    function handleClick() {
        onVisitSelect(visit.id)
    }

    function handleMouseEnter(event: MouseEvent<HTMLDivElement>) {
        event.currentTarget.style.backgroundColor = '#2a3034'
    }

    function handleMouseLeave(event: MouseEvent<HTMLDivElement>) {
        event.currentTarget.style.backgroundColor = '#1a2024'
    }

    return (
        <div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={styles.visitCard}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                        {visit.visitor_name}
                    </h3>
                    <p style={{ margin: '0', color: '#a0a0a0', fontSize: '14px' }}>
                        {formatDate(visit.visit_date)} - {formatTime(visit.visit_time)}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#a0a0a0', fontSize: '14px' }}>
                        Tel: {formatPhone(visit.visitor_phone)}
                    </p>
                </div>
                <div
                    style={{
                        ...styles.statusBadge,
                        backgroundColor: getVisitStatusColor(visit.status)
                    }}
                >
                    {getVisitStatusLabel(visit.status)}
                </div>
            </div>
        </div>
    )
}

function renderDateFilterOptions(
    selectedFilters: Set<FilterType>,
    onToggleDateFilter: (filter: FilterType) => void
) {
    const elements = []

    for (const option of DATE_FILTER_OPTIONS) {
        elements.push(
            <CheckboxFilterOption
                key={option.value}
                checked={selectedFilters.has(option.value)}
                label={option.label}
                onToggle={createDateFilterToggleHandler(option.value, onToggleDateFilter)}
            />
        )
    }

    return elements
}

function renderStatusFilterOptions(
    selectedStatuses: Set<Visit['status']>,
    onToggleStatusFilter: (status: Visit['status']) => void
) {
    const elements = []

    for (const option of STATUS_FILTER_OPTIONS) {
        elements.push(
            <CheckboxFilterOption
                key={option.value}
                checked={selectedStatuses.has(option.value)}
                label={option.label}
                onToggle={createStatusFilterToggleHandler(option.value, onToggleStatusFilter)}
            />
        )
    }

    return elements
}

function renderVisitCards(visits: Visit[], onVisitSelect: (visitId: string) => void) {
    const visitCards = []

    for (const visit of visits) {
        visitCards.push(
            <VisitCard
                key={visit.id}
                visit={visit}
                onVisitSelect={onVisitSelect}
            />
        )
    }

    return visitCards
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
    error,
    filteredVisits,
    filters,
    loading,
    openDropdown,
    totalVisits,
    onClearAllFilters,
    onClearDateFilters,
    onClearStatusFilters,
    onEndDateChange,
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

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Lista de Visitas</h1>

                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, proposito, telefono, destino o token QR..."
                        value={filters.searchTerm}
                        onChange={onSearchTermChange}
                        style={styles.searchInput}
                    />
                </div>

                <div style={styles.filtersPanel}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Filtros</h3>
                        {hasActiveFilters && (
                            <Button type="button" variant="secondary" size="sm" onClick={onClearAllFilters} style={{ borderRadius: 4, fontSize: 12, padding: '5px 10px' }}>
                                Limpiar filtros
                            </Button>
                        )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Filtrar por fecha</h4>
                        <div style={styles.dateRow}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Desde</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={onStartDateChange}
                                    style={styles.dateInput}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Hasta</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={onEndDateChange}
                                    style={styles.dateInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <PanelSection>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>
                                    Filtros rapidos por fecha
                                </div>
                                <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                                    {getSelectedCountLabel(filters.quickDateFilters.size)}
                                </div>
                            </div>
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
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.dropdownContent}>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            fullWidth
                                            onClick={onClearDateFilters}
                                            style={{ marginBottom: 10, borderRadius: 4, padding: '8px' }}
                                        >
                                            Ninguno
                                        </Button>
                                        {renderDateFilterOptions(filters.quickDateFilters, onToggleDateFilter)}
                                    </div>
                                </div>
                            )}
                        </PanelSection>

                        <PanelSection>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>
                                    Filtrar por estado
                                </div>
                                <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                                    {getSelectedCountLabel(filters.statusFilters.size)}
                                </div>
                            </div>
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
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.dropdownContent}>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            fullWidth
                                            onClick={onClearStatusFilters}
                                            style={{ marginBottom: 10, borderRadius: 4, padding: '8px' }}
                                        >
                                            Ninguno
                                        </Button>
                                        {renderStatusFilterOptions(filters.statusFilters, onToggleStatusFilter)}
                                    </div>
                                </div>
                            )}
                        </PanelSection>
                    </div>
                </div>

                {filteredVisits.length === 0 ? (
                    <p style={styles.emptyMessage}>
                        {getVisitListEmptyMessage(totalVisits, filters)}
                    </p>
                ) : (
                    <div style={styles.visitList}>
                        {renderVisitCards(filteredVisits, onVisitSelect)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitListView
