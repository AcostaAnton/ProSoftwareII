import type { CSSProperties } from 'react'
import { Button } from './Button'

interface PaginationProps {
    currentPage: number
    onPageChange: (page: number) => void
    totalPages: number
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '20px'
    } as CSSProperties,
    buttons: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    } as CSSProperties,
    pageInfo: {
        color: '#94a3b8',
        fontSize: '13px'
    } as CSSProperties,
    currentPage: {
        background: 'linear-gradient(135deg, #22d3ee, #38bdf8)',
        color: '#082f49',
        border: 'none'
    } as CSSProperties,
    pageButton: {
        minWidth: '42px'
    } as CSSProperties,
    ellipsis: {
        color: '#64748b',
        fontSize: '13px',
        padding: '0 2px'
    } as CSSProperties
}

export function Pagination({ currentPage, onPageChange, totalPages }: PaginationProps) {
    if (totalPages <= 1) {
        return null
    }

    const pageItems = buildVisiblePages(currentPage, totalPages)

    return (
        <div style={styles.container}>
            <div style={styles.pageInfo}>
                Pagina {currentPage} de {totalPages}
            </div>

            <div style={styles.buttons}>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Anterior
                </Button>

                {pageItems.map((pageItem, index) => {
                    if (pageItem === '...') {
                        return (
                            <span key={`ellipsis-${index}`} style={styles.ellipsis}>
                                ...
                            </span>
                        )
                    }

                    return (
                        <Button
                            key={pageItem}
                            type="button"
                            variant={pageItem === currentPage ? 'primary' : 'panel'}
                            size="sm"
                            onClick={() => onPageChange(pageItem)}
                            style={{
                                ...styles.pageButton,
                                ...(pageItem === currentPage ? styles.currentPage : {})
                            }}
                        >
                            {pageItem}
                        </Button>
                    )
                })}

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}

function buildVisiblePages(currentPage: number, totalPages: number): Array<number | '...'> {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages = new Set<number>([
        1,
        totalPages,
        Math.max(1, currentPage - 1),
        currentPage,
        Math.min(totalPages, currentPage + 1)
    ])
    const sortedPages = Array.from(pages).sort((firstPage, secondPage) => firstPage - secondPage)
    const visiblePages: Array<number | '...'> = []

    for (let index = 0; index < sortedPages.length; index += 1) {
        const page = sortedPages[index]
        const previousPage = sortedPages[index - 1]

        if (previousPage && page - previousPage > 1) {
            visiblePages.push('...')
        }

        visiblePages.push(page)
    }

    return visiblePages
}
