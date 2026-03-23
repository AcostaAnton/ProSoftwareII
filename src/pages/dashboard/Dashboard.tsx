// ============================================================
// PÁGINA: Dashboard
// ------------------------------------------------------------
// Esta página renderiza la pantalla principal después del login.
// Toda la lógica de datos está centralizada en useDashboard.
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EncabezadoDashboard from '../../components/dashboard/EncabezadoDashboard'
import PanelEstadisticasDashboard from '../../components/dashboard/PanelEstadisticasDashboard'
import TablaVisitasRecientes from '../../components/dashboard/TablaVisitasRecientes'
import QRGenerator from '../../components/shared/QRGenerator'
import { useDashboard } from '../../hooks/useDashboard'
import {
  getVisitWithQrDisplay,
  type VisitQrDisplayData,
} from '../../services/visits.service'
import type { Visit } from '../../types/index'

export default function Dashboard() {
  const navigate = useNavigate()

  const {
    cargando,
    error,
    nombreUsuario,
    textoSecundario,
    mostrarBotonNuevaVisita,
    estadisticas,
    visitasRecientes,
  } = useDashboard()

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [qrDisplay, setQrDisplay] = useState<VisitQrDisplayData | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)

  const handleVerQR = async (visitaId: string) => {
    try {
      const data = await getVisitWithQrDisplay(visitaId)
      setSelectedVisit(data.visit)
      setQrDisplay(data)
      setShowQRModal(true)
    } catch (err) {
      console.error('Error al cargar la visita:', err)
    }
  }

  const handleNuevaVisita = () => {
    navigate('/visits/new')
  }

  if (cargando) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{ color: '#f87171', fontSize: 14 }}>
          Error al cargar el dashboard: {error}
        </p>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <EncabezadoDashboard
        nombreUsuario={nombreUsuario}
        textoSecundario={textoSecundario}
      />

      <PanelEstadisticasDashboard estadisticas={estadisticas} />

      <TablaVisitasRecientes
        titulo="Visitas recientes"
        visitas={visitasRecientes}
        mostrarBotonNuevaVisita={mostrarBotonNuevaVisita}
        onNuevaVisita={handleNuevaVisita}
        onVerQR={handleVerQR}
      />

      {/* Modal QR */}
      {showQRModal && selectedVisit && (
        <QRGenerator
          visit={selectedVisit}
          mode="modal"
          qrDisplay={
            qrDisplay
              ? {
                  residentName: qrDisplay.residentName,
                  communityName: qrDisplay.communityName,
                  unitNumber: qrDisplay.unitNumber,
                }
              : undefined
          }
          onClose={() => {
            setShowQRModal(false)
            setSelectedVisit(null)
            setQrDisplay(null)
          }}
        />
      )}
    </div>
  )
}