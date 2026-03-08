// ============================================================
// Servicios auxiliares para construir el dashboard
// ============================================================

import type { Profile, Unit } from '../types/index'
import { supabase } from './supabase'

// - Obtener perfiles por una lista de IDs
export async function getProfilesByIds(profileIds: string[]): Promise<Profile[]> {
  if (profileIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profileIds)

  if (error) throw error
  return (data ?? []) as Profile[]
}

// - Obtener unidades por lista de propietarios
export async function getUnitsByOwnerIds(ownerIds: string[]): Promise<Unit[]> {
  if (ownerIds.length === 0) return []

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .in('owner_id', ownerIds)

  if (error) throw error
  return (data ?? []) as Unit[]
}