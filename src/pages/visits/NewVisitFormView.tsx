import type {
    ChangeEvent,
    CSSProperties,
    FormEvent,
    ReactNode
} from 'react'
import type { NewVisitForm } from '../../types/index'
import {
    HOUR_OPTIONS,
    MINUTE_OPTIONS,
    PERIOD_OPTIONS
} from './newVisit.helpers'
import { Button } from '../../components/ui/Button'

interface NewVisitFormViewProps {
    error: string | null
    formData: NewVisitForm
    isSubmitting: boolean
    minVisitDate: string
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

interface FieldProps {
    children: ReactNode
    htmlFor: string
    label: string
    required?: boolean
}

interface SelectOption {
    label: string
    value: string
}

const controlStyle: CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a2024',
    border: '1px solid #2a3034',
    borderRadius: '20px',
    color: '#ffffff',
    fontSize: '16px'
}

const styles = {
    page: {
        backgroundColor: '#080c0f',
        minHeight: '100vh',
        padding: '20px',
        color: '#ffffff'
    },
    container: {
        maxWidth: '400px',
        margin: '0 auto'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '10px'
    },
    description: {
        color: '#a0a0a0',
        marginBottom: '30px'
    },
    error: {
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#2a3034',
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        color: '#ff6b6b'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        color: '#b0b0b0'
    },
    timeGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px'
    },
    input: controlStyle,
    select: controlStyle,
    submitButton: {
        width: '100%',
        borderRadius: 20,
        fontSize: 16,
        color: '#000000',
    },
} satisfies Record<string, CSSProperties>

function Field({ children, htmlFor, label, required = false }: FieldProps) {
    return (
        <div style={styles.field}>
            <label htmlFor={htmlFor} style={styles.label}>
                {label}
                {required ? ' *' : ''}
            </label>
            {children}
        </div>
    )
}

function renderOptions(fieldName: string, options: readonly SelectOption[]) {
    const optionElements = []

    for (const option of options) {
        const key = `${fieldName}-${option.value || option.label}`

        optionElements.push(
            <option key={key} value={option.value}>
                {option.label}
            </option>
        )
    }

    return optionElements
}

function renderError(error: string | null) {
    if (!error) {
        return null
    }

    return <div style={styles.error}>{error}</div>
}

function renderSubmitLabel(isSubmitting: boolean) {
    if (isSubmitting) {
        return 'Creando...'
    }

    return 'Crear visita y generar QR'
}

function NewVisitFormView({
    error,
    formData,
    isSubmitting,
    minVisitDate,
    onChange,
    onSubmit
}: NewVisitFormViewProps) {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>Nueva visita</h1>
                <p style={styles.description}>Completa los datos para generar el QR de acceso.</p>

                {renderError(error)}

                <form onSubmit={onSubmit} style={styles.form}>
                    <Field label="Nombre del visitante" htmlFor="visitor_name" required>
                        <input
                            id="visitor_name"
                            name="visitor_name"
                            type="text"
                            value={formData.visitor_name}
                            onChange={onChange}
                            placeholder="Nombre Apellido"
                            required
                            style={styles.input}
                        />
                    </Field>

                    <Field label="Telefono" htmlFor="visitor_phone">
                        <input
                            id="visitor_phone"
                            name="visitor_phone"
                            type="tel"
                            value={formData.visitor_phone}
                            onChange={onChange}
                            placeholder="9999-9999"
                            style={styles.input}
                        />
                    </Field>

                    <Field label="Fecha" htmlFor="visit_date" required>
                        <input
                            id="visit_date"
                            name="visit_date"
                            type="date"
                            value={formData.visit_date}
                            onChange={onChange}
                            min={minVisitDate}
                            required
                            style={styles.input}
                        />
                    </Field>

                    <Field label="Hora" htmlFor="visit_hour" required>
                        <div style={styles.timeGrid}>
                            <select
                                id="visit_hour"
                                name="visit_hour"
                                value={formData.visit_hour}
                                onChange={onChange}
                                required
                                style={styles.select}
                            >
                                {renderOptions('visit_hour', HOUR_OPTIONS)}
                            </select>

                            <select
                                id="visit_minute"
                                name="visit_minute"
                                value={formData.visit_minute}
                                onChange={onChange}
                                required
                                style={styles.select}
                            >
                                {renderOptions('visit_minute', MINUTE_OPTIONS)}
                            </select>

                            <select
                                id="visit_period"
                                name="visit_period"
                                value={formData.visit_period}
                                onChange={onChange}
                                required
                                style={styles.select}
                            >
                                {renderOptions('visit_period', PERIOD_OPTIONS)}
                            </select>
                        </div>
                    </Field>

                    <Field label="Asunto" htmlFor="visit_purpose">
                        <input
                            id="visit_purpose"
                            name="visit_purpose"
                            type="text"
                            value={formData.visit_purpose}
                            onChange={onChange}
                            placeholder="Motivo de la visita"
                            style={styles.input}
                        />
                    </Field>

                    <Field label="A donde va" htmlFor="visit_destination">
                        <input
                            id="visit_destination"
                            name="visit_destination"
                            type="text"
                            value={formData.visit_destination}
                            onChange={onChange}
                            placeholder="Unidad o lugar de destino"
                            style={styles.input}
                        />
                    </Field>

                    <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting} style={styles.submitButton}>
                        {renderSubmitLabel(isSubmitting)}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default NewVisitFormView
