// ============================================================
// Servicios para gestionar visitas
// ============================================================

import type { Visit } from '../types/index'
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
  return Math.random().toString(36).substring(2, 10)
}

// - Crear una nueva visita
export async function createVisit(
  visitData: Omit<Visit, 'id' | 'created_at' | 'qr_token'>
) {
  const qr_token = generateQRToken()

  const { data, error } = await supabase
    .from('visits')
    .insert([{ ...visitData, qr_token }])
    .select()
    .single()

  if (error) throw error
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
export async function getVisitById(visitId: string): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', visitId)
    .single()

  if (error) throw error
  return data as Visit
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

// - Verificar si los campos opcionales existen
export async function checkOptionalFields() {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('visit_purpose, visit_destination')
      .limit(1)

    if (error) throw error
    return { exist: true, data }
  } catch (error) {
    return { exist: false, error }
  }
}