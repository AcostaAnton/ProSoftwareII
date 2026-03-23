import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ScanPage from '../pages/scan/ScanPage'
import type { Visit } from '../types/index'

const mockVisit: Visit = {
  id: 'visit-1',
  resident_id: 'res-1',
  visitor_name: 'María López',
  visitor_phone: '50499999999',
  visit_date: '2025-03-17',
  visit_time: '14:30',
  visit_purpose: 'Entrega',
  visit_destination: 'Casa 12',
  qr_token: 'TOKEN_QR_VALIDO',
  status: 'approved',
  created_at: '2025-01-01T00:00:00Z',
}

let lastScanCallback: ((result: { data: string }) => void) | null = null

vi.mock('qr-scanner', () => ({
  default: class MockQrScanner {
    static WORKER_PATH = ''
    constructor(
      _video: HTMLVideoElement,
      onSuccess: (result: { data: string }) => void,
    ) {
      lastScanCallback = onSuccess
    }
    start = vi.fn().mockResolvedValue(undefined)
    stop = vi.fn()
    destroy = vi.fn()
  },
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'guard-1', email: 'g@test.com' },
    role: 'security' as const,
  }),
}))

const changeStatus = vi.fn()
const refresh = vi.fn()

vi.mock('../../hooks/useVisits', () => ({
  useVisits: () => ({
    visits: [mockVisit],
    loading: false,
    error: null,
    changeStatus,
    refresh,
  }),
}))

vi.mock('../../hooks/useResponsive', () => ({
  default: () => false,
}))

vi.mock('../../services/logs.service', () => ({
  createAccessLog: vi.fn().mockResolvedValue(undefined),
}))

describe('ScanPage — captura / lectura de QR', () => {
  beforeEach(() => {
    lastScanCallback = null
    vi.clearAllMocks()
  })

  it('al decodificar un QR válido desde la cámara abre el modal con el visitante', async () => {
    render(<ScanPage />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar cámara/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /detener escáner/i })).toBeInTheDocument()
    })

    expect(lastScanCallback).toBeTypeOf('function')
    lastScanCallback!({ data: mockVisit.qr_token })

    expect(await screen.findByText('Visitante Encontrado')).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText(/entrega/i)).toBeInTheDocument()
  })

  it('token manual equivalente a escaneo: encuentra visita y abre modal', async () => {
    render(<ScanPage />)

    const input = screen.getByPlaceholderText(/escribe el token/i)
    fireEvent.change(input, { target: { value: mockVisit.qr_token } })
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(await screen.findByText('Visitante Encontrado')).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()
  })

  it('QR o token desconocido muestra error y no abre modal', async () => {
    render(<ScanPage />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar cámara/i }))
    await waitFor(() => {
      expect(lastScanCallback).toBeTypeOf('function')
    })

    lastScanCallback!({ data: 'TOKEN_INEXISTENTE' })

    expect(
      await screen.findByText('Código QR no reconocido en el sistema.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Visitante Encontrado')).not.toBeInTheDocument()
  })

  it('acepta token con espacios (trim) como en escaneo real', async () => {
    render(<ScanPage />)

    const input = screen.getByPlaceholderText(/escribe el token/i)
    fireEvent.change(input, { target: { value: `  ${mockVisit.qr_token}  ` } })
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(await screen.findByText('Visitante Encontrado')).toBeInTheDocument()
  })
})
