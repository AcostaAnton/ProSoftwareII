// ============================================================
// Todas las funciones de autenticación con Supabase Auth
// ============================================================

import { supabase } from './supabase'
import type { LoginForm, RegisterForm } from '../types/index'

//- Login con email y contraseña

export async function LoginWithEmail({email, password}: LoginForm) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) throw error
    return data
}

// - Registro de nuevo usuario

export async function RegisterUser({name,email, password, phone, role, community_id}: RegisterForm) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {name,role},
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

// - Cerrar sesión

export async function Logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// - Obtener sesión actual

export async function GetCurrentSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
}

// - Obtener usuario actual

export async function GetCurrentUser() {
    const  {data, error} = await supabase.auth.getUser()
    if (error) throw error
    return data.user
}

// - Obtener perfil del usuario actual

export async function GetCurrentProfile(userId: string) {
    const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

    if (error) throw error
    return data  
}

// - Escuchar cambios de sesion (login/logout)

export function onAuthStateChange(callback: (event: string , session: any) => void) {
    supabase.auth.onAuthStateChange(callback)
}