import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, X } from 'lucide-react';
import api from '../api';
import DateTimePicker from '../components/DateTimePicker';
import CurrencyInput from 'react-currency-input-field';
import ModalPortal from '../components/ModalPortal';

export default function AppointmentForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    date_time: null,
    fee: 0,
    status: 'Aguardando Confirmação'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [conflictMsg, setConflictMsg] = useState('');

  useEffect(() => { fetchPatients(); }, []);

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
    setError('');

    if (!formData.patient_id) { setError('Selecione um paciente.'); return; }
    if (!formData.date_time) { setError('Selecione a data e horário da consulta.'); return; }

    setSubmitting(true);
    try {
      await api.post('/appointments/', {
        patient_id: parseInt(formData.patient_id),
        date_time: new Date(formData.date_time).toISOString(),
        fee: parseFloat(formData.fee) || 0,
        status: formData.status
      });
      navigate('/dashboard/calendar');
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictMsg(err.response.data.detail);
      } else {
        setError(err.response?.data?.detail || 'Erro ao criar agendamento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/calendar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={20} /> Voltar para a Agenda
      </Link>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarPlus size={22} color="var(--color-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Novo Agendamento</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Preencha os dados da consulta</p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Paciente *</label>
            <select
              className="input-control"
              value={formData.patient_id}
              onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
              required
            >
              <option value="">— Selecione o Paciente —</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Data e Hora *</label>
            <DateTimePicker
              value={formData.date_time}
              onChange={(date) => setFormData({ ...formData, date_time: date })}
              placeholder="Selecionar data e horário"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="input-group">
              <label>Status</label>
              <select
                className="input-control"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Aguardando Confirmação">Aguardando Confirmação</option>
                <option value="Confirmada">Confirmada</option>
              </select>
            </div>
            <div className="input-group">
              <label>Valor da Consulta (R$)</label>
              <CurrencyInput
                id="fee"
                name="fee"
                placeholder="R$ 0,00"
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                prefix="R$ "
                className="input-control"
                value={formData.fee}
                onValueChange={(value) => setFormData({ ...formData, fee: value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem' }}
            disabled={submitting}
          >
            <CalendarPlus size={18} />
            {submitting ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>

      {/* ── Modal de Conflito de Horário ── */}
      {conflictMsg && (
        <ModalPortal>
          <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
              <div style={{ display: 'inline-flex', backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <X size={32} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Horário Indisponível
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {conflictMsg}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setConflictMsg('')}
              >
                Entendi, voltar
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
