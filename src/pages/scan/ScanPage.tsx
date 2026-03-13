import React, { useState, useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
// worker path required by the library (copied to public folder by Vite)
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'
import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import { createAccessLog } from '../../services/logs.service'
import type { Visit } from '../../types/index'

const ScanPage: React.FC = () => {
  const { user, role } = useAuth()
  const { visits, changeStatus, refresh } = useVisits()

  const [token, setToken] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scannedVisit, setScannedVisit] = useState<Visit | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [newStatus, setNewStatus] = useState<Visit['status']>('pending')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [photoMode, setPhotoMode] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pendingTokens = visits.filter((v) => v.status === 'pending').slice(0, 3)

  const startCameraScan = async () => {
    if (!videoRef.current) {
      setCameraError('Elemento de video no disponible, recarga la página.')
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Navegador no soporta acceso a cámara.')
      return
    }

    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setToken(result.data.trim())
          stopCameraScan()
        },
        {
          onDecodeError: (err) => console.log('decode error', err),
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )

      qrScannerRef.current = qrScanner
      await qrScanner.start()
      console.log('QR Scanner started successfully')
      setCameraActive(true)
    } catch (err: any) {
      console.error('Error iniciando cámara', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permiso denegado para usar la cámara.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No se encontró dispositivo de video.')
      } else {
        setCameraError('No se pudo acceder a la cámara. Asegura que la página esté en HTTPS y prueba de nuevo.')
      }
    }
  }

  const stopCameraScan = () => {
    console.log('Stopping camera scan')
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setCameraActive(false)
    setScanning(false)
    setPhotoMode(false)
    setCapturedImage(null)
    setAnalyzingPhoto(false)
  }

  const doScan = () => {
    setScanError(null)
    setScannedVisit(null)
    setActionMessage(null)

    if (scanning) return
    setScanning(true)

    setTimeout(() => {
      const lookup = token.trim() || pendingTokens[0]?.qr_token || ''
      const found = visits.find((v) => v.qr_token === lookup)

      if (!found) {
        setScanError('Token no encontrado.')
      } else if (found.status !== 'pending' && role !== 'admin') {
        setScanError(
          found.status === 'approved'
            ? 'Visita aún no completada.'
            : `Acceso ${found.status}.`
        )
      } else {
        setScannedVisit(found)
      }
      setScanning(false)
    }, 1400)
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
      setActionMessage('✓ Estado actualizado correctamente.')
      await refresh()
      
      setTimeout(() => {
        setScannedVisit(null)
        setToken('')
        setActionMessage(null)
      }, 2000)
    } catch (err) {
      console.error(err)
      setActionMessage('⚠ Error al registrar la entrada.')
    } finally {
      setIsWorking(false)
    }
  }

  useEffect(() => {
    if (scannedVisit) {
      setNewStatus(scannedVisit.status)
    }
  }, [scannedVisit])

  useEffect(() => {
    return () => {
      stopCameraScan()
    }
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)
    
    const imageData = canvasRef.current.toDataURL('image/png')
    setCapturedImage(imageData)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setPhotoMode(true)
  }

  const analyzePhoto = async (imageData: string) => {
    setAnalyzingPhoto(true)
    try {
      const img = new Image()
      img.onload = async () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        
        const result = await QrScanner.scanImage(canvas)
        if (result && typeof result === 'object' && 'data' in result) {
          setToken((result as any).data.trim())
          setCapturedImage(null)
          setPhotoMode(false)
          setScanError(null)
          setActionMessage(null)
        }
        setAnalyzingPhoto(false)
      }
      img.onerror = () => {
        setScanError('Error al procesar la imagen.')
        setAnalyzingPhoto(false)
      }
      img.src = imageData
    } catch (err) {
      console.error('Error analizando foto:', err)
      setScanError('No se detectó código QR en la imagen.')
      setAnalyzingPhoto(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: '20px', color: '#ffffff' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Escanear QR</h1>
          <p style={{ color: '#a0a0a0', marginBottom: 0, fontSize: '14px' }}>Verifica el acceso del visitante escaneando su código QR</p>
        </div>

        <div style={{
          background: '#1a2024',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#22d3ee' }}>Cámara</h3>
          
          <div style={{
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: cameraActive ? 'block' : 'none'
              }}
              playsInline
              muted
            />
            {!cameraActive && (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>Inicia la cámara para escanear</p>
              </div>
            )}
          </div>

          <button
            onClick={cameraActive ? stopCameraScan : startCameraScan}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: cameraActive ? '#ef4444' : '#22c55e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (cameraActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626'
              }
            }}
            onMouseLeave={(e) => {
              if (cameraActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444'
              }
            }}
          >
            {cameraActive ? '⊘ Detener cámara' : '▶ Iniciar cámara'}
          </button>

          {cameraActive && !photoMode && (
            <button
              onClick={() => setPhotoMode(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              📸 Tomar foto
            </button>
          )}

          {photoMode && (
            <button
              onClick={capturePhoto}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              📷 Capturar
            </button>
          )}

          {analyzingPhoto && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <p style={{ color: '#3b82f6', fontSize: '14px' }}>🔍 Analizando imagen...</p>
            </div>
          )}

          {capturedImage && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={capturedImage}
                alt="Foto capturada"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '2px solid #10b981'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={retakePhoto}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: '#6b7280',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ↻ Retomar
                </button>
                <button
                  onClick={() => analyzePhoto(capturedImage)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Analizar
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '8px', border: '1px solid #991b1b' }}>
              <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px' }}>⚠ {cameraError}</p>
            </div>
          )}
        </div>

        <div style={{
          background: '#1a2024',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#22d3ee' }}>Ingreso Manual</h3>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa el token QR..."
              className="input"
              style={{ 
                flex: 1, 
                fontFamily: 'monospace', 
                fontSize: '13px',
                padding: '10px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') doScan() }}
            />
            <button
              onClick={doScan}
              disabled={scanning}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: scanning ? 'not-allowed' : 'pointer',
                opacity: scanning ? 0.6 : 1
              }}
            >
              {scanning ? '...' : 'Buscar'}
            </button>
          </div>

          {pendingTokens.length > 0 && (
            <div>
              <label style={{ display: 'block', color: '#a0a0a0', fontSize: '12px', marginBottom: '8px' }}>Pendientes rápidos</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pendingTokens.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setToken(v.qr_token)
                      setScannedVisit(v)
                      setScanError(null)
                      setActionMessage(null)
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      backgroundColor: '#065f46',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#10b981'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#065f46'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#065f46'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#10b981'
                    }}
                  >
                    {v.qr_token.substring(0, 8)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {scanError && (
          <div style={{ marginBottom: '24px', padding: '14px', backgroundColor: '#7f1d1d', borderRadius: '8px', border: '1px solid #991b1b' }}>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px' }}>⚠ {scanError}</p>
          </div>
        )}

        {actionMessage && !scannedVisit && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '20px', 
            backgroundColor: actionMessage.includes('correctamente') ? '#064e3b' : '#7f1d1d',
            borderRadius: '12px', 
            border: actionMessage.includes('correctamente') ? '2px solid #10b981' : '2px solid #991b1b',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: actionMessage.includes('correctamente') ? '#86efac' : '#fca5a5', fontSize: '14px', fontWeight: 'bold' }}>{actionMessage}</p>
          </div>
        )}

        {scannedVisit && (
          <div style={{
            background: '#1a2024',
            border: '1px solid #10b981',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#10b981' }}>✓ Visitante Encontrado</h3>
            
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Nombre</label>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>{scannedVisit.visitor_name}</p>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Contacto</label>
                <p style={{ margin: 0, fontSize: '14px' }}>{scannedVisit.visitor_phone || '—'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Fecha y Hora</label>
              <p style={{ margin: 0, fontSize: '14px' }}>{scannedVisit.visit_date} a las {scannedVisit.visit_time}</p>
            </div>

            {role === 'admin' && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Estado</label>
                <select
                  aria-label="Nuevo estado"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Visit['status'])}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {['pending','approved','rejected','completed','cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isWorking}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: isWorking ? '#4b5563' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: isWorking ? 'not-allowed' : 'pointer',
                opacity: isWorking ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isWorking ? '...' : role === 'admin' ? 'Actualizar Estado' : '✓ Registrar Entrada'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScanPage
