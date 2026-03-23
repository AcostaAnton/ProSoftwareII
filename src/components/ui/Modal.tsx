import React from 'react'
import { Button } from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    /** Si false, no se muestra el botón "Cerrar" por defecto (útil cuando el contenido tiene sus propios botones). */
    showCloseButton?: boolean
    /** Si true, un clic fuera del panel (fondo oscuro) ejecuta onClose. */
    closeOnBackdropClick?: boolean
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    showCloseButton = true,
    closeOnBackdropClick = false,
}) => {
    if (!isOpen) return null

    return (
        <div
            role="presentation"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={closeOnBackdropClick ? onClose : undefined}
        >
            <div
                role="dialog"
                aria-modal="true"
                style={{
                    backgroundColor: '#1a2024',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    width: '90%',
                    color: '#ffffff',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
                {showCloseButton && (
                    <Button variant="muted" size="sm" onClick={onClose} style={{ marginTop: 20, borderRadius: 4 }}>
                        Cerrar
                    </Button>
                )}
            </div>
        </div>
    )
}
