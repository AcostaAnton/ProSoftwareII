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

/**
 * En desarrollo, React Strict Mode monta/desmonta efectos dos veces. Eso puede dejar
 * el candado de Navigator LockManager de auth-js “huérfano” (~5s) y provocar timeouts
 * al cargar el perfil. Un lock no-op solo en DEV evita ese conflicto; en producción
 * se sigue usando el candado por defecto (mejor con varias pestañas).
 */
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