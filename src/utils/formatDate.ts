export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (error) {
        return dateString
    }
}

export const formatTime = (timeString?: string | null): string => {
    if (!timeString) return ''
    try {
        const [hours, minutes] = timeString.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch (error) {
        return timeString
    }
}

export const formatDateTime = (dateString: string, timeString?: string | null): string => {
    return `${formatDate(dateString)} a las ${formatTime(timeString)}`
}

export const formatPhone = (phone?: string | null): string => {
    if (!phone || phone.length !== 8) return phone || ''
    return `${phone.slice(0, 4)}-${phone.slice(4)}`
}
