import { Mail } from 'lucide-react';

export default function Footer({ onContactClick }) {
  const year = new Date().getFullYear();

  return (
    <footer style={{ 
      backgroundColor: 'rgba(2,132,199,0.04)', 
      borderTop: '1px solid var(--color-border)', 
      padding: window.innerWidth <= 768 ? '2rem 1rem' : '3rem 0', 
      marginTop: 'auto' 
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <p>© {year} PsiCore. Todos os direitos reservados.</p>
          <p style={{ fontWeight: 500 }}>Desenvolvido por Dennis Willian Garcia Desenvolvimento e Licenciamento de Sistemas para Computadores</p>
          <p style={{ fontWeight: 600 }}>CNPJ: 46.164.922/0001-35</p>
        </div>
        
        <button 
          onClick={onContactClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(2,132,199,0.05)', 
            border: '1px solid rgba(2,132,199,0.1)', 
            color: 'var(--color-primary)', 
            padding: '0.6rem 1.2rem', 
            borderRadius: '99px', 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(2,132,199,0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(2,132,199,0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Mail size={16} />
          Dúvidas, problemas ou sugestões? Entre em contato
        </button>
      </div>
    </footer>
  );
}
