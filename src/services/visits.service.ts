// ============================================================
// Servicios para gestionar visitas
// ============================================================

import { supabase } from './supabase'
import type { Visit } from '../types/index'

// - Crear una nueva visita
export async function createVisit(visitData: Omit<Visit, 'id' | 'created_at' | 'qr_token'>) {
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
        .order('visit_date', { ascending: true })
        .order('visit_time', { ascending: true })

    if (error) throw error
    return data as Visit[]
}

// - Función auxiliar para generar token QR
function generateQRToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
