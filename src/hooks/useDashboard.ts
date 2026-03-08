// ============================================================
// HOOK: useDashboard
// ------------------------------------------------------------
// Centraliza la lógica del dashboard:
// - carga de visitas
// - carga de perfiles relacionados
// - carga de unidades
// - armado de estadísticas
// - transformación de datos para la tabla
// ============================================================

import { useEffect, useState } from 'react'
import type { EstadoVisualVisita, VisitaReciente } from '../components/dashboard/TablaVisitasRecientes'
import { useAuth } from '../context/AuthContext'
import { getProfilesByIds, getUnitsByOwnerIds } from '../services/dashboard.service'
import { getAllVisits, getVisitsByResident } from '../services/visits.service'
import type { Profile, Unit, Visit } from '../types/index'

type EstadisticaDashboard = {
  titulo: string
  valor: number
  colorLinea: string
}

type ResultadoUseDashboard = {
  cargando: boolean
  error: string | null
  nombreUsuario: string
  textoSecundario: string
  mostrarBotonNuevaVisita: boolean
  estadisticas: EstadisticaDashboard[]
  visitasRecientes: VisitaReciente[]
}

function mapearEstadoVisual(estado: Visit['status']): EstadoVisualVisita {
  switch (estado) {
    case 'pending':
      return 'pendiente'
    case 'approved':
      return 'aprobada'
    case 'completed':
      return 'completada'
    case 'rejected':
      return 'rechazada'
    case 'cancelled':
      return 'cancelada'
    default:
      return 'pendiente'
  }
}

function ordenarVisitasPorFechaDesc(visitas: Visit[]) {
  return [...visitas].sort((a, b) => {
    const fechaA = new Date(`${a.visit_date}T${a.visit_time || '00:00'}`).getTime()
    const fechaB = new Date(`${b.visit_date}T${b.visit_time || '00:00'}`).getTime()
    return fechaB - fechaA
  })
}

export function useDashboard(): ResultadoUseDashboard {
  const { user, profile, role } = useAuth()

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState('Usuario')
  const [textoSecundario, setTextoSecundario] = useState('')
  const [estadisticas, setEstadisticas] = useState<EstadisticaDashboard[]>([])
  const [visitasRecientes, setVisitasRecientes] = useState<VisitaReciente[]>([])

  useEffect(() => {
    async function cargarDashboard() {
      if (!user || !profile || !role) {
        setCargando(false)
        return
      }

      try {
        setCargando(true)
        setError(null)

        // ------------------------------------------------------------
        // 1. Datos básicos del usuario autenticado
        // ------------------------------------------------------------
        setNombreUsuario(profile.name || user.email || 'Usuario')

        // ------------------------------------------------------------
        // 2. Texto secundario del encabezado
        // ------------------------------------------------------------
        if (role === 'resident') {
          const unidadesDelUsuario = await getUnitsByOwnerIds([profile.id])
          const unidadActual = unidadesDelUsuario[0]

          setTextoSecundario(
            unidadActual?.number
              ? `Unidad ${unidadActual.number}`
              : 'Unidad no asignada'
          )
        } else {
          setTextoSecundario(`Rol: ${role}`)
        }

        // ------------------------------------------------------------
        // 3. Cargar visitas según el rol
        // ------------------------------------------------------------
        let visitas: Visit[] = []

        if (role === 'resident') {
          visitas = await getVisitsByResident(user.id)
        } else {
          visitas = await getAllVisits()
        }

        const visitasOrdenadas = ordenarVisitasPorFechaDesc(visitas)

        // ------------------------------------------------------------
        // 4. Obtener perfiles y unidades de los residentes involucrados
        // ------------------------------------------------------------
        const residentIds = [...new Set(visitasOrdenadas.map((visita) => visita.resident_id))]

        const perfilesRelacionados: Profile[] = await getProfilesByIds(residentIds)
        const unidadesRelacionadas: Unit[] = await getUnitsByOwnerIds(residentIds)

        const mapaPerfiles = new Map<string, Profile>()
        const mapaUnidades = new Map<string, Unit>()

        perfilesRelacionados.forEach((perfil) => {
          mapaPerfiles.set(perfil.id, perfil)
        })

        unidadesRelacionadas.forEach((unidad) => {
          mapaUnidades.set(unidad.owner_id, unidad)
        })

        // ------------------------------------------------------------
        // 5. Preparar estadísticas para las tarjetas
        // ------------------------------------------------------------
        const nuevasEstadisticas: EstadisticaDashboard[] = [
          {
            titulo: 'Total',
            valor: visitasOrdenadas.length,
            colorLinea: '#22d3ee',
          },
          {
            titulo: 'Pendientes',
            valor: visitasOrdenadas.filter((visita) => visita.status === 'pending').length,
            colorLinea: '#f59e0b',
          },
          {
            titulo: 'Aprobadas',
            valor: visitasOrdenadas.filter((visita) => visita.status === 'approved').length,
            colorLinea: '#3b82f6',
          },
          {
            titulo: 'Completadas',
            valor: visitasOrdenadas.filter((visita) => visita.status === 'completed').length,
            colorLinea: '#10b981',
          },
        ]

        setEstadisticas(nuevasEstadisticas)

        // ------------------------------------------------------------
        // 6. Preparar visitas recientes para la tabla
        // ------------------------------------------------------------
        const visitasTabla: VisitaReciente[] = visitasOrdenadas.slice(0, 6).map((visita) => {
          const perfilResidente = mapaPerfiles.get(visita.resident_id)
          const unidadResidente = mapaUnidades.get(visita.resident_id)

          return {
            id: visita.id,
            nombreVisitante: visita.visitor_name,
            telefonoVisitante: visita.visitor_phone || '',
            nombreResidente: perfilResidente?.name || 'Residente',
            unidadResidencia: unidadResidente?.number || '',
            fechaVisita: visita.visit_date,
            horaVisita: visita.visit_time || '',
            estado: mapearEstadoVisual(visita.status),
            mostrarAccionQr: visita.status === 'pending',
          }
        })

        setVisitasRecientes(visitasTabla)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Error al cargar el dashboard')
      } finally {
        setCargando(false)
      }
    }

    void cargarDashboard()
  }, [user, profile, role])

  const mostrarBotonNuevaVisita = role === 'resident' || role === 'admin'

  return {
    cargando,
    error,
    nombreUsuario,
    textoSecundario,
    mostrarBotonNuevaVisita,
    estadisticas,
    visitasRecientes,
  }
}