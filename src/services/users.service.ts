// ============================================================
// Servicio de gestión de usuarios (perfiles por comunidad)
// ============================================================

import { supabase } from './supabase'
import type { Profile } from '../types'
import type { UserRole, ProfileStatus } from '../types'

/** Lista de todos los perfiles de la comunidad, con unit_number cuando son dueños de una unidad */
export async function getProfilesByCommunity(communityId: string): Promise<Profile[]> {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('community_id', communityId)
    .order('name', { ascending: true })

  if (profilesError) throw profilesError
  const profiles = (profilesData ?? []) as Profile[]
  if (profiles.length === 0) return []

  const ids = profiles.map((p) => p.id)
  const { data: unitsData, error: unitsError } = await supabase
    .from('units')
    .select('owner_id, number')
    .eq('community_id', communityId)
    .in('owner_id', ids)

  if (unitsError) throw unitsError
  const units = (unitsData ?? []) as { owner_id: string; number: string }[]
  const unitByOwner = new Map(units.map((u) => [u.owner_id, u.number]))

  return profiles.map((p) => ({
    ...p,
    unit_number: unitByOwner.get(p.id) ?? null,
  }))
}

// - Obtener todos los perfiles por estado
export async function getProfilesByStatus(
  status: Profile['status'], role: Profile['role']
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', status)
    .eq('role', role)

  if (error) throw error
  return data as Profile[]
}

/** Actualiza el rol de un perfil */
export async function updateProfileRole(profileId: string, role: UserRole): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

/** Actualiza rol y/o estado de un perfil */
export async function updateProfileRoleAndStatus(
  profileId: string,
  payload: { role: UserRole; status: ProfileStatus }
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: payload.role, status: payload.status })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}