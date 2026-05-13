import { useState, useEffect } from 'react';
import { Save, CheckCircle, User, Building2 } from 'lucide-react';
import { maskPhone } from '../utils/masks';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '', email: '', crp: '', specialty: '', phone: '',
    clinic_name: '', clinic_cnpj: '', clinic_address: '', clinic_phone: '',
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setInitialLoading(true);
      try {
        const userRes = await api.get('/auth/me');
        const u = userRes.data;

        // Tentar buscar dados do consultório
        let clinic = {};
        try {
          const cRes = await api.get('/settings/');
          clinic = cRes.data || {};
        } catch (_) {}

        setForm({
          name: u.name || '',
          email: u.email || '',
          crp: u.crp || '',
          specialty: u.specialty || '',
          phone: u.phone || '',
          clinic_name: clinic.clinic_name || '',
          clinic_cnpj: clinic.cnpj || '',
          clinic_address: clinic.address || '',
          clinic_phone: clinic.phone || '',
        });
      } catch (err) {
        console.error('Erro ao carregar perfil', err);
      } finally {
        setInitialLoading(false);
      }
    };
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    fetchProfile();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put('/auth/me', form);
      setMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ icon: Icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
      <Icon size={20} color="var(--color-primary)" />
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>{title}</p>
    </div>
  );

  if (initialLoading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: isMobile ? 'center' : 'left' }}>Meu Perfil</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', textAlign: isMobile ? 'center' : 'left' }}>Gerencie seus dados profissionais e do consultório.</p>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          
          {message && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: message.includes('sucesso') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('sucesso') ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
              {message.includes('sucesso') && <CheckCircle size={20} />}
              {message}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>

              <Section icon={User} title="Dados Pessoais e Profissionais" />

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Nome Completo</label>
                <input type="text" className="input-control" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input type="email" className="input-control" value={form.email} disabled style={{ backgroundColor: 'var(--color-background)', cursor: 'not-allowed', opacity: 0.7 }} />
              </div>
              <div className="input-group">
                <label>Telefone Profissional</label>
                <input type="text" className="input-control" placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} />
              </div>
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

              <Section icon={Building2} title="Dados do Consultório" />

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
                <input type="text" className="input-control" placeholder="Rua Exemplo, 123 - São Paulo/SP" value={form.clinic_address} onChange={e => set('clinic_address', e.target.value)} />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={loading}>
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
