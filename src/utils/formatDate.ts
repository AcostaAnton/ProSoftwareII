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

export const formatTime = (timeString: string): string => {
    return timeString
}

export const formatDateTime = (dateString: string, timeString: string): string => {
    return `${formatDate(dateString)} a las ${formatTime(timeString)}`
}
