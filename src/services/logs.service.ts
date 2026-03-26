
import { supabase } from './supabase'
import type { AccessLog } from '../types/index'

export async function createAccessLog(
  visitId: string,
  guardId: string
): Promise<AccessLog> {
  const { data, error } = await supabase
    .from('access_logs')
    .insert([{ visit_id: visitId, guard_id: guardId }])
    .select()
    .single()

  if (error) throw error
  return data as AccessLog
}

export async function getLogsByGuard(guardId: string): Promise<AccessLog[]> {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .eq('guard_id', guardId)
    .order('entry_time', { ascending: false })

  if (error) throw error
  return (data ?? []) as AccessLog[]
}

export async function getLogsByVisit(visitId: string): Promise<AccessLog[]> {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .eq('visit_id', visitId)
    .order('entry_time', { ascending: false })

  if (error) throw error
  return (data ?? []) as AccessLog[]
}

