import type {
    ChangeEvent,
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
import './visitPages.css'

interface NewVisitFormViewProps {
    error: string | null
    formData: NewVisitForm
    isSubmitting: boolean
    minVisitDate: string
    onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void
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

function Field({ children, htmlFor, label, required = false }: FieldProps) {
    return (
        <div className="visit-field">
            <label htmlFor={htmlFor} className="visit-label">
                {label}
                {required ? ' *' : ''}
            </label>
            {children}
        </div>
    )
}

function renderOptions(fieldName: string, options: readonly SelectOption[]) {
    return options.map((option) => {
        const key = `${fieldName}-${option.value || option.label}`

        return (
            <option key={key} value={option.value}>
                {option.label}
            </option>
        )
    })
}

function renderSubmitLabel(isSubmitting: boolean) {
    return isSubmitting ? 'Creando visita...' : 'Crear visita y generar QR'
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
        <div className="visit-workspace visit-workspace--form-only">
            <section className="visit-panel">
                <div className="visit-panel-header">
                    <div>
                        <h1 className="visit-panel-title">Nueva visita</h1>
                        <p className="visit-panel-note">
                            Completa el formulario para generar el QR de acceso.
                        </p>
                    </div>
                </div>

                {error && <div className="visit-inline-alert visit-inline-alert--error">{error}</div>}

                <form onSubmit={onSubmit} className="visit-form">
                    <div className="visit-form-grid">
                        <Field label="Nombre del visitante" htmlFor="visitor_name" required>
                            <input
                                id="visitor_name"
                                name="visitor_name"
                                type="text"
                                value={formData.visitor_name}
                                onChange={onChange}
                                placeholder="Nombre y apellido"
                                autoComplete="name"
                                required
                                className="visit-control"
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
                                autoComplete="tel-national"
                                inputMode="tel"
                                className="visit-control"
                            />
                        </Field>
                    </div>

                    <div className="visit-form-grid visit-form-grid--balanced">
                        <Field label="Fecha" htmlFor="visit_date" required>
                            <input
                                id="visit_date"
                                name="visit_date"
                                type="date"
                                value={formData.visit_date}
                                onChange={onChange}
                                min={minVisitDate}
                                required
                                className="visit-control"
                            />
                        </Field>

                        <Field label="Hora" htmlFor="visit_hour" required>
                            <div className="visit-time-row">
                                <select
                                    id="visit_hour"
                                    name="visit_hour"
                                    value={formData.visit_hour}
                                    onChange={onChange}
                                    required
                                    className="visit-control"
                                >
                                    {renderOptions('visit_hour', HOUR_OPTIONS)}
                                </select>

                                <select
                                    id="visit_minute"
                                    name="visit_minute"
                                    value={formData.visit_minute}
                                    onChange={onChange}
                                    required
                                    className="visit-control"
                                >
                                    {renderOptions('visit_minute', MINUTE_OPTIONS)}
                                </select>

                                <select
                                    id="visit_period"
                                    name="visit_period"
                                    value={formData.visit_period}
                                    onChange={onChange}
                                    required
                                    className="visit-control"
                                >
                                    {renderOptions('visit_period', PERIOD_OPTIONS)}
                                </select>
                            </div>
                        </Field>
                    </div>

                    <Field label="Asunto" htmlFor="visit_purpose">
                        <textarea
                            id="visit_purpose"
                            name="visit_purpose"
                            value={formData.visit_purpose}
                            onChange={onChange}
                            placeholder="Ejemplo: reunion familiar, entrega de paquete o visita personal"
                            className="visit-control visit-control--textarea"
                        />
                    </Field>

                    <div className="visit-form-actions">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={isSubmitting}
                            style={{ borderRadius: 18 }}
                        >
                            {renderSubmitLabel(isSubmitting)}
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default NewVisitFormView
