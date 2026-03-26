
export function getVisitorAccessUrl(qrToken: string): string {
    const path = `/acceso/${encodeURIComponent(qrToken)}`

    const envBase =
        typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL
            ? String(import.meta.env.VITE_PUBLIC_APP_URL).trim()
            : ''
    if (envBase) {
        return `${envBase.replace(/\/$/, '')}${path}`
    }

    if (typeof window === 'undefined') {
        return path
    }

    const loc = window.location
    let protocol = loc.protocol
    let host = loc.host

    const isLocal =
        loc.hostname === 'localhost' ||
        loc.hostname === '127.0.0.1' ||
        loc.hostname === '[::1]'

    if (typeof import.meta !== 'undefined' && import.meta.env.DEV && isLocal) {
        protocol = 'http:'
        if (loc.hostname === 'localhost' || loc.hostname === '[::1]') {
            host = loc.port ? `127.0.0.1:${loc.port}` : '127.0.0.1'
        }
    }

    return `${protocol}//${host}${path}`
}

