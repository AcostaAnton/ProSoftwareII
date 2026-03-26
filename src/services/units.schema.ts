
import type { PostgrestError } from '@supabase/supabase-js'


export function isUnitsCoOwnerColumnError(err: PostgrestError | null): boolean {
  if (!err) return false
  const blob = [err.message, err.details, err.hint].filter(Boolean).join(' ').toLowerCase()
  return (
    err.code === 'PGRST204' ||
    blob.includes('co_owner_id') ||
    (blob.includes('column') && (blob.includes('does not exist') || blob.includes('not find')))
  )
}

