import { useState, useEffect } from 'react';
import { X, Send, MessageCircle, User, Mail, Loader2 } from 'lucide-react';
import api from '../api';

export default function SupportModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Tenta carregar dados do usuário logado do localStorage se houver
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || ''
        }));
      } catch (e) {
        console.error('Erro ao parsear usuário', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post('/settings/support', { message: formData.message });
      setSent(true);
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      console.error(err);
      setError('Falha ao enviar mensagem. Por favor, tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle color="var(--color-primary)" /> Suporte e Sugestões
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Como podemos te ajudar hoje?</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Send size={32} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mensagem Enviada!</h4>
            <p style={{ color: 'var(--color-text-muted)' }}>Agradecemos seu contato. O administrador receberá sua mensagem em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> Nome
              </label>
              <input 
                type="text" 
                className="input-control" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome"
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> E-mail
              </label>
              <input 
                type="email" 
                className="input-control" 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div className="input-group">
              <label>Sua mensagem *</label>
              <textarea
                required
                className="input-control"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Descreva aqui sua dúvida, problema ou sugestão..."
                style={{ minHeight: '150px', resize: 'vertical' }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={submitting || !formData.message.trim()} className="btn btn-primary" style={{ flex: 1.5 }}>
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
