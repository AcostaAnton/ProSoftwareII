import React from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1a2024',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%',
                color: '#ffffff'
            }}>
                {children}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        padding: '8px 16px',
                        backgroundColor: '#2a3034',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}
