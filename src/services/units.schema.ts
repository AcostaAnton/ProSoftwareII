// ============================================================
// Compatibilidad: migración 003 (units.co_owner_id) opcional
// ============================================================

import type { PostgrestError } from '@supabase/supabase-js'

/** PostgREST suele devolver 400 / PGRST204 si la columna no está en el caché del esquema. */
export function isUnitsCoOwnerColumnError(err: PostgrestError | null): boolean {
  if (!err) return false
  const blob = [err.message, err.details, err.hint].filter(Boolean).join(' ').toLowerCase()
  return (
    err.code === 'PGRST204' ||
    blob.includes('co_owner_id') ||
    (blob.includes('column') && (blob.includes('does not exist') || blob.includes('not find')))
  )
}
