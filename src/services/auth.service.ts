// ============================================================
// Todas las funciones de autenticación con Supabase Auth
// ============================================================

import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { LoginForm, RegisterForm } from '../types/index'

export async function loginWithEmail({ email, password }: LoginForm) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function registerUser({
  name,
  email,
  password,
  phone,
  role,
  community_id,
}: RegisterForm) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  if (error) throw error

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name, phone, role, community_id, email })
      .eq('id', data.user.id)

    if (profileError) throw profileError
  }

  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getCurrentProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) throw error
  return data
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}
