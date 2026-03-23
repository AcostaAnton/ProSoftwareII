import { describe, expect, it, vi, afterEach } from 'vitest'
import { formatDate, formatDateTime, formatTime } from '../utils/formatDate'

describe('formatDate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('delega en toLocaleDateString es-ES', () => {
    const spy = vi
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockReturnValue('17 de marzo de 2025')
    expect(formatDate('2025-03-17')).toBe('17 de marzo de 2025')
    expect(spy).toHaveBeenCalledWith(
      'es-ES',
      expect.objectContaining({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  })

  it('si toLocaleDateString lanza, devuelve el string original', () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(() => {
      throw new Error('fail')
    })
    expect(formatDate('2025-01-01')).toBe('2025-01-01')
  })
})

describe('formatTime', () => {
  it('devuelve el mismo string', () => {
    expect(formatTime('14:30')).toBe('14:30')
  })
})

describe('formatDateTime', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('combina fecha y hora', () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue(
      '1 de enero de 2025'
    )
    expect(formatDateTime('2025-01-01', '09:30')).toBe(
      '1 de enero de 2025 a las 09:30'
    )
  })
})
