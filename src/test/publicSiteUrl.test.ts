import { describe, expect, it } from 'vitest'
import { getPublicSiteUrl } from '../utils/publicSiteUrl'

describe('getPublicSiteUrl', () => {
  it('devuelve un base URL no vacío en browser', () => {
    const url = getPublicSiteUrl()
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
    expect(url).not.toMatch(/\/$/)
  })
})

