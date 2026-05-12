import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import api from '../api';

export default function LoginPage() {
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
      formData.append('username', email); // FastAPI OAuth2PasswordRequestForm expects 'username'
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      
      // Buscar dados do usuário para preencher o suporte depois
      const userProfile = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userProfile.data));

      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0F172A' 
    }} className="animate-fade-in">
      <div style={{ 
        backgroundColor: '#1E293B', 
        padding: '3rem', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        width: '100%', 
        maxWidth: '420px',
        border: '1px solid #334155'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'rgba(2,132,199,0.1)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem' 
          }}>
            <Brain size={40} color="#0284C7" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>PsiCore</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>Faça login na sua conta profissional</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#EF4444', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.875rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email" style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail Profissional</label>
            <input 
              type="email" 
              id="email" 
              className="input-control" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ 
                backgroundColor: '#0F172A', 
                border: '1px solid #334155', 
                color: 'white',
                padding: '0.875rem 1rem'
              }}
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2.5rem' }}>
            <label htmlFor="password" style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha</label>
            <input 
              type="password" 
              id="password" 
              className="input-control" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                backgroundColor: '#0F172A', 
                border: '1px solid #334155', 
                color: 'white',
                padding: '0.875rem 1rem'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1rem', 
            fontWeight: 800,
            borderRadius: '12px',
            backgroundColor: '#0284C7',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }} disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #334155', 
          textAlign: 'center' 
        }}>
          <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
            Ainda não tem uma conta? <br />
            <Link to="/register" style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>Solicitar Acesso Gratuito</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
