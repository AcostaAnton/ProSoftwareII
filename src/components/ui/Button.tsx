import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'muted'
  | 'danger'
  | 'success'
  | 'panel'
  | 'accent'
  
  | 'unstyled'

export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
  style?: CSSProperties
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: "'DM Sans', system-ui, sans-serif",
  lineHeight: 1.2,
  textDecoration: 'none',
  boxSizing: 'border-box',
}

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8, fontWeight: 600 },
  md: { padding: '9px 18px', fontSize: 13, borderRadius: 10, fontWeight: 700 },
  lg: { padding: '12px 20px', fontSize: 16, borderRadius: 12, fontWeight: 700 },
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: '#22d3ee',
    color: '#0f172a',
    border: 'none',
  },
  secondary: {
    background: '#2a3034',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    border: '1px solid #1e293b',
    color: '#64748b',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#22d3ee',
    fontWeight: 700,
    padding: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  muted: {
    background: '#2a3034',
    color: '#ffffff',
    border: 'none',
    fontWeight: 600,
  },
  danger: {
    background: '#ef4444',
    color: '#ffffff',
    border: 'none',
    fontWeight: 600,
  },
  success: {
    background: '#22c55e',
    color: '#ffffff',
    border: 'none',
    fontWeight: 700,
  },
  panel: {
    backgroundColor: '#1a2024',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#ffffff',
    fontWeight: 600,
  },
  accent: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    fontWeight: 700,
  },
  unstyled: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    fontWeight: 'inherit',
    borderRadius: 0,
    gap: 0,
    whiteSpace: 'normal',
  },
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  style,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const skipSize = variant === 'unstyled' || variant === 'link'
  const v = variantStyles[variant]
  const s = skipSize ? {} : variant === 'panel' ? { padding: '10px', fontSize: 14, borderRadius: 8 } : sizeStyles[size]

  const merged: CSSProperties = {
    ...base,
    ...s,
    ...v,
    ...(fullWidth ? { width: '100%' } : {}),
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...(disabled ? { opacity: 0.5 } : {}),
    ...style,
  }

  return (
    <button type={type} disabled={disabled} style={merged} className={className} {...rest}>
      {children}
    </button>
  )
}

