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

// - Función auxiliar para generar token QR
function generateQRToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
