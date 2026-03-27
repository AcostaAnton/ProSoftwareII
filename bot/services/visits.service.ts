import { getSupabase } from './supabase'

export interface CreateVisitParams {
  resident_id: string
  visitor_name: string
  visitor_phone?: string | null
  visit_date: string
  visit_time?: string | null
  visit_purpose?: string | null
  visit_destination?: string | null
  created_by?: string | null
}

export interface VisitResponse {
  success: boolean
  visitId?: string
  qrToken?: string
  error?: string
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

/**
 * Crea una nueva visita en la base de datos
 */
export async function createVisit(params: CreateVisitParams): Promise<VisitResponse> {
  try {
    const supabase = getSupabase()
    const qr_token = generateQRToken()

    const visitData = {
      resident_id: params.resident_id,
      visitor_name: params.visitor_name.trim(),
      visitor_phone: normalizeNullableText(params.visitor_phone),
      visit_date: params.visit_date,
      visit_time: normalizeNullableText(params.visit_time),
      visit_purpose: normalizeNullableText(params.visit_purpose),
      visit_destination: normalizeNullableText(params.visit_destination),
      qr_token,
      status: 'pending',
      created_at: new Date().toISOString(),
      created_by: params.created_by || params.resident_id,
    }

    const { data, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select('id')
      .single()

    if (error) {
      console.error('Error creando visita:', error)
      return {
        success: false,
        error: 'Error al crear la visita. Intenta de nuevo.',
      }
    }

    return {
      success: true,
      visitId: data.id,
      qrToken: qr_token,
    }
  } catch (error) {
    console.error('Error en createVisit:', error)
    return {
      success: false,
      error: 'Error inesperado al crear la visita.',
    }
  }
}

/**
 * Obtiene las visitas recientes del residente
 */
export async function getResidentVisits(residentId: string, limit: number = 5) {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('visits')
      .select('id, visitor_name, visit_date, status')
      .eq('resident_id', residentId)
      .order('visit_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error obteniendo visitas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error en getResidentVisits:', error)
    return []
  }
}

/**
 * Obtiene información del residente
 */
export async function getResidentInfo(residentId: string) {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, community_id')
      .eq('id', residentId)
      .eq('role', 'resident')
      .single()

    if (error) {
      console.error('Error obteniendo información del residente:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error en getResidentInfo:', error)
    return null
  }
}

/**
 * Obtiene el nombre de la comunidad
 */
export async function getCommunityName(communityId: string): Promise<string | null> {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single()

    if (error) {
      console.error('Error obteniendo comunidad:', error)
      return null
    }

    return data?.name || null
  } catch (error) {
    console.error('Error en getCommunityName:', error)
    return null
  }
}
