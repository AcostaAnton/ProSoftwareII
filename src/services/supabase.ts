// src/services/supabase.ts
// ============================================================
// Cliente de Supabase — punto central de conexión
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno del archivo .env.local
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables de entorno.\n' +
    'Crea un archivo .env.local con:\n' +
    'VITE_SUPABASE_URL=...\n' +
    'VITE_SUPABASE_ANON_KEY=...'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase