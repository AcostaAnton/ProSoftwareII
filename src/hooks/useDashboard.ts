

import { useEffect, useState } from 'react'
import type { DashboardStat } from '../components/dashboard/DashboardStatsPanel'
import type { RecentVisit } from '../components/dashboard/RecentVisitsTable'
import { useAuth } from '../context/AuthContext'
import { getProfilesByIds, getUnitsByOwnerIds } from '../services/dashboard.service'
import { getAllVisits, getVisitsByResident } from '../services/visits.service'
import type { Profile, Unit, Visit } from '../types/index'

type UseDashboardResult = {
  loading: boolean
  error: string | null
  userName: string
  secondaryText: string
  showNewVisitButton: boolean
  stats: DashboardStat[]
  recentVisits: RecentVisit[]
}

function sortVisitsByDateDesc(visits: Visit[]) {
  return [...visits].sort((a, b) => {
    const timeA = new Date(`${a.visit_date}T${a.visit_time || '00:00'}`).getTime()
    const timeB = new Date(`${b.visit_date}T${b.visit_time || '00:00'}`).getTime()
    return timeB - timeA
  })
}

export function useDashboard(): UseDashboardResult {
  const { user, profile, role } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('Usuario')
  const [secondaryText, setSecondaryText] = useState('')
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([])

  useEffect(() => {
    async function loadDashboard() {
      if (!user || !profile || !role) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        setUserName(profile.name || user.email || 'Usuario')

        const now = new Date()
        const dateStr = now.toLocaleDateString('es-HN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        if (role === 'resident') {
          const userUnits = await getUnitsByOwnerIds([profile.id])
          const currentUnit = userUnits[0]

          setSecondaryText(
            currentUnit?.number
              ? `Resumen de actividad · Unidad ${currentUnit.number} · ${dateStr}`
              : `Unidad no asignada · ${dateStr}`
          )
        } else {
          setSecondaryText(`Resumen de actividad del día · ${dateStr}`)
        }

        let visits: Visit[] = []

        if (role === 'resident') {
          visits = await getVisitsByResident(user.id)
        } else {
          visits = await getAllVisits()
        }

        const sortedVisits = sortVisitsByDateDesc(visits)

        const residentIds = [...new Set(sortedVisits.map((v) => v.resident_id))]

        const relatedProfiles: Profile[] = await getProfilesByIds(residentIds)
        const relatedUnits: Unit[] = await getUnitsByOwnerIds(residentIds)

        const profileById = new Map<string, Profile>()
        const unitByOwnerId = new Map<string, Unit>()

        relatedProfiles.forEach((p) => {
          profileById.set(p.id, p)
        })

        relatedUnits.forEach((unit) => {
          if (unit.owner_id) unitByOwnerId.set(unit.owner_id, unit)
          if (unit.co_owner_id) unitByOwnerId.set(unit.co_owner_id, unit)
        })

        const nextStats: DashboardStat[] = [
          {
            title: 'Total de visitas',
            value: sortedVisits.length,
            variant: 'total',
          },
          {
            title: 'Pendientes',
            value: sortedVisits.filter((v) => v.status === 'pending').length,
            variant: 'pending',
          },
          {
            title: 'Aprobadas',
            value: sortedVisits.filter((v) => v.status === 'approved').length,
            variant: 'approved',
          },
          {
            title: 'Completadas',
            value: sortedVisits.filter((v) => v.status === 'completed').length,
            variant: 'done',
          },
        ]

        setStats(nextStats)

        const tableRows: RecentVisit[] = sortedVisits.slice(0, 6).map((visit) => {
          const residentProfile = profileById.get(visit.resident_id)
          const residentUnit = unitByOwnerId.get(visit.resident_id)

          return {
            id: visit.id,
            visitorName: visit.visitor_name,
            visitorPhone: visit.visitor_phone || '',
            residentName: residentProfile?.name || 'Residente',
            unitLabel: residentUnit?.number || '',
            visitDate: visit.visit_date,
            visitTime: visit.visit_time || '',
            status: visit.status,
            showQrAction: visit.status === 'pending',
          }
        })

        setRecentVisits(tableRows)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Error al cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [user, profile, role])

  const showNewVisitButton = role === 'resident' || role === 'admin'

  return {
    loading,
    error,
    userName,
    secondaryText,
    showNewVisitButton,
    stats,
    recentVisits,
  }
}
