import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import api from '../api';
import { maskPhone } from '../utils/masks';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    crp: '', specialty: '', phone: '',
    clinic_name: '', clinic_cnpj: '', clinic_address: '', clinic_phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      await api.post('/auth/register', payload);

      const formData = new URLSearchParams();
      formData.append('username', form.email);
      formData.append('password', form.password);
      const loginResponse = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', loginResponse.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title }) => (
    <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.25rem', marginTop: '1rem' }}>
      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '700px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Brain size={32} color="var(--color-primary)" />
            <h1 style={{ color: 'var(--color-primary)', fontSize: '1.75rem', fontWeight: 800 }}>PsiCore</h1>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Crie sua conta</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Preencha seus dados profissionais para começar</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            
            <Section title="Dados de Acesso" />

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome Completo *</label>
              <input type="text" className="input-control" required placeholder="Dr. João da Silva" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="input-group">
              <label>E-mail *</label>
              <input type="email" className="input-control" required placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Senha *</label>
              <input type="password" className="input-control" required placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>

            <Section title="Dados Profissionais" />

            <div className="input-group">
              <label>CRP</label>
              <input type="text" className="input-control" placeholder="CRP 06/123456" value={form.crp} onChange={e => set('crp', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Especialidade</label>
              <select className="input-control" value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                <option value="">Selecione...</option>
                <option>Psicanálise</option>
                <option>TCC (Terapia Cognitivo-Comportamental)</option>
                <option>Gestalt-terapia</option>
                <option>Humanismo</option>
                <option>Psicologia Positiva</option>
                <option>EMDR</option>
                <option>DBT</option>
                <option>Outra</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Telefone Profissional</label>
              <input type="text" className="input-control" placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} />
            </div>

            <Section title="Dados do Consultório (opcional)" />

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome do Consultório</label>
              <input type="text" className="input-control" placeholder="Clínica Mente Sã" value={form.clinic_name} onChange={e => set('clinic_name', e.target.value)} />
            </div>
            <div className="input-group">
              <label>CNPJ</label>
              <input type="text" className="input-control" placeholder="00.000.000/0001-00" value={form.clinic_cnpj} onChange={e => set('clinic_cnpj', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Telefone do Consultório</label>
              <input type="text" className="input-control" placeholder="(00) 0000-0000" value={form.clinic_phone} onChange={e => set('clinic_phone', maskPhone(e.target.value))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Endereço</label>
              <input type="text" className="input-control" placeholder="Rua Exemplo, 123 - Sala 4, São Paulo/SP" value={form.clinic_address} onChange={e => set('clinic_address', e.target.value)} />
            </div>

          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1.5rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Minha Conta no PsiCore'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Já tem uma conta? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
