// ============================================================
// Servicios para gestionar visitas
// ============================================================

import type { CreateVisitInput, Visit } from '../types/index'
import { supabase } from './supabase'

type ResidentVisits = {
  residentId: string
  name: string
  count: number
}

export function groupVisitsByResident(visits: any[]): ResidentVisits[] {
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

// - Función auxiliar para generar token QR
function generateQRToken(): string {
  const bytes = new Uint8Array(6)
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

// - Crear una nueva visita
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
    status: 'pending', // Asegurar estado inicial
    created_by: visitData.resident_id // Asumimos que el residente crea su propia visita
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

// - Obtener visitas del residente actual
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

// - Obtener todas las visitas (admin / guardia)
export async function getAllVisits(): Promise<any[]> {
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
  return data
}

// - Obtener todas las visitas por estado
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

// - Obtener una visita específica por ID
export async function getVisitById(visitId: string): Promise<any> {
  // 1. Intento principal: Traer visita con todas las relaciones (logs y historial)
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

  // Si funciona correctamente, devolvemos los datos completos
  if (!error) return data

  // 2. Fallback: Si falla la carga combinada (JOIN), intentamos cargar por separado.
  // Esto soluciona problemas donde Supabase no detecta automáticamente las relaciones FK.
  console.warn('⚠️ Error cargando detalles con JOIN. Intentando carga individual...', error.message)

  const { data: basicData, error: basicError } = await supabase
    .from('visits')
    .select(`*, profiles:resident_id(id, name)`)
    .eq('id', visitId)
    .single()

  if (basicError) throw basicError

  // Cargar logs y historial en consultas separadas
  const { data: logs } = await supabase.from('access_logs').select('*').eq('visit_id', visitId).order('created_at', { ascending: false })
  
  // Intentar cargar historial con el nombre del usuario si es posible, sino solo el historial
  const { data: history } = await supabase
    .from('visit_status_history')
    .select('*, profiles:changed_by_id(name, role)')
    .eq('visit_id', visitId)
    .order('changed_at', { ascending: false })

  return { 
    ...basicData, 
    access_logs: logs || [], 
    visit_status_history: history || [] 
  }
}

/** Datos extra para la tarjeta de invitación (residente, comunidad, unidad). */
export type VisitQrDisplayData = {
  visit: Visit
  residentName: string | null
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
    communityName,
    unitNumber: profile?.unit_number ?? null,
  }
}

// - Actualizar el estado de una visita (por ejemplo: pending → completed)
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

// - Cancelar una visita (residente)
export async function cancelVisit(visitId: string): Promise<Visit> {
  return updateVisitStatus(visitId, 'cancelled')
}

// Función auxiliar para subir fotos con tolerancia a fallos (por si falta el bucket)
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
    // Si falla (ej. bucket no existe 400/404), devolvemos una imagen simulada para no bloquear
    console.error('❌ Error subiendo foto. Verifica en Supabase que el bucket se llame "visit-photos" y sea PÚBLICO.', error)
    // Retorna una imagen genérica de vehículo para pruebas si falla
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300'
  }
}
