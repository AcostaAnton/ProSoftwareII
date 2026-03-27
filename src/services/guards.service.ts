import { supabase } from './supabase'

export type Guard = {
  id: string
  name: string
  email: string
  phone: string
  role: 'security'
  active: boolean
  created_at: string
}

export type AccessLog = {
  id: string
  guard_id: string
  visit_id: string
  entry_time: string
  date: string
  created_at: string
  visits?: {
    visitor_name: string
    visitor_phone: string
    qr_token: string
    resident_id: string
  }
}

export type GuardActivity = {
  guard: Guard
  total_access: number
  last_access: string | null
  logs: AccessLog[]
}

type GuardProfileRow = {
  id: string
  name: string
  email?: string | null
  phone: string | null
  role: 'security'
  status?: 'active' | 'inactive' | 'suspended' | null
  created_at: string
}

type AccessLogRow = {
  id: string
  guard_id: string
  visit_id: string
  entry_time: string | null
  created_at: string
  visits?: {
    visitor_name: string
    visitor_phone: string
    qr_token: string
    resident_id: string
  }[] | null
}

function toGuard(row: GuardProfileRow): Guard {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    role: 'security',
    active: row.status !== 'inactive' && row.status !== 'suspended',
    created_at: row.created_at,
  }
}

function toAccessLog(row: AccessLogRow): AccessLog {
  const date = row.created_at?.split('T')[0] ?? ''
  const timeFromCreatedAt = row.created_at?.split('T')[1]?.slice(0, 5) ?? ''
  return {
    id: row.id,
    guard_id: row.guard_id,
    visit_id: row.visit_id,
    entry_time: row.entry_time ?? timeFromCreatedAt,
    date,
    created_at: row.created_at,
    visits: row.visits?.[0] ?? undefined,
  }
}

export const guardsService = {
  async getGuards(): Promise<Guard[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, status, created_at')
      .eq('role', 'security')
      .order('name', { ascending: true })

    if (error) throw error
    return ((data ?? []) as GuardProfileRow[]).map(toGuard)
  },

  async getGuardsActivity(): Promise<GuardActivity[]> {
    const [guards, logs] = await Promise.all([
      guardsService.getGuards(),
      (async (): Promise<AccessLog[]> => {
        const { data, error } = await supabase
          .from('access_logs')
          .select(`
            id,
            guard_id,
            visit_id,
            entry_time,
            created_at,
            visits:visit_id (
              visitor_name,
              visitor_phone,
              qr_token,
              resident_id
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        return ((data ?? []) as AccessLogRow[]).map(toAccessLog)
      })(),
    ])

    return guards.map((guard) => {
      const guardLogs = logs.filter((log) => log.guard_id === guard.id)
      const sorted = [...guardLogs].sort(
        (a, b) =>
          `${b.date} ${b.entry_time}`.localeCompare(`${a.date} ${a.entry_time}`, undefined, {
            numeric: true,
          }),
      )
      const lastLog = sorted[0]
      
      return {
        guard,
        total_access: guardLogs.length,
        last_access: lastLog ? `${lastLog.date} ${lastLog.entry_time}` : null,
        logs: guardLogs
      }
    })
  },

  async getStats() {
    const today = new Date().toISOString().split('T')[0]
    const [guards, logs] = await Promise.all([guardsService.getGuards(), guardsService.getGuardLogs()])
    return {
      total_guards: guards.length,
      active_guards: guards.filter((g) => g.active).length,
      total_access: logs.length,
      today_access: logs.filter((l) => l.date === today).length,
      avg_per_guard: guards.length > 0 ? Math.round(logs.length / guards.length) : 0,
    }
  },

  async getGuardLogs(guardId?: string): Promise<AccessLog[]> {
    let query = supabase
      .from('access_logs')
      .select(`
        id,
        guard_id,
        visit_id,
        entry_time,
        created_at,
        visits:visit_id (
          visitor_name,
          visitor_phone,
          qr_token,
          resident_id
        )
      `)
      .order('created_at', { ascending: false })

    if (guardId) query = query.eq('guard_id', guardId)

    const { data, error } = await query
    if (error) throw error
    return ((data ?? []) as AccessLogRow[]).map(toAccessLog)
  },

  async toggleGuardStatus(guardId: string, active: boolean) {
    const status = active ? 'active' : 'inactive'
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', guardId)
      .eq('role', 'security')

    if (error) throw error
  },
}