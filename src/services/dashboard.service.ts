
import type { Profile, Unit } from '../types/index'
import { supabase } from './supabase'
import { isUnitsCoOwnerColumnError } from './units.schema'

export async function getProfilesByIds(profileIds: string[]): Promise<Profile[]> {
  if (profileIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profileIds)

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function getUnitsByOwnerIds(ownerIds: string[]): Promise<Unit[]> {
  if (ownerIds.length === 0) return []

  const { data: byOwner, error: errOwner } = await supabase
    .from('units')
    .select('*')
    .in('owner_id', ownerIds)

  if (errOwner) throw errOwner

  const { data: byCo, error: errCo } = await supabase
    .from('units')
    .select('*')
    .in('co_owner_id', ownerIds)

  let coList: Unit[] = []
  if (!errCo) {
    coList = (byCo ?? []) as Unit[]
  } else if (!isUnitsCoOwnerColumnError(errCo)) {
    throw errCo
  }

  const map = new Map<string, Unit>()
  for (const u of [...(byOwner ?? []), ...coList] as Unit[]) {
    map.set(u.id, u)
  }
  return [...map.values()]
}
