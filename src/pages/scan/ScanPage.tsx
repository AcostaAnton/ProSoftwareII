import React, { useState, useEffect } from 'react'
import QRScanner from '../../components/shared/QRScanner'
import VisitActionModal from '../../components/shared/VisitActionModal'

import { useAuth } from '../../hooks/useAuth'
import { useVisits } from '../../hooks/useVisits'
import useResponsive from '../../hooks/useResponsive'
import type { Visit } from '../../types/index'
import { Button } from '../../components/ui/Button'

const ScanPage: React.FC = () => {
  const { user } = useAuth()
  const { visits, refresh } = useVisits()
  const isMobile = useResponsive()

  const [token, setToken] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)
  
  
  const [scannedVisit, setScannedVisit] = useState<Visit | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  

  const handleScanResult = (result: string) => {
    const cleanToken = result.trim()
    const found = visits.find((v) => v.qr_token === cleanToken)

    if (found) {
      setScannedVisit(found)
      setIsModalOpen(true)
      setScanError(null)
    } else {
      setScanError('Código QR no reconocido en el sistema.')
    }
  }

  const handleManualSearch = () => {
    if (!token) return
    handleScanResult(token)
  }

  useEffect(() => {
   
  }, [])

  return (
    <div style={{ backgroundColor: '#080c0f', minHeight: '100vh', padding: isMobile ? '10px' : '20px', color: '#ffffff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Control de Acceso</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Escanea el código QR del visitante para validar su entrada.</p>
        </header>

        {}
        <QRScanner onScanResult={handleScanResult} />

        {}
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
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleManualSearch}
            style={{
              padding: '0 20px',
              borderRadius: 8,
              background: '#3b82f6',
              color: 'white',
            }}
          >
            Buscar
          </Button>
        </div>

        {}
        {scanError && (
          <div style={{ padding: '12px', backgroundColor: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
            {scanError}
          </div>
        )}

        {}
        {isModalOpen && scannedVisit && (
          <VisitActionModal
            visit={scannedVisit}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false)
              setScannedVisit(null)
              setToken('')
              refresh()
            }}
            userId={user?.id || ''}
          />
        )}

      </div>
    </div>
  )
}

export default ScanPage
