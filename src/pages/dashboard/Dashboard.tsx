
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import DashboardStatsPanel from '../../components/dashboard/DashboardStatsPanel'
import RecentVisitsTable from '../../components/dashboard/RecentVisitsTable'
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
    loading,
    error,
    userName,
    secondaryText,
    showNewVisitButton,
    stats,
    recentVisits,
  } = useDashboard()

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [qrDisplay, setQrDisplay] = useState<VisitQrDisplayData | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)

  const handleViewQr = async (visitId: string) => {
    try {
      const data = await getVisitWithQrDisplay(visitId)
      setSelectedVisit(data.visit)
      setQrDisplay(data)
      setShowQRModal(true)
    } catch (err) {
      console.error('Error al cargar la visita:', err)
    }
  }

  const handleNewVisit = () => {
    navigate('/visits/new')
  }

  if (loading) {
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
      <DashboardHeader
        userName={userName}
        secondaryText={secondaryText}
      />

      <DashboardStatsPanel stats={stats} />

      <RecentVisitsTable
        title="Visitas recientes"
        visits={recentVisits}
        showNewVisitButton={showNewVisitButton}
        onNewVisit={handleNewVisit}
        onViewQr={handleViewQr}
      />

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
