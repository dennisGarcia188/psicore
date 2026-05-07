import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import api from '../api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const token = res.data.access_token;

      // Verificar se é admin
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!meRes.data.is_admin) {
        setError('Acesso negado. Esta área é restrita ao administrador.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', token);
      navigate('/admin/panel');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1E293B', padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(2,132,199,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Shield size={32} color="#0284C7" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>PsiCore Admin</h1>
          <p style={{ color: '#64748B', marginTop: '0.25rem', fontSize: '0.875rem' }}>Área restrita ao administrador</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '0.875rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>E-mail</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="admin@psicore.com"
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Senha</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0284C7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}
