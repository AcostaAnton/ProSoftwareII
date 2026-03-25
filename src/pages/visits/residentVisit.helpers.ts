import type { Visit } from '../../types/index'
import {
    compareVisitsByDateTimeAsc,
    compareVisitsByDateTimeDesc,
    isPastVisit
} from './visitDate.helpers'

export interface ResidentVisitSectionsDto {
    historyVisits: Visit[]
    manageableVisits: Visit[]
    upcomingVisits: Visit[]
}

export function buildResidentVisitSections(visits: Visit[]): ResidentVisitSectionsDto {
    const sections: ResidentVisitSectionsDto = {
        historyVisits: [],
        manageableVisits: [],
        upcomingVisits: []
    }

    for (const visit of visits) {
        if (isPastVisit(visit)) {
            sections.historyVisits.push(visit)
            continue
        }

        if (!isResidentActionableStatus(visit.status)) {
            continue
        }

        sections.upcomingVisits.push(visit)
        sections.manageableVisits.push(visit)
    }

    sections.upcomingVisits.sort(compareVisitsByDateTimeAsc)
    sections.manageableVisits.sort(compareVisitsByDateTimeAsc)
    sections.historyVisits.sort(compareVisitsByDateTimeDesc)

    return sections
}

function isResidentActionableStatus(status: Visit['status']): boolean {
    return status === 'pending' || status === 'approved'
}
