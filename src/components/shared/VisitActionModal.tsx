import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import type { Visit } from '../../types/index'
import CameraCapture from './CameraCapture'
import { Button } from '../ui/Button'
import { uploadVisitPhoto } from '../../services/visits.service'

interface VisitActionModalProps {
  visit: Visit
  onClose: () => void
  onSuccess: () => void
  userId: string
}

const VisitActionModal: React.FC<VisitActionModalProps> = ({ visit, onClose, onSuccess, userId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

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
      const photoUrl = attachedPhoto ? await uploadVisitPhoto(attachedPhoto) : null

      // Actualizar access_logs
      const { error: logError } = await supabase
        .from('access_logs')
        .insert({
          visit_id: visit.id,
          guard_id: userId,
          vehicle_photo_url: photoUrl,
          vehicle_notes: photoNotes,
          entry_notes: entryNotes,
          entry_time: new Date().toISOString()
        })
      if (logError) throw logError

      // Actualizar visits
      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'approved', approved_by: userId })
        .eq('id', visit.id)
      if (visitError) throw visitError

      
      await supabase
        .from('visit_status_history')
        .insert({
          visit_id: visit.id,
          old_status: 'pending',
          new_status: 'approved',
          changed_by_id: userId,
          notes: `Entrada registrada: ${entryNotes}`
        })

      // Mostrar mensaje de éxito en el modal antes de cerrar
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      console.error('Error al registrar entrada:', err)
      setError((err as any).message || 'Error al registrar entrada')
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    if (!entryNotes.trim()) {
      setError('Para denegar el acceso, es obligatorio escribir el motivo en las notas.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const photoUrl = attachedPhoto ? await uploadVisitPhoto(attachedPhoto) : null

      // Guardar evidencia en access_logs aunque sea rechazado
      const { error: logError } = await supabase
        .from('access_logs')
        .insert({
          visit_id: visit.id,
          guard_id: userId,
          vehicle_photo_url: photoUrl,
          vehicle_notes: photoNotes,
          entry_notes: `ACCESO DENEGADO: ${entryNotes}`,
          entry_time: new Date().toISOString()
        })
      if (logError) throw logError

      // Actualizar estado a 'rejected'
      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'rejected' })
        .eq('id', visit.id)
      if (visitError) throw visitError

      await supabase
        .from('visit_status_history')
        .insert({
          visit_id: visit.id,
          old_status: 'pending',
          new_status: 'rejected',
          changed_by_id: userId,
          notes: `Acceso denegado en garita: ${entryNotes}`
        })

      setIsRejected(true)
      setIsSuccess(true)
      setTimeout(() => onSuccess(), 2500)
    } catch (err) {
      console.error('Error al denegar:', err)
      setError((err as any).message || 'Error al denegar la entrada')
    } finally {
      setLoading(false)
    }
  }

  const handleExit = async () => {
    setLoading(true)
    setError(null)
    try {

      const { error: logError } = await supabase
        .from('access_logs')
        .update({
          exit_notes: exitNotes,
          exit_time: new Date().toISOString()
        })
        .eq('visit_id', visit.id)
      if (logError) throw logError

      
      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'completed' })
        .eq('id', visit.id)
      if (visitError) throw visitError

      
      await supabase
        .from('visit_status_history')
        .insert({
          visit_id: visit.id,
          old_status: 'approved',
          new_status: 'completed',
          changed_by_id: userId,
          notes: `Salida registrada: ${exitNotes}`
        })

      // Mostrar mensaje de éxito en el modal antes de cerrar
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar salida')
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
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1e293b', width: '100%', maxWidth: '450px', borderRadius: '20px',
          padding: '30px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          
          {/* Vista de Éxito */}
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {isRejected ? '⛔' : '✅'}
              </div>
              <h2 style={{ color: isRejected ? '#ef4444' : '#10b981', margin: 0, fontSize: '24px' }}>
                {isRejected ? 'Acceso Denegado' : '¡Registrado!'}
              </h2>
              <p style={{ color: '#94a3b8', marginTop: '8px' }}>La operación se guardó correctamente.</p>
            </div>
          ) : (
            /* Formulario normal */
            <>
          <h2 style={{ color: '#10b981', marginTop: 0 }}>
            {isEntry ? 'Registro de Entrada' : isExit ? 'Registro de Salida' : 'Acción no permitida'}
          </h2>
          <hr style={{ borderColor: '#334155', margin: '20px 0' }} />

          <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Nombre</label>
              <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>{visit.visitor_name}</p>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Asunto</label>
              <p style={{ margin: '4px 0' }}>{visit.visit_purpose || 'No especificado'}</p>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Fecha</label>
              <p style={{ margin: '4px 0' }}>{visit.visit_date} - {visit.visit_time}</p>
            </div>

            {isEntry && (
              <>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Adjuntar Fotografía</label>
                  
                  {photoPreview && (
                    <div style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
                      <img src={photoPreview} alt="Vista previa" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #334155' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <Button type="button" variant="accent" size="lg" onClick={() => setIsCameraOpen(true)} style={{ flex: 1, borderRadius: 8 }}>
                      📷 Tomar Foto
                    </Button>
                    <label htmlFor="file-upload" style={{...filePickLabelStyle, flex: 1, textAlign: 'center' }}>
                      📂 Elegir Archivo
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de la Fotografía</label>
                  <textarea
                    value={photoNotes}
                    onChange={(e) => setPhotoNotes(e.target.value)}
                    placeholder="Añada una descripción para la foto (opcional)..."
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '60px' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de Entrada</label>
                  <textarea
                    value={entryNotes}
                    onChange={(e) => { setEntryNotes(e.target.value); setError(null); }}
                    placeholder="Comentarios de entrada o motivo de rechazo..."
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '60px' }}
                  />
                </div>
              </>
            )}

            {isExit && (
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de Salida</label>
                <textarea
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                  placeholder="Comentarios de salida..."
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '60px' }}
                />
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '15px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button type="button" variant="outline" size="lg" onClick={onClose} style={{ flex: 1, borderRadius: 8, borderColor: '#334155', color: 'white' }}>
              Cancelar
            </Button>

            {isEntry ? (
              <>
                <Button type="button" variant="danger" size="lg" onClick={handleDeny} disabled={loading} style={{ flex: 1, borderRadius: 8, background: '#7f1d1d', border: '1px solid #991b1b' }}>
                  {loading ? '...' : 'Denegar'}
                </Button>
                <Button type="button" variant="success" size="lg" onClick={handleEntry} disabled={loading} style={{ flex: 2, borderRadius: 8, background: '#10b981' }}>
                  {loading ? 'Procesando...' : 'Permitir Acceso'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="success"
                size="lg"
                onClick={isExit ? handleExit : () => {}}
                disabled={loading}
                style={{ flex: 2, borderRadius: 8, background: '#10b981' }}
              >
                {loading ? 'Procesando...' : isExit ? 'Registrar Salida' : 'Acción'}
              </Button>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const filePickLabelStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#334155',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
}

export default VisitActionModal