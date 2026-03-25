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

      {/* Vista de Foto Expandida (Lightbox) */}
      {isPhotoExpanded && photoPreview && (
        <div 
          onClick={() => setIsPhotoExpanded(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={photoPreview} 
            alt="Foto expandida" 
            style={{ maxWidth: '95%', maxHeight: '75vh', borderRadius: '12px', boxShadow: '0 0 30px rgba(0,0,0,0.5)', objectFit: 'contain' }} 
          />
          {photoNotes && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e293b', borderRadius: '10px', maxWidth: '90%', border: '1px solid #334155' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.5px' }}>Comentario de la foto</p>
              <p style={{ color: 'white', margin: 0, fontSize: '16px' }}>{photoNotes}</p>
            </div>
          )}
          <p style={{ color: '#64748b', marginTop: '15px', fontSize: '14px' }}>Toca en cualquier lugar para cerrar</p>
        </div>
      )}

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1e293b', width: '100%', maxWidth: isEntry ? '850px' : '450px', borderRadius: '16px', // Radio de borde ligeramente más pequeño
          padding: '20px', border: '1px solid #334155', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', // Sombra ligeramente menos prominente
          maxHeight: '95vh', overflowY: 'auto'
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '25px' }}>
            {/* Columna Lateral: Información y Foto */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Visitante</label>
                <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>{visit.visitor_name}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Asunto</label>
                  <p style={{ margin: '2px 0', fontSize: '14px' }}>{visit.visit_purpose || 'No especificado'}</p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Fecha/Hora</label>
                  <p style={{ margin: '2px 0', fontSize: '14px' }}>{visit.visit_date}<br/>{visit.visit_time}</p>
                </div>
              </div>

              {isEntry && (
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Fotografía de Ingreso</label>
                  {photoPreview ? (
                    <div 
                      onClick={() => setIsPhotoExpanded(true)}
                      style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center', cursor: 'zoom-in', position: 'relative' }}
                    >
                      <img src={photoPreview} alt="Vista previa" style={{ width: '100%', maxHeight: '180px', borderRadius: '12px', border: '2px solid #334155', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}>
                        🔍 Ampliar
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '150px', border: '2px dashed #334155', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', marginTop: '10px' }}>
                      Sin foto adjunta
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Button type="button" variant="accent" size="sm" onClick={() => setIsCameraOpen(true)} style={{ flex: 1, borderRadius: 8 }}>
                      📷 Cámara
                    </Button>
                    <label htmlFor="file-upload" style={{...filePickLabelStyle, flex: 1, textAlign: 'center', padding: '8px', fontSize: '12px' }}>
                      📂 Archivo
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Columna Principal: Notas y Botones */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isEntry && (
                <>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de la Fotografía</label>
                    <textarea
                      value={photoNotes}
                      onChange={(e) => setPhotoNotes(e.target.value)}
                      placeholder="Descripción de la foto (placa, estado...)"
                      style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '70px', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Notas de Entrada</label>
                    <textarea
                      value={entryNotes}
                      onChange={(e) => { setEntryNotes(e.target.value); setError(null); }}
                      placeholder="Observaciones generales o motivo de rechazo..."
                      style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '70px', fontSize: '14px' }}
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
                    placeholder="Comentarios sobre la salida..."
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', minHeight: '120px', fontSize: '14px' }}
                  />
                </div>
              )}

              {error && (
                <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', fontSize: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
                <Button type="button" variant="outline" size="lg" onClick={onClose} style={{ flex: 1, borderRadius: 8, borderColor: '#334155', color: 'white' }}>
                  Cancelar
                </Button>

                {isEntry ? (
                  <>
                    <Button type="button" variant="danger" size="lg" onClick={handleDeny} disabled={loading} style={{ flex: 1, borderRadius: 8, background: '#7f1d1d', border: '1px solid #991b1b' }}>
                      {loading ? '...' : 'Denegar'}
                    </Button>
                    <Button type="button" variant="success" size="lg" onClick={handleEntry} disabled={loading} style={{ flex: 2, borderRadius: 8, background: '#10b981' }}>
                      {loading ? '...' : 'Permitir'}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="success" size="lg" onClick={isExit ? handleExit : () => {}} disabled={loading} style={{ flex: 2, borderRadius: 8, background: '#10b981' }}>
                    {loading ? '...' : isExit ? 'Registrar Salida' : 'Acción'}
                  </Button>
                )}
              </div>
            </div>
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