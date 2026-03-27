import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../config'

let supabaseClient: SupabaseClient | null = null

export function initSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    db: {
      schema: 'public',
    },
  })

  return supabaseClient
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase no ha sido inicializado. Llamar a initSupabase() primero.')
  }
  return supabaseClient
}
