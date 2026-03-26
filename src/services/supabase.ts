
import { createClient } from '@supabase/supabase-js'

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


async function devAuthLockNoOp<R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  return fn()
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    ...(import.meta.env.DEV ? { lock: devAuthLockNoOp } : {}),
  },
  global: {
    headers: {
      'x-my-custom-header': 'prosoftware'
    }
  }
})
