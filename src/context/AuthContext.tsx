// ============================================================
// Contexto global de autenticación
// Provee: usuario, perfil, rol, loading, login, logout
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import type {ReactNode} from 'react'
import { supabase } from '../services/supabase'
import { GetCurrentProfile } from '../services/auth.service'
import type {AuthUser, Profile, UserRole} from '../types/index'

// - Tipos de contexto
interface AuthContextType {
    user: AuthUser | null
    profile: Profile | null
    role: UserRole | null
    isLoading: boolean
    logout: () => Promise<void>
}

// - Contexto
const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    role: null,
    isLoading: true,
    logout: async () => {}
})

// - Provider

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setLoading] = useState(true)

    // - Carga el perfil completo desde supabase
    
    const PROFILE_TIMEOUT_MS = 8000

    async function loadProfile(userId: string, email: string) {
        try {
            const profilePromise = GetCurrentProfile(userId)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Profile timeout')), PROFILE_TIMEOUT_MS)
            )
            const profileData = await Promise.race([profilePromise, timeoutPromise])
            setProfile(profileData)
            setUser({ id: userId, email, profile: profileData })
        } catch (error) {
            console.error('Error al cargar el perfil:', error)
            setProfile(null)
            setUser({ id: userId, email, profile: null })
        }
    }

    // - Efecto para escuchar cambios de sesion
    useEffect(() => {
        // 1 - Verificar sesion existente al cargar la app
        supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
            const session = data.session as { user: { id: string; email?: string } } | null
            if (session) {
                void loadProfile(session.user.id, session.user.email ?? '').finally(() => setLoading(false))
            } else {
                setLoading(false)
            }
        })
        // 2 - Escuchar cambios futuros (login/logout). Siempre poner loading false al terminar.
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    if (event === 'SIGNED_IN' && session?.user) {
                        await loadProfile(session.user.id, session.user.email ?? '')
                    }
                    if (event === 'SIGNED_OUT') {
                        setUser(null)
                        setProfile(null)
                    }
                } finally {
                    setLoading(false)
                }
            }
        )
        // 3 - Limpiar listener al desmontar el componente
        return () => {
            listener?.subscription?.unsubscribe()
        }
    }, [])

    // - Logout
    async function logout() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    const role = profile?.role ?? null

    return (
        <AuthContext.Provider value={{ user, profile, role, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// - Hook para usar el contexto
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
    return ctx
}

export default AuthContext