import React, { useState, useEffect } from 'react'
import type { Visit } from '../../types/index'
import CameraCapture from './CameraCapture'
import { denyVisitEntry, recordVisitEntry, recordVisitExit } from '../../services/visitGateActions.service'
import {
  ActionButtons,
  EntryNotesPanel,
  EntryPhotoPanel,
  ErrorBanner,
  ExitNotesPanel,
  FormHeader,
  ModalCard,
  ModalOverlay,
  PhotoLightbox,
  SuccessView,
  VisitInfoPanel,
} from './visitActionModalParts'

interface VisitActionModalProps {
  visit: Visit
  onClose: () => void
  onSuccess: () => void
  userId: string
}

const SUCCESS_CLOSE_MS = 2000
const DENY_CLOSE_MS = 2500

const VisitActionModal: React.FC<VisitActionModalProps> = ({ visit, onClose, onSuccess, userId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false)

  const [attachedPhoto, setAttachedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoNotes, setPhotoNotes] = useState('')
  const [entryNotes, setEntryNotes] = useState('')
  const [exitNotes, setExitNotes] = useState('')

  const isEntry = visit.status === 'pending'
  const isExit = visit.status === 'approved'

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  function getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) return err.message
    return fallback
  }

  const handlePhotoUpdate = (file: File) => {
    setAttachedPhoto(file)
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    const newPreviewUrl = URL.createObjectURL(file)
    setPhotoPreview(newPreviewUrl)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpdate(e.target.files[0])
    }
  }
  
  const handleCapture = (file: File) => {
    handlePhotoUpdate(file)
    setIsCameraOpen(false)
  }

  const handleEntry = async () => {
    setLoading(true)
    setError(null)
    try {
      await recordVisitEntry({
        visitId: visit.id,
        guardId: userId,
        photoFile: attachedPhoto,
        photoNotes,
        entryNotes,
      })

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, SUCCESS_CLOSE_MS)
    } catch (err) {
      console.error('Error al registrar entrada:', err)
      setError(getErrorMessage(err, 'Error al registrar entrada'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    setError(null)
    try {
      await denyVisitEntry({
        visitId: visit.id,
        guardId: userId,
        photoFile: attachedPhoto,
        photoNotes,
        reason: entryNotes,
      })

      setIsRejected(true)
      setIsSuccess(true)
      setTimeout(() => onSuccess(), DENY_CLOSE_MS)
    } catch (err) {
      console.error('Error al denegar:', err)
      setError(getErrorMessage(err, 'Error al denegar la entrada'))
    } finally {
      setLoading(false)
    }
  }

  const handleExit = async () => {
    setLoading(true)
    setError(null)
    try {
      await recordVisitExit({ visitId: visit.id, guardId: userId, exitNotes })

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, SUCCESS_CLOSE_MS)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al registrar salida'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {isPhotoExpanded && photoPreview && (
        <PhotoLightbox
          photoUrl={photoPreview}
          photoNotes={photoNotes}
          onClose={() => setIsPhotoExpanded(false)}
        />
      )}

      <ModalOverlay>
        <ModalCard maxWidth={isEntry ? '850px' : '450px'}>
          {isSuccess ? (
            <SuccessView rejected={isRejected} />
          ) : (
            <>
              <FormHeader
                title={isEntry ? 'Registro de Entrada' : isExit ? 'Registro de Salida' : 'Acción no permitida'}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '25px' }}>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <VisitInfoPanel visit={visit} />

                  {isEntry && (
                    <EntryPhotoPanel
                      photoPreview={photoPreview}
                      onExpandPhoto={() => setIsPhotoExpanded(true)}
                      onOpenCamera={() => setIsCameraOpen(true)}
                      onFileChange={handleFileChange}
                    />
                  )}
                </div>

                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {isEntry && (
                    <EntryNotesPanel
                      photoNotes={photoNotes}
                      entryNotes={entryNotes}
                      onChangePhotoNotes={setPhotoNotes}
                      onChangeEntryNotes={(v: string) => {
                        setEntryNotes(v)
                        setError(null)
                      }}
                    />
                  )}

                  {isExit && <ExitNotesPanel exitNotes={exitNotes} onChangeExitNotes={setExitNotes} />}

                  {error && <ErrorBanner error={error} />}

                  <ActionButtons
                    isEntry={isEntry}
                    isExit={isExit}
                    loading={loading}
                    onClose={onClose}
                    onDeny={handleDeny}
                    onAllow={handleEntry}
                    onExit={handleExit}
                  />
                </div>
              </div>
            </>
          )}
        </ModalCard>
      </ModalOverlay>
    </>
  )
}

export default VisitActionModal