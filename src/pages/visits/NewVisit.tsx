import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import QRGenerator from '../../components/shared/QRGenerator'
import { useAuth } from '../../hooks/useAuth'
import { createVisit } from '../../services/visits.service'
import { getCommunityNameById } from '../../services/users.service'
import type { NewVisitForm, Visit } from '../../types/index'
import { resolveAsync } from './visitAsync.helpers'
import NewVisitFormView from './NewVisitFormView'
import {
    buildCreateVisitInput,
    getTodayInputDate,
    INITIAL_NEW_VISIT_FORM,
    updateNewVisitForm,
    validateNewVisitForm,
} from './newVisit.helpers'

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
        let isActive = true

        if (!createdVisitId || !profile?.community_id) {
            setCommunityName(null)
            return
        }

        void resolveAsync(
            getCommunityNameById(profile.community_id),
            'No se pudo cargar la comunidad'
        ).then((result) => {
            if (!isActive || result.error !== null) {
                return
            }

            setCommunityName(result.data)
        })

        return () => {
            isActive = false
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

        const visitData = buildCreateVisitInput(formData, user.id)
        const createResult = await resolveAsync(
            createVisit(visitData),
            'Error al crear la visita'
        )

        setIsSubmitting(false)

        if (createResult.error !== null) {
            setError(createResult.error)
            return
        }

        setCreatedVisit(createResult.data)
        setFormData(INITIAL_NEW_VISIT_FORM)
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
