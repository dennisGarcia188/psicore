import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      
      // Auto login after register
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', loginResponse.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocorreu um erro ao criar a conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }} className="animate-fade-in">
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Comece agora</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Crie sua conta no PsicoManager</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="name">Nome Completo</label>
            <input 
              type="text" 
              id="name" 
              className="input-control" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. João Silva"
            />
          </div>

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
              placeholder="Crie uma senha forte"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Já tem uma conta? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
