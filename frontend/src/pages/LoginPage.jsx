import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }} className="animate-fade-in">
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>PsicoManager</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Faça login na sua conta</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="input-control" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              className="input-control" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Não tem uma conta? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
