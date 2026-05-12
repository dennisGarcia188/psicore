import React from 'react';
import { Brain } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '400px',
      width: '100%',
      gap: '1.5rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{ position: 'relative' }}>
        <Brain size={48} color="var(--color-primary)" strokeWidth={2.5} className="animate-pulse" />
        <div style={{
          position: 'absolute',
          inset: '-10px',
          border: '3px solid var(--color-primary)',
          borderRadius: '50%',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
      <p style={{
        color: 'var(--color-text-muted)',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        Carregando informações...
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
