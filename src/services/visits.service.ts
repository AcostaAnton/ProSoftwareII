// ============================================================
// Servicios para gestionar visitas
// ============================================================

import type { CreateVisitInput, Visit } from '../types/index'
import { supabase } from './supabase'

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
    qr_token
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
export async function getAllVisits(): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
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

