import React, { useRef, useEffect, useState } from 'react'
import { Button } from '../ui/Button'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } // Prefer front camera for laptops
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.')
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d')
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

    // Convert canvas content to a Blob, then to a File
    canvas.toBlob(blob => {
      if (blob) {
        const fileName = `capture_${Date.now()}.jpg`
        const file = new File([blob], fileName, { type: 'image/jpeg' })
        onCapture(file)
      }
      onClose() // Close after capture
    }, 'image/jpeg')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '600px' }}>
        {error ? (
          <div style={{ color: '#ef4444', textAlign: 'center' }}>
            <p>{error}</p>
            <Button type="button" variant="secondary" size="lg" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', transform: 'scaleX(-1)' }} // Flip horizontally for mirror effect
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button type="button" variant="success" size="lg" onClick={handleCapture} style={{ flex: 2, borderRadius: 8, background: '#10b981' }}>
                Capturar Foto
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={onClose} style={{ flex: 1, borderRadius: 8, backgroundColor: '#64748b' }}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CameraCapture
