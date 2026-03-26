// src/services/guards.service.ts

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

// 📌 DATOS DE PRUEBA (MOCK)
const MOCK_GUARDS: Guard[] = [
  {
    id: '1',
    name: 'Carlos Guardia',
    email: 'carlos@seguridad.com',
    phone: '9999-0001',
    role: 'security',
    active: true,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@seguridad.com',
    phone: '9999-0002',
    role: 'security',
    active: true,
    created_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'juan@seguridad.com',
    phone: '9999-0003',
    role: 'security',
    active: false,
    created_at: '2024-01-01'
  }
]

const MOCK_LOGS: AccessLog[] = [
  {
    id: 'l1',
    guard_id: '1',
    visit_id: 'v1',
    entry_time: '14:30',
    date: '2024-03-18',
    created_at: '2024-03-18',
    visits: {
      visitor_name: 'Ana García',
      visitor_phone: '8888-0001',
      qr_token: 'TKN-123',
      resident_id: 'r1'
    }
  },
  {
    id: 'l2',
    guard_id: '1',
    visit_id: 'v2',
    entry_time: '09:15',
    date: '2024-03-18',
    created_at: '2024-03-18',
    visits: {
      visitor_name: 'Pedro Martínez',
      visitor_phone: '8888-0002',
      qr_token: 'TKN-456',
      resident_id: 'r2'
    }
  },
  {
    id: 'l3',
    guard_id: '2',
    visit_id: 'v3',
    entry_time: '11:00',
    date: '2024-03-17',
    created_at: '2024-03-17',
    visits: {
      visitor_name: 'Laura Torres',
      visitor_phone: '8888-0003',
      qr_token: 'TKN-789',
      resident_id: 'r3'
    }
  }
]

export const guardsService = {
  async getGuards(): Promise<Guard[]> {
    // Devolver datos de prueba
    return MOCK_GUARDS
  },

  async getGuardsActivity(): Promise<GuardActivity[]> {
    return MOCK_GUARDS.map((guard) => {
      const guardLogs = MOCK_LOGS.filter((log) => log.guard_id === guard.id)
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
    return {
      total_guards: MOCK_GUARDS.length,
      active_guards: MOCK_GUARDS.filter(g => g.active).length,
      total_access: MOCK_LOGS.length,
      today_access: MOCK_LOGS.filter(l => l.date === today).length,
      avg_per_guard: Math.round(MOCK_LOGS.length / MOCK_GUARDS.length)
    }
  },

  async getGuardLogs(guardId: string): Promise<AccessLog[]> {
    return MOCK_LOGS.filter(log => log.guard_id === guardId)
  },

  async toggleGuardStatus(guardId: string, active: boolean) {
    // Mock: sin backend aún
    console.log(`[Mock] Toggle guard ${guardId} to ${active ? 'active' : 'inactive'}`);
    return Promise.resolve();
}
}