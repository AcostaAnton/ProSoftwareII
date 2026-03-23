import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleBadge } from './Badge'

describe('RoleBadge', () => {
  it('muestra la etiqueta Admin para role admin', () => {
    render(<RoleBadge role="admin" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('muestra la etiqueta Residente para role resident', () => {
    render(<RoleBadge role="resident" />)
    expect(screen.getByText('Residente')).toBeInTheDocument()
  })

  it('muestra la etiqueta Guardia para role security', () => {
    render(<RoleBadge role="security" />)
    expect(screen.getByText('Guardia')).toBeInTheDocument()
  })

  it('aplica colores de fondo y texto según el rol', () => {
    const { rerender, container } = render(<RoleBadge role="admin" />)
    let span = container.querySelector('span')
    expect(span).toHaveStyle({
      background: 'rgba(126,34,206,.25)',
      color: '#c084fc',
    })

    rerender(<RoleBadge role="resident" />)
    span = container.querySelector('span')
    expect(span).toHaveStyle({
      background: 'rgba(8,145,178,.2)',
      color: '#22d3ee',
    })

    rerender(<RoleBadge role="security" />)
    span = container.querySelector('span')
    expect(span).toHaveStyle({
      background: 'rgba(217,119,6,.2)',
      color: '#fbbf24',
    })
  })

  it('renderiza un span con estilos de badge', () => {
    const { container } = render(<RoleBadge role="admin" />)
    const span = container.querySelector('span')
    expect(span).toHaveStyle({
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: '500',
    })
  })
})
