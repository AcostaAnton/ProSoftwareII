import { describe, expect, it } from 'vitest'
import { getQrInvitationLines } from '../utils/qrInvitationMessage'

describe('getQrInvitationLines', () => {
  it('residentName + communityName: invitación completa con 2 líneas', () => {
    const lines = getQrInvitationLines(
      { visitor_name: ' Ana ' },
      { residentName: ' Luis ', communityName: ' Residencial X ' },
    )
    expect(lines).toEqual({
      primary: 'Ana, Luis te ha invitado a:',
      secondary: 'Residencial X',
    })
  })

  it('solo residentName: invitación sin comunidad (secondary null)', () => {
    const lines = getQrInvitationLines(
      { visitor_name: 'Ana' },
      { residentName: 'Luis', communityName: null },
    )
    expect(lines).toEqual({
      primary: 'Ana, Luis te ha invitado a:',
      secondary: null,
    })
  })

  it('solo communityName: acceso de visita para visitante + comunidad', () => {
    const lines = getQrInvitationLines(
      { visitor_name: 'Ana' },
      { residentName: null, communityName: 'Residencial X' },
    )
    expect(lines).toEqual({
      primary: 'Acceso de visita para Ana',
      secondary: 'Residencial X',
    })
  })

  it('sin residentName ni communityName: invitación genérica', () => {
    const lines = getQrInvitationLines({ visitor_name: 'Ana' }, null)
    expect(lines).toEqual({
      primary: 'Invitación para Ana',
      secondary: null,
    })
  })

  it('si no hay visitor_name: usa Visitante', () => {
    const lines = getQrInvitationLines({ visitor_name: '' }, null)
    expect(lines.primary).toBe('Invitación para Visitante')
  })
})

