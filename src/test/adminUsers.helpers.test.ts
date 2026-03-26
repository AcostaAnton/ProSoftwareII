import { describe, expect, it } from 'vitest'
import { getHousingSelectOptionState, isValidEmail } from '../pages/admin/adminUsers.helpers'

describe('adminUsers.helpers — isValidEmail', () => {
  it('acepta un correo simple válido', () => {
    expect(isValidEmail('user@test.com')).toBe(true)
  })

  it('recorta espacios externos', () => {
    expect(isValidEmail('  user@test.com  ')).toBe(true)
  })

  it('rechaza vacío o solo espacios', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('   ')).toBe(false)
  })

  it('rechaza espacios internos', () => {
    expect(isValidEmail('user @test.com')).toBe(false)
    expect(isValidEmail('user@te st.com')).toBe(false)
  })

  it('rechaza sin @, @ al inicio o múltiples @', () => {
    expect(isValidEmail('usertest.com')).toBe(false)
    expect(isValidEmail('@test.com')).toBe(false)
    expect(isValidEmail('a@b@c.com')).toBe(false)
  })

  it('rechaza dominio sin punto', () => {
    expect(isValidEmail('user@test')).toBe(false)
  })

  it('rechaza local-part > 64', () => {
    const local = 'a'.repeat(65)
    expect(isValidEmail(`${local}@test.com`)).toBe(false)
  })

  it('rechaza > 254 caracteres', () => {
    const tooLong = 'a'.repeat(255)
    expect(isValidEmail(tooLong)).toBe(false)
  })
})

describe('adminUsers.helpers — getHousingSelectOptionState', () => {
  it('cuando unidad está vacía: habilita sin sufijo', () => {
    const u = { id: '1', number: 'A-1', owner_id: null, co_owner_id: null }
    expect(getHousingSelectOptionState(u)).toEqual({ disabled: false, suffix: '' })
  })

  it('cuando unidad tiene 1/2: habilita y muestra (1/2)', () => {
    const u = { id: '1', number: 'A-1', owner_id: 'p1', co_owner_id: null }
    expect(getHousingSelectOptionState(u)).toEqual({ disabled: false, suffix: ' (1/2)' })
  })

  it('cuando unidad está llena 2/2: bloquea y muestra (completa)', () => {
    const u = { id: '1', number: 'A-1', owner_id: 'p1', co_owner_id: 'p2' }
    expect(getHousingSelectOptionState(u)).toEqual({ disabled: true, suffix: ' (completa)' })
  })

  it('en edición: si el perfil ya está en esa unidad llena, NO bloquea y muestra (2/2)', () => {
    const u = { id: '1', number: 'A-1', owner_id: 'p1', co_owner_id: 'p2' }
    expect(getHousingSelectOptionState(u, 'p2')).toEqual({ disabled: false, suffix: ' (2/2)' })
  })
})

