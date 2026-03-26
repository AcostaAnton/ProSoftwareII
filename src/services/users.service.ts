import { supabase } from './supabase'
import { isUnitsCoOwnerColumnError } from './units.schema'
import { getPublicSiteUrl } from '../utils/publicSiteUrl'
import type { Profile } from '../types'
import type { UserRole, ProfileStatus } from '../types'


export const MAX_RESIDENTS_PER_UNIT = 2


export async function getProfilesByCommunity(communityId: string): Promise<Profile[]> {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('community_id', communityId)
    .order('name', { ascending: true })

  if (profilesError) throw profilesError
  const profiles = (profilesData ?? []) as Profile[]
  if (profiles.length === 0) return []

  let unitsData:
    | { owner_id: string | null; co_owner_id: string | null; number: string }[]
    | null = null

  const withCo = await supabase
    .from('units')
    .select('owner_id, co_owner_id, number')
    .eq('community_id', communityId)

  if (withCo.error && isUnitsCoOwnerColumnError(withCo.error)) {
    const legacy = await supabase
      .from('units')
      .select('owner_id, number')
      .eq('community_id', communityId)
    if (legacy.error) throw legacy.error
    unitsData = (legacy.data ?? []).map((u) => ({
      ...(u as { owner_id: string | null; number: string }),
      co_owner_id: null as string | null,
    }))
  } else if (withCo.error) {
    throw withCo.error
  } else {
    unitsData = (withCo.data ?? []) as {
      owner_id: string | null
      co_owner_id: string | null
      number: string
    }[]
  }

  const unitByProfile = new Map<string, string>()
  for (const u of unitsData ?? []) {
    if (u.owner_id) unitByProfile.set(u.owner_id, u.number)
    if (u.co_owner_id) unitByProfile.set(u.co_owner_id, u.number)
  }

  return profiles.map((p) => ({
    ...p,
    unit_number: unitByProfile.get(p.id) ?? null,
  }))
}


export type CommunityUnitRow = {
  id: string
  number: string
  owner_id: string | null
  co_owner_id: string | null
}


export async function getUnitsByCommunityForSelect(communityId: string): Promise<CommunityUnitRow[]> {
  const full = await supabase
    .from('units')
    .select('id, number, owner_id, co_owner_id')
    .eq('community_id', communityId)
    .order('number', { ascending: true })

  if (full.error && isUnitsCoOwnerColumnError(full.error)) {
    const legacy = await supabase
      .from('units')
      .select('id, number, owner_id')
      .eq('community_id', communityId)
      .order('number', { ascending: true })
    if (legacy.error) throw legacy.error
    return ((legacy.data ?? []) as { id: string; number: string; owner_id: string | null }[]).map(
      (r) => ({ ...r, co_owner_id: null }),
    )
  }
  if (full.error) throw full.error
  return (full.data ?? []) as CommunityUnitRow[]
}

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

export type CommunityOption = { id: string; name: string }


export async function getCommunitiesForSelect(): Promise<CommunityOption[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as CommunityOption[]
}


export async function getCommunityNameById(communityId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('name')
    .eq('id', communityId)
    .maybeSingle()

  if (error) {
    console.error('Error obteniendo nombre de comunidad:', error)
    return null
  }
  return data?.name ?? null
}




export async function clearProfileFromAllUnits(profileId: string): Promise<void> {
  const { error: eOwner } = await supabase
    .from('units')
    .update({ owner_id: null })
    .eq('owner_id', profileId)
  if (eOwner) throw eOwner

  const { error: eCo } = await supabase
    .from('units')
    .update({ co_owner_id: null })
    .eq('co_owner_id', profileId)
  if (eCo && !isUnitsCoOwnerColumnError(eCo)) throw eCo
}

export type UpdateProfileCommunityRoleUnitInput = {
  role: UserRole
  status: ProfileStatus
  communityId: string
  
  unitNumber: string | null
}


export async function updateProfileCommunityRoleStatusAndUnit(
  profileId: string,
  payload: UpdateProfileCommunityRoleUnitInput
): Promise<void> {
  await clearProfileFromAllUnits(profileId)

  const { data: updatedProfile, error: upProf } = await supabase
    .from('profiles')
    .update({
      role: payload.role,
      status: payload.status,
      community_id: payload.communityId,
    })
    .eq('id', profileId)
    .select('id')
    .maybeSingle()

  if (upProf) throw upProf
  if (!updatedProfile?.id) {
    throw new Error(
      'No se actualizó ningún perfil. Revisa que exista el usuario y que RLS permita a tu admin actualizar perfiles de esa comunidad.',
    )
  }

  const unit = payload.unitNumber?.trim()
  if (payload.role === 'resident' && unit) {
    await assignUnitIfSpecified(payload.communityId, unit, profileId)
  }
}

export type CreateCommunityUserInput = {
  email: string
  name: string
  phone: string | null
  role: UserRole
  status: ProfileStatus
  communityId: string
  unitNumber: string | null
}

function generateTempPassword(): string {
  const bytes = new Uint8Array(14)
  crypto.getRandomValues(bytes)
  const base = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `Pw${base}Aa1!`
}

async function assignUnitIfSpecified(
  communityId: string,
  unitNumber: string,
  ownerId: string
): Promise<void> {
  const number = unitNumber.trim()
  if (!number) return

  const fullSel = await supabase
    .from('units')
    .select('id, owner_id, co_owner_id')
    .eq('community_id', communityId)
    .eq('number', number)
    .maybeSingle()

  let row: { id: string; owner_id: string | null; co_owner_id: string | null }
  let schemaHasCoOwnerColumn = true

  if (fullSel.error && isUnitsCoOwnerColumnError(fullSel.error)) {
    schemaHasCoOwnerColumn = false
    const leg = await supabase
      .from('units')
      .select('id, owner_id')
      .eq('community_id', communityId)
      .eq('number', number)
      .maybeSingle()
    if (leg.error) throw leg.error
    if (!leg.data) {
      throw new Error(
        `No existe la unidad "${number}" en esta comunidad. Verifica el número o crea la unidad antes.`,
      )
    }
    row = { ...(leg.data as { id: string; owner_id: string | null }), co_owner_id: null }
  } else if (fullSel.error) {
    throw fullSel.error
  } else if (!fullSel.data) {
    throw new Error(
      `No existe la unidad "${number}" en esta comunidad. Verifica el número o crea la unidad antes.`,
    )
  } else {
    row = fullSel.data as { id: string; owner_id: string | null; co_owner_id: string | null }
  }

  const owner = row.owner_id
  const co = row.co_owner_id ?? null

  if (owner === ownerId || co === ownerId) return

  if (!owner) {
    const { error: upErr } = await supabase
      .from('units')
      .update({ owner_id: ownerId })
      .eq('id', row.id)
    if (upErr) throw upErr
    return
  }

  if (!schemaHasCoOwnerColumn) {
    if (owner !== ownerId) {
      throw new Error(`La unidad "${number}" ya está asignada a otro residente.`)
    }
    return
  }

  if (!co) {
    const { error: upCo } = await supabase
      .from('units')
      .update({ co_owner_id: ownerId })
      .eq('id', row.id)
    if (upCo) throw upCo
    return
  }

  throw new Error(
    `La unidad "${number}" ya tiene el máximo de ${MAX_RESIDENTS_PER_UNIT} residentes.`,
  )
}


export async function createCommunityUser(input: CreateCommunityUserInput): Promise<void> {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!email || !name) throw new Error('Correo y nombre son obligatorios.')

  const base = getPublicSiteUrl()
  const password = generateTempPassword()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: input.role, must_change_password: true },
      emailRedirectTo: base ? `${base}/login` : undefined,
    },
  })

  if (error) throw error

  if (data.session != null) {
    await supabase.auth.signOut()
    throw new Error(
      'Usuario posiblemente creado, pero tu sesión de administrador se cerró: en Supabase Auth activa "Confirm email" para que crear usuarios no cambie la sesión. Vuelve a iniciar sesión.',
    )
  }

  const userId = data.user?.id
  if (!userId) {
    throw new Error(
      'No se obtuvo el id del usuario. Revisa si el correo ya está registrado o la política de confirmación en Supabase.',
    )
  }

  const row = {
    id: userId,
    name,
    phone: input.phone?.trim() || '',
    role: input.role,
    status: input.status,
    community_id: input.communityId,
    email,
  }

  const { data: savedProfile, error: profileError } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .maybeSingle()

  if (profileError) throw profileError
  if (!savedProfile?.id) {
    throw new Error(
      'No se pudo guardar el perfil del usuario. Revisa políticas RLS en `profiles` (admin debe poder insertar/actualizar perfiles de su comunidad) o que exista la fila tras el registro.',
    )
  }

  if (input.role === 'resident' && input.unitNumber?.trim()) {
    await assignUnitIfSpecified(input.communityId, input.unitNumber, userId)
  }
}
