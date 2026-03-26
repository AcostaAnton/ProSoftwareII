
import { createContext, useContext, useState, useEffect } from 'react'
import type {ReactNode} from 'react'
import { supabase } from '../services/supabase'
import { getCurrentProfile } from '../services/auth.service'
import type {AuthUser, Profile, UserRole} from '../types/index'

function mustChangePasswordFromMetadata(
    u: { user_metadata?: Record<string, unknown> } | undefined,
): boolean {
    return u?.user_metadata?.must_change_password === true
}

interface AuthContextType {
    user: AuthUser | null
    profile: Profile | null
    role: UserRole | null
    isLoading: boolean
    logout: () => Promise<void>
    
    syncAuthFromSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    role: null,
    isLoading: true,
    logout: async () => {},
    syncAuthFromSession: async () => {},
})


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setLoading] = useState(true)

    
    const PROFILE_TIMEOUT_MS = 8000

    async function loadProfile(
        userId: string,
        email: string,
        mustChangePassword: boolean,
    ) {
        try {
            const profilePromise = getCurrentProfile(userId)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Profile timeout')), PROFILE_TIMEOUT_MS)
            )
            const profileData = await Promise.race([profilePromise, timeoutPromise])
            setProfile(profileData)
            setUser({ id: userId, email, profile: profileData, mustChangePassword })
        } catch (error) {
            console.error('Error al cargar el perfil:', error)
            throw error
        }
    }

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    const sessionUser = session?.user as { id: string; email?: string } | undefined

                    if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !sessionUser)) {
                        setUser(null)
                        setProfile(null)
                    }
                    else if (
                        sessionUser &&
                        (event === 'INITIAL_SESSION' ||
                            event === 'SIGNED_IN' ||
                            event === 'TOKEN_REFRESHED' ||
                            event === 'USER_UPDATED')
                    ) {
                        const mustChangePassword = mustChangePasswordFromMetadata(session?.user)
                        try {
                            await loadProfile(
                                sessionUser.id,
                                sessionUser.email ?? '',
                                mustChangePassword,
                            )
                        } catch {
                            setUser((prev) => {
                                if (prev?.id === sessionUser.id && prev.profile) {
                                    return { ...prev, mustChangePassword }
                                }
                                return {
                                    id: sessionUser.id,
                                    email: sessionUser.email ?? '',
                                    profile: null,
                                    mustChangePassword,
                                }
                            })
                            setProfile((prev) => {
                                if (prev?.id === sessionUser.id) return prev
                                return null
                            })
                        }
                    }
                } finally {
                    setLoading(false)
                }
            }
        )
        return () => {
            listener?.subscription?.unsubscribe()
        }
    }, [])

    async function logout() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    async function syncAuthFromSession() {
        const { data: { session } } = await supabase.auth.getSession()
        const sessionUser = session?.user
        if (!sessionUser) return
        const mustChangePassword = mustChangePasswordFromMetadata(sessionUser)
        setUser((prev) =>
            prev?.id === sessionUser.id ? { ...prev, mustChangePassword } : prev,
        )
    }

    const role = profile?.role ?? null

    return (
        <AuthContext.Provider
            value={{ user, profile, role, isLoading, logout, syncAuthFromSession }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
    return ctx
}

export default AuthContext
