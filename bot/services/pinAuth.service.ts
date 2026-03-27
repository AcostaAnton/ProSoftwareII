import { getSupabase } from './supabase'

interface AuthResult {
  success: boolean
  userId?: string
  userName?: string
  userRole?: string
  userEmail?: string
  error?: string
  session?: any
}

/**
 * Autentica al usuario con email y contraseña
 * Usa las mismas credenciales que la aplicación web
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = getSupabase()

    // Autenticar con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      console.error('Error en Supabase Auth:', error?.message || 'Usuario no encontrado')
      return {
        success: false,
        error: `Email o contraseña incorrectos (${error?.message || 'inválido'})`,
      }
    }

    // Obtener información del perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role, email')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'No se encontró el perfil del usuario.',
      }
    }

    // Verificar que sea residente (o admin si lo necesitas)
    if (profile.role !== 'resident' && profile.role !== 'admin') {
      return {
        success: false,
        error: 'Solo residentes pueden usar este bot.',
      }
    }

    return {
      success: true,
      userId: data.user.id,
      userName: profile.name || 'Usuario',
      userRole: profile.role,
      userEmail: profile.email,
      session: data.session,
    }
  } catch (error) {
    console.error('Error autenticando usuario:', error)
    return {
      success: false,
      error: 'Error al autenticar. Intenta de nuevo.',
    }
  }
}

/**
 * Vincula una cuenta de Telegram con un usuario autenticado
 */
export async function linkTelegramUser(
  telegramId: number,
  telegramUsername: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = getSupabase()

    const { error } = await supabase.from('telegram_users').insert([
      {
        telegram_id: telegramId.toString(),
        telegram_username: telegramUsername,
        user_id: userId,
        linked_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.warn('Error vinculando usuario de Telegram:', error.message)
      // No lanzar error, ya que podría estar duplicado
      return true // Asumir que ya estaba vinculado
    }

    return true
  } catch (error) {
    console.error('Error vinculando usuario de Telegram:', error)
    return false
  }
}
