import type { CSSProperties } from 'react'

export function avatarStyle(size: number): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: Math.round(size * 0.35),
    flexShrink: 0,
  }
}

export interface AvatarProps {
  name: string 
  size?: number
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return <div style={avatarStyle(size)}>{initials}</div>
}
