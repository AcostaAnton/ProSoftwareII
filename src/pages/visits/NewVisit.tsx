import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createVisit } from '../../services/visits.service'
import { getCommunityNameById } from '../../services/users.service'
import QRGenerator from '../../components/shared/QRGenerator'
import type { NewVisitForm, Visit } from '../../types/index'
import {
    buildCreateVisitInput,
    getTodayInputDate,
    INITIAL_NEW_VISIT_FORM,
    updateNewVisitForm,
    validateNewVisitForm,
} from './newVisit.helpers'
import NewVisitFormView from './NewVisitFormView'

function NewVisit() {
    const { user, profile } = useAuth()
    const [formData, setFormData] = useState(INITIAL_NEW_VISIT_FORM)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [createdVisit, setCreatedVisit] = useState<Visit | null>(null)
    const [communityName, setCommunityName] = useState<string | null>(null)
    const minVisitDate = getTodayInputDate()
    const createdVisitId = createdVisit?.id

    useEffect(() => {
        if (!createdVisitId || !profile?.community_id) {
            setCommunityName(null)
            return
        }

        let cancelled = false

        void getCommunityNameById(profile.community_id).then((name) => {
            if (!cancelled) {
                setCommunityName(name)
            }
        })

        return () => {
            cancelled = true
        }
    }, [createdVisitId, profile?.community_id])

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value } = event.target

        setFormData((currentFormData) =>
            updateNewVisitForm(
                currentFormData,
                name as keyof NewVisitForm,
                value
            )
        )
    }

    function handleCreateAnother() {
        setCreatedVisit(null)
    }

    function resetForm() {
        setFormData(INITIAL_NEW_VISIT_FORM)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!user) {
            setError('Usuario no autenticado')
            return
        }

        const validationError = validateNewVisitForm(formData)

        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const visitData = buildCreateVisitInput(formData, user.id)
            const visit = await createVisit(visitData)

            setCreatedVisit(visit)
            resetForm()
        } catch (submissionError) {
            console.error('Error creating visit:', submissionError)
            setError(
                submissionError instanceof Error
                    ? submissionError.message
                    : 'Error al crear la visita'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (createdVisit) {
        return (
            <QRGenerator
                visit={createdVisit}
                onCreateAnother={handleCreateAnother}
                qrDisplay={{
                    residentName: profile?.name ?? null,
                    communityName,
                    unitNumber: profile?.unit_number ?? null,
                }}
            />
        )
    }

    return (
        <NewVisitFormView
            error={error}
            formData={formData}
            isSubmitting={isSubmitting}
            minVisitDate={minVisitDate}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    )
}

export default NewVisit
