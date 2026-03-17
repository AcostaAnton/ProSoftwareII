import React, { useState, useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
//recurso: https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner-worker.min.js
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import { createAccessLog } from '../../services/logs.service'
import type { Visit } from '../../types/index'

const ScanPage: React.FC = () => {
  const { user, role } = useAuth()
  const { visits, changeStatus, refresh } = useVisits()

  const [token, setToken] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  
  
  const [scannedVisit, setScannedVisit] = useState<Visit | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [newStatus, setNewStatus] = useState<Visit['status']>('pending')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  

  const handleScanResult = (result: string) => {
    const cleanToken = result.trim()
    const found = visits.find((v) => v.qr_token === cleanToken)

    if (found) {
      setScannedVisit(found)
      setNewStatus(found.status)
      setIsModalOpen(true)
      setScanError(null)
      stopCameraScan() 
    } else {
      setScanError('Código QR no reconocido en el sistema.')
    }
  }

  const startCameraScan = async () => {
    if (!videoRef.current) return
    
    try {
      setCameraError(null)
      setScanError(null)

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          onDecodeError: () => { /* Silencioso mientras busca */ },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      )

      qrScannerRef.current = qrScanner
      await qrScanner.start()
      setCameraActive(true)
    } catch (err) {
      console.error(err)
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const stopCameraScan = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setCameraActive(false)
  }

  const handleManualSearch = () => {
    if (!token) return
    handleScanResult(token)
  }

  const handleRegister = async () => {
    if (!scannedVisit || !user) return
    setIsWorking(true)
    try {
      const statusToSet = role === 'admin' ? newStatus : 'completed'
      await changeStatus(scannedVisit.id, statusToSet)
      
      if (statusToSet === 'completed') {
        await createAccessLog(scannedVisit.id, user.id)
      }

      setActionMessage('✓ Registro actualizado con éxito.')
      await refresh()
      
      setTimeout(() => {
        setIsModalOpen(false)
        setScannedVisit(null)
        setToken('')
        setActionMessage(null)
      }, 1500)
    } catch (err) {
      setActionMessage('⚠ Error al procesar el registro.')
    } finally {
      setIsWorking(false)
    }
  }

  
  useEffect(() => {
    return () => stopCameraScan()
  }, [])

  return (
    <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Control de Acceso</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Escanea el código QR del visitante para validar su entrada.</p>
        </header>

        {/* Sección de Cámara */}
        <section style={{ background: '#1a2024', borderRadius: '16px', padding: '20px', border: '1px solid #334155', marginBottom: '20px' }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '1', 
            backgroundColor: '#000', 
            borderRadius: '12px', 
            overflow: 'hidden',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: cameraActive ? '2px solid #22d3ee' : '2px solid #334155'
          }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!cameraActive && <p style={{ color: '#64748b', position: 'absolute' }}>Cámara inactiva</p>}
          </div>

          <button
            onClick={cameraActive ? stopCameraScan : startCameraScan}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: cameraActive ? '#ef4444' : '#22c55e',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {cameraActive ? '✕ Detener Escáner' : '📷 Iniciar Cámara'}
          </button>
        </section>

        {/* Búsqueda Manual */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            placeholder="O escribe el token aquí..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', 
              backgroundColor: '#1a2024', color: 'white' 
            }}
          />
          <button 
            onClick={handleManualSearch}
            style={{ padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' }}
          >
            Buscar
          </button>
        </div>

        {/* Mensajes de Error */}
        {(cameraError || scanError) && (
          <div style={{ padding: '12px', backgroundColor: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
            {cameraError || scanError}
          </div>
        )}

        {/* MODAL DE RESULTADO */}
        {isModalOpen && scannedVisit && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#1e293b', width: '100%', maxWidth: '450px', borderRadius: '20px',
              padding: '30px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{ color: '#10b981', marginTop: 0 }}>Visitante Encontrado</h2>
              <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
              
              <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Nombre</label>
                  <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>{scannedVisit.visitor_name}</p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Asunto / Fecha</label>
                  <p style={{ margin: '4px 0' }}>{scannedVisit.visit_date} - {scannedVisit.visit_time}</p>
                </div>
                
                {role === 'admin' && (
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Cambiar Estado</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155' }}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                )}
              </div>

              {actionMessage && (
                <div style={{ marginBottom: '15px', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
                  {actionMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleRegister}
                  disabled={isWorking}
                  style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isWorking ? 'Procesando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ScanPage