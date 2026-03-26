/**
 * Base URL de la app para enlaces de Supabase Auth (confirmación de correo, etc.).
 * En Vercel define VITE_PUBLIC_SITE_URL=https://tu-app.vercel.app para que el
 * redirect del correo apunte a producción aunque el admin cree usuarios desde local.
 */
export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}
