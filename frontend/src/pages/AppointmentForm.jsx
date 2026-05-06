import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api';

export default function AppointmentForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    date_time: '',
    fee: 0,
    status: 'Aguardando Confirmação'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      alert("Selecione um paciente");
      return;
    }

    try {
      const payload = {
        patient_id: parseInt(formData.patient_id),
        date_time: new Date(formData.date_time).toISOString(),
        fee: parseFloat(formData.fee),
        status: formData.status
      };
      await api.post('/appointments/', payload);
      navigate('/dashboard/calendar');
    } catch (err) {
      console.error('Erro ao criar agendamento', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/calendar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={20} /> Voltar para a Agenda
      </Link>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Novo Agendamento</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Paciente *</label>
            <select 
              className="input-control" 
              required
              value={formData.patient_id}
              onChange={e => setFormData({...formData, patient_id: e.target.value})}
            >
              <option value="">-- Selecione o Paciente --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Data e Hora *</label>
            <input 
              type="datetime-local" 
              className="input-control" 
              required 
              value={formData.date_time}
              onChange={e => setFormData({...formData, date_time: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Status</label>
              <select 
                className="input-control" 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Aguardando Confirmação">Aguardando Confirmação</option>
                <option value="Confirmada">Confirmada</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Valor da Consulta (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-control" 
                value={formData.fee}
                onChange={e => setFormData({...formData, fee: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            Salvar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
}
