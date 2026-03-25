import type { CreateVisitInput, NewVisitForm } from '../../types/index'

export const INITIAL_NEW_VISIT_FORM: NewVisitForm = {
    visitor_name: '',
    visitor_phone: '',
    visit_date: '',
    visit_hour: '12',
    visit_minute: '00',
    visit_period: 'AM',
    visit_purpose: ''
}

export const HOUR_OPTIONS = buildHourOptions()

export const MINUTE_OPTIONS = [
    { value: '', label: 'Min' },
    { value: '00', label: '00' },
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' }
]

export const PERIOD_OPTIONS = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
]

export function getTodayInputDate(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export function validateNewVisitForm(formData: NewVisitForm): string | null {
    if (!formData.visitor_name.trim()) {
        return 'El nombre del visitante es requerido'
    }

    if (!normalizeVisitDate(formData.visit_date)) {
        return 'La fecha de la visita es requerida'
    }

    if (!formData.visit_hour || !formData.visit_minute || !formData.visit_period) {
        return 'La hora de la visita es requerida'
    }

    return null
}

export function buildCreateVisitInput(
    formData: NewVisitForm,
    residentId: string
): CreateVisitInput {
    const visitDate = normalizeVisitDate(formData.visit_date)

    if (!visitDate) {
        throw new Error('La fecha de la visita es requerida')
    }

    return {
        resident_id: residentId,
        visitor_name: formData.visitor_name.trim(),
        visitor_phone: normalizePhone(formData.visitor_phone),
        visit_date: visitDate,
        visit_time: buildVisitTime(formData.visit_hour, formData.visit_minute, formData.visit_period),
        visit_purpose: normalizeOptionalText(formData.visit_purpose),
        visit_destination: null,
        status: 'pending'
    }
}

export function updateNewVisitForm(
    formData: NewVisitForm,
    fieldName: keyof NewVisitForm,
    value: string
): NewVisitForm {
    return {
        ...formData,
        [fieldName]: value
    }
}

function normalizeVisitDate(value: string): string {
    if (!value) {
        return ''
    }

    if (!value.includes('/')) {
        return value
    }

    const [day, month, year] = value.split('/')

    if (!day || !month || !year) {
        return ''
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function normalizePhone(value: string): string | null {
    const cleanedPhone = value.replace(/[\s-]/g, '').trim()
    return cleanedPhone || null
}

function normalizeOptionalText(value: string): string | null {
    const normalizedValue = value.trim()
    return normalizedValue || null
}

function buildVisitTime(
    hourValue: string,
    minuteValue: string,
    period: NewVisitForm['visit_period']
): string {
    const hour = Number.parseInt(hourValue, 10)

    if (Number.isNaN(hour)) {
        throw new Error('La hora de la visita es requerida')
    }

    const hour24 = period === 'PM'
        ? (hour === 12 ? 12 : hour + 12)
        : (hour === 12 ? 0 : hour)

    return `${hour24.toString().padStart(2, '0')}:${minuteValue}`
}

function buildHourOptions() {
    const options = [{ value: '', label: 'Hora' }]

    for (let hour = 1; hour <= 12; hour += 1) {
        options.push({
            value: String(hour).padStart(2, '0'),
            label: String(hour)
        })
    }

    return options
}
