
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/auth/Login'
import { loginWithEmail } from '../services/auth.service'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../services/auth.service', () => ({
  loginWithEmail: vi.fn(),
}))

const loginWithEmailMock = vi.mocked(loginWithEmail)

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

function fillForm({ email = 'user@test.com', password = 'secret123' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), {
    target: { value: email },
  })
  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: password },
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loginWithEmailMock.mockResolvedValue(undefined as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('validación del formulario', () => {
    it('muestra error si envía vacío (correo y contraseña obligatorios)', async () => {
      renderLogin()
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      expect(
        await screen.findByText('Ingresa correo y contraseña.'),
      ).toBeInTheDocument()
      expect(loginWithEmailMock).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('trata correo solo con espacios como vacío', async () => {
      renderLogin()
      fillForm({ email: '   ', password: '' })
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      expect(
        await screen.findByText('Ingresa correo y contraseña.'),
      ).toBeInTheDocument()
      expect(loginWithEmailMock).not.toHaveBeenCalled()
    })
  })

  describe('login exitoso', () => {
    it('llama al servicio con correo recortado y redirige al dashboard', async () => {
      renderLogin()
      fillForm({ email: '  guard@test.com  ', password: 'ok' })
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(loginWithEmailMock).toHaveBeenCalledTimes(1)
        expect(loginWithEmailMock).toHaveBeenCalledWith({
          email: 'guard@test.com',
          password: 'ok',
        })
      })
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })
    })
  })

  describe('errores de autenticación (mensajes genéricos / seguros)', () => {
    it('credenciales incorrectas: mensaje claro sin filtrar datos del servidor', async () => {
      loginWithEmailMock.mockRejectedValue(
        new Error('Invalid login credentials'),
      )
      renderLogin()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      expect(
        await screen.findByText(
          'Credenciales incorrectas. Revisa correo y contraseña.',
        ),
      ).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('correo no confirmado: mensaje específico', async () => {
      loginWithEmailMock.mockRejectedValue(new Error('Email not confirmed'))
      renderLogin()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      expect(
        await screen.findByText('Confirma tu correo antes de iniciar sesión.'),
      ).toBeInTheDocument()
    })

    it('timeout: mensaje orientado a conexión/configuración', async () => {
      vi.useFakeTimers()
      loginWithEmailMock.mockImplementation(
        () =>
          new Promise(() => {
            
          }) as Promise<never>,
      )
      renderLogin()
      fillForm()
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
        await vi.advanceTimersByTimeAsync(12000)
      })

      expect(
        screen.getByText(/La conexión tardó demasiado/i),
      ).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('estado de carga (UX y doble envío)', () => {
    it('durante la petición muestra "Verificando..." y deshabilita campos', async () => {
      let resolveLogin: (() => void) | undefined
      loginWithEmailMock.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveLogin = () => resolve()
          }) as unknown as ReturnType<typeof loginWithEmail>,
      )
      renderLogin()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      expect(await screen.findByText('Verificando...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verificando/i })).toBeDisabled()
      expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeDisabled()
      expect(screen.getByPlaceholderText('••••••••')).toBeDisabled()

      resolveLogin?.()
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })
  })
})

