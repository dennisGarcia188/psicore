import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Exclusão", 
  message = "Tem certeza que deseja realizar esta ação? Esta operação não poderá ser desfeita.",
  confirmText = "Excluir",
  cancelText = "Cancelar",
  type = "danger" // danger | warning | info
}) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      primary: 'var(--color-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      btn: 'var(--color-error)'
    },
    warning: {
      primary: 'var(--color-warning)',
      bg: 'rgba(245, 158, 11, 0.1)',
      btn: 'var(--color-warning)'
    },
    info: {
      primary: 'var(--color-primary)',
      bg: 'rgba(2, 132, 199, 0.1)',
      btn: 'var(--color-primary)'
    }
  };

  const style = colors[type] || colors.danger;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
      <div 
        className="modal-content animate-fade-in" 
        style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: style.bg, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          color: style.primary
        }}>
          <AlertTriangle size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '0.75rem' }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="btn" 
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              backgroundColor: style.btn, 
              color: 'white', 
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
