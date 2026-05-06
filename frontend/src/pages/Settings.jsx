import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import api from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    clinic_name: '',
    cnpj: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/');
      if (res.data) {
        setSettings({
          clinic_name: res.data.clinic_name || '',
          cnpj: res.data.cnpj || '',
          address: res.data.address || '',
          phone: res.data.phone || ''
        });
      }
    } catch (err) {
      console.error('Erro ao buscar configurações', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put('/settings/', settings);
      setMessage('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar', err);
      setMessage('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', alignSelf: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Administração do Consultório</h2>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Atualize os dados públicos do seu consultório que poderão ser utilizados em cabeçalhos de atestados e recibos.</p>

        
        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: message.includes('sucesso') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('sucesso') ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
            {message.includes('sucesso') && <CheckCircle size={20} />}
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="input-group">
            <label>Nome do Consultório / Clínica</label>
            <input type="text" className="input-control" value={settings.clinic_name} onChange={e => setSettings({...settings, clinic_name: e.target.value})} />
          </div>
          <div className="input-group">
            <label>CNPJ / CPF de Atuação</label>
            <input type="text" className="input-control" value={settings.cnpj} onChange={e => setSettings({...settings, cnpj: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Telefone Comercial</label>
            <input type="text" className="input-control" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Endereço Completo</label>
            <input type="text" className="input-control" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }} disabled={loading}>
            <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
