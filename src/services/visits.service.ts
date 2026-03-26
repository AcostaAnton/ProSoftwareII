import type { CreateVisitInput, Visit } from '../types/index'
import { supabase } from './supabase'

export type ResidentVisits = {
  residentId: string
  name: string
  count: number
}

type VisitWithResidentSummary = Visit & {
  profiles?: {
    id?: string
    name?: string | null
  } | null
}

export type VisitAccessLogRecord = {
  id?: string
  entry_time: string
  exit_time?: string | null
  vehicle_photo_url?: string | null
  vehicle_notes?: string | null
  entry_notes?: string | null
  exit_notes?: string | null
}

export type VisitStatusHistoryRecord = {
  id?: string
  old_status: string
  new_status: Visit['status']
  changed_at: string
  notes?: string | null
  profiles?: {
    name?: string | null
    role?: string | null
  } | null
}

export type VisitDetailRecord = Visit & {
  access_logs?: VisitAccessLogRecord[]
  visit_status_history?: VisitStatusHistoryRecord[]
  profiles?: {
    id?: string
    name?: string | null
  } | null
}

export function groupVisitsByResident(visits: VisitWithResidentSummary[]): ResidentVisits[] {
  const map: Record<string, ResidentVisits> = {}

  visits.forEach((visit) => {
    const id = visit.resident_id
    const name = visit.profiles?.name || "Sin nombre"

    if (!map[id]) {
      map[id] = {
        residentId: id,
        name,
        count: 0
      }
    }

    map[id].count++
  })

  return Object.values(map)
}

function generateQRToken(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function normalizeNullableText(value?: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function isVisitFieldSchemaError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST204' ||
    error.message?.includes('visit_purpose') === true ||
    error.message?.includes('visit_destination') === true
  )
}

export async function createVisit(
  visitData: CreateVisitInput
) {
  const qr_token = generateQRToken()
  const payload = {
    ...visitData,
    visitor_name: visitData.visitor_name.trim(),
    visitor_phone: normalizeNullableText(visitData.visitor_phone),
    visit_time: normalizeNullableText(visitData.visit_time),
    visit_purpose: normalizeNullableText(visitData.visit_purpose),
    visit_destination: normalizeNullableText(visitData.visit_destination),
    qr_token,
    status: 'pending',
    created_by: visitData.resident_id
  }

  const { data, error } = await supabase
    .from('visits')
    .insert([payload])
    .select()
    .single()

  if (error) {
    if (isVisitFieldSchemaError(error)) {
      throw new Error('La base de datos todavia no tiene los campos de asunto y destino. Hay que aplicar la migracion de visits antes de crear la visita.')
    }
    throw error
  }
  return data as Visit
}

export async function getVisitsByResident(residentId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('resident_id', residentId)
    .order('visit_date', { ascending: false })
    .order('visit_time', { ascending: false })

  if (error) throw error
  return data as Visit[]
}

export async function getAllVisits(): Promise<VisitWithResidentSummary[]> {
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      profiles:resident_id (
        id,
        name
      )
    `)
    .order('visit_date', { ascending: false })
    .order('visit_time', { ascending: false })

  if (error) throw error
  return (data ?? []) as VisitWithResidentSummary[]
}

/**
 * Obtiene visitas con paginación y filtros opcionales.
 * Esta función está optimizada para cargar solo lo necesario.
 */
export async function getVisitsPaginated(
  page: number,
  pageSize: number,
  filters: { status?: Visit['status']; residentId?: string } = {},
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('visits')
    .select(
      `
      *,
      profiles:resident_id (
        id,
        name
      )
    `,
      { count: 'exact' },
    )
    .order('visit_date', { ascending: false })
    .order('visit_time', { ascending: false })
    .range(from, to)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.residentId) query = query.eq('resident_id', filters.residentId)

  const { data, error, count } = await query

  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export async function getVisitsByStatus(
  status: Visit['status']
): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('status', status)
    .order('visit_date', { ascending: false })
    .order('visit_time', { ascending: false })

  if (error) throw error
  return data as Visit[]
}

export async function getVisitById(visitId: string): Promise<VisitDetailRecord> {
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      profiles:resident_id (
        id,
        name
      ),
      access_logs (*),
      visit_status_history (
        *,
        profiles:changed_by_id (name, role)
      )
    `)
    .eq('id', visitId)
    .single()

  if (!error) return data as VisitDetailRecord

  console.warn('⚠️ Error cargando detalles con JOIN. Intentando carga individual...', error.message)

  const { data: basicData, error: basicError } = await supabase
    .from('visits')
    .select(`*, profiles:resident_id(id, name)`)
    .eq('id', visitId)
    .single()

  if (basicError) throw basicError

  const { data: logs } = await supabase.from('access_logs').select('*').eq('visit_id', visitId).order('created_at', { ascending: false })

  const { data: history } = await supabase
    .from('visit_status_history')
    .select('*, profiles:changed_by_id(name, role)')
    .eq('visit_id', visitId)
    .order('changed_at', { ascending: false })

  return {
    ...basicData, 
    access_logs: logs || [], 
    visit_status_history: history || [] 
  } as VisitDetailRecord
}

/** Datos extra para la tarjeta de invitación (residente, comunidad, unidad). */
export type VisitQrDisplayData = {
  visit: VisitDetailRecord
  residentName: string | null
  creatorName: string | null
  communityName: string | null
  unitNumber: string | null
}

export async function getVisitWithQrDisplay(visitId: string): Promise<VisitQrDisplayData> {
  const visit = await getVisitById(visitId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, unit_number, community_id')
    .eq('id', visit.resident_id)
    .maybeSingle()

  const creatorId = (visit as any).created_by || visit.resident_id
  let creatorName: string | null = null

  if (creatorId === visit.resident_id) {
    creatorName = profile?.name ?? null
  } else {
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', creatorId)
      .maybeSingle()
    creatorName = creatorProfile?.name ?? null
  }

  let communityName: string | null = null
  if (profile?.community_id) {
    const { data: comm } = await supabase
      .from('communities')
      .select('name')
      .eq('id', profile.community_id)
      .maybeSingle()
    communityName = comm?.name ?? null
  }

  return {
    visit,
    residentName: profile?.name ?? null,
    creatorName,
    communityName,
    unitNumber: profile?.unit_number ?? null,
  }
}

export async function updateVisitStatus(
  visitId: string,
  status: Visit['status']
): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .update({ status })
    .eq('id', visitId)
    .select()
    .single()

  if (error) throw error
  return data as Visit
}

export async function cancelVisit(visitId: string): Promise<Visit> {
  return updateVisitStatus(visitId, 'cancelled')
}

export async function uploadVisitPhoto(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  try {
    const { data, error } = await supabase.storage
      .from('visit-photos')
      .upload(filePath, file)

    if (error) throw error
    return data.path
  } catch (error) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300'
  }
}
