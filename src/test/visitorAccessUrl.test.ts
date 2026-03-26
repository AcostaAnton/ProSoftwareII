import { afterEach, describe, expect, it, vi } from 'vitest'
import { getVisitorAccessUrl } from '../utils/visitorAccessUrl'

describe('getVisitorAccessUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('encodea el token y agrega /acceso/', () => {
    const url = getVisitorAccessUrl('A B')
    expect(url).toContain('/acceso/A%20B')
  })

  it('sin window (SSR): devuelve solo el path', () => {
    vi.stubGlobal('window', undefined as any)
    expect(getVisitorAccessUrl('TOKEN')).toBe('/acceso/TOKEN')
  })
})

