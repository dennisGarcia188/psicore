import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, FileText, User, DollarSign } from 'lucide-react';
import api from '../api';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('prontuario'); // 'dados', 'prontuario', 'financeiro'
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ date_time: '', notes: '', template_id: '' });

  useEffect(() => {
    fetchPatientData();
    fetchTemplates();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const pRes = await api.get(`/patients/${id}`);
      setPatient(pRes.data);
      const aRes = await api.get(`/appointments/patient/${id}`);
      setAppointments(aRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados do paciente', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates/');
      setTemplates(res.data);
    } catch (err) {
      console.error('Erro ao buscar templates', err);
    }
  };

  const handleTemplateSelect = (templateId) => {
    if (!templateId) return;
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setNewNote(prev => ({ ...prev, notes: template.content, template_id: templateId }));
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        patient_id: parseInt(id), 
        date_time: new Date(newNote.date_time).toISOString(),
        notes: newNote.notes,
        status: "Realizada" // Anotações de prontuário pressupõem consulta realizada
      };
      await api.post('/appointments/', payload);
      setShowNoteModal(false);
      setNewNote({ date_time: '', notes: '', template_id: '' });
      fetchPatientData();
    } catch (err) {
      console.error('Erro ao criar anotação', err);
    }
  };

  const togglePayment = async (appt) => {
    try {
      await api.put(`/appointments/${appt.id}`, { ...appt, is_paid: !appt.is_paid });
      fetchPatientData();
    } catch (err) {
      console.error('Erro ao atualizar pagamento', err);
    }
  };

  if (!patient) return <div>Carregando...</div>;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem',
        borderBottom: activeTab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontWeight: activeTab === id ? 600 : 500,
        backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
      }}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={20} /> Voltar para Pacientes
      </Link>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{patient.name}</h2>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          <p>CPF: {patient.cpf || '-'}</p>
          <p>Telefone: {patient.phone || '-'}</p>
          <p>E-mail: {patient.email || '-'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <TabButton id="dados" label="Dados Pessoais" icon={User} />
        <TabButton id="prontuario" label="Prontuário" icon={FileText} />
        <TabButton id="financeiro" label="Financeiro" icon={DollarSign} />
      </div>

      {activeTab === 'dados' && (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Informações Cadastrais</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Nome Completo</strong>{patient.name}</div>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>CPF</strong>{patient.cpf || '-'}</div>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>RG</strong>{patient.rg || '-'}</div>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Data de Nascimento</strong>-</div>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Profissão</strong>{patient.profession || '-'}</div>
            <div><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Estado Civil</strong>{patient.marital_status || '-'}</div>
            <div style={{ gridColumn: 'span 2' }}><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Endereço</strong>{patient.address || '-'}</div>
            <div style={{ gridColumn: 'span 2' }}><strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Contato de Emergência</strong>{patient.emergency_contact || '-'}</div>
          </div>
        </div>
      )}

      {activeTab === 'prontuario' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Evolução Clínica</h3>
            <button onClick={() => setShowNoteModal(true)} className="btn btn-primary">
              <Plus size={20} /> Adicionar Evolução
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {appointments.filter(a => a.notes).length === 0 ? (
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>
                Nenhuma anotação registrada ainda.
              </div>
            ) : (
              appointments.filter(a => a.notes).map(appt => (
                <div key={appt.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>{new Date(appt.date_time).toLocaleString()}</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                    {appt.notes}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data da Consulta</th>
                <th>Valor (R$)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma consulta registrada.</td></tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{new Date(appt.date_time).toLocaleString()}</td>
                    <td>{appt.fee.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${appt.is_paid ? 'badge-success' : 'badge-warning'}`}>
                        {appt.is_paid ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => togglePayment(appt)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        Marcar como {appt.is_paid ? 'Pendente' : 'Pago'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Adicionar Anotação / Prontuário */}
      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Adicionar Evolução</h3>
            <form onSubmit={handleSaveNote}>
              <div className="input-group">
                <label>Data e Hora</label>
                <input type="datetime-local" className="input-control" required value={newNote.date_time} onChange={e => setNewNote({...newNote, date_time: e.target.value})} />
              </div>
              
              <div className="input-group">
                <label>Usar Modelo (Opcional)</label>
                <select className="input-control" value={newNote.template_id} onChange={e => handleTemplateSelect(e.target.value)}>
                  <option value="">-- Selecione um modelo --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Anotações</label>
                <textarea className="input-control" rows="8" required value={newNote.notes} onChange={e => setNewNote({...newNote, notes: e.target.value})} placeholder="Escreva a evolução clínica do paciente..."></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Prontuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
