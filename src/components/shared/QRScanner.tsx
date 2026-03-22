import React, { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'
//recurso: https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner-worker.min.js

interface QRScannerProps {
  onScanResult: (result: string) => void
  stopAfterScan?: boolean
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult }) => {
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  const startCameraScan = async () => {
    if (!videoRef.current) return


    QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

    try {
      setCameraError(null)

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => onScanResult(result.data),
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

  useEffect(() => {
    return () => stopCameraScan()
  }, [])

  return (
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

      {cameraError && (
        <div style={{ padding: '12px', backgroundColor: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: '#fca5a5', fontSize: '14px', marginTop: '10px' }}>
          {cameraError}
        </div>
      )}
    </section>
  )
}

export default QRScanner