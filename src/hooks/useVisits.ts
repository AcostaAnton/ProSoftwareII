
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAllVisits,
  getVisitsByResident,
  updateVisitStatus,
} from '../services/visits.service'
import type { Visit, VisitStatus } from '../types/index'

interface UseVisitsResult {
  visits: Visit[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  changeStatus: (id: string, status: VisitStatus) => Promise<Visit>
}

export function useVisits(): UseVisitsResult {
  const { user, role } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setVisits([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      let data: Visit[] = []

      if (role === 'resident') {
        data = await getVisitsByResident(user.id)
      } else {
        data = await getAllVisits()
      }

      setVisits(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error cargando visitas')
    } finally {
      setLoading(false)
    }
  }, [user, role])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const changeStatus = useCallback(
    async (id: string, status: VisitStatus) => {
      const updated = await updateVisitStatus(id, status)
      setVisits((prev) => prev.map((v) => (v.id === id ? updated : v)))
      return updated
    },
    []
  )

  return { visits, loading, error, refresh, changeStatus }
}

