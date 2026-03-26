
export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

