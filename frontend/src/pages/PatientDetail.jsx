import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, FileText, User, DollarSign, Mail, Phone, CreditCard } from 'lucide-react';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';
import ModalPortal from '../components/ModalPortal';
import RichTextEditor from '../components/RichTextEditor';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('prontuario'); // 'dados', 'prontuario', 'financeiro', 'documentos'
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newNote, setNewNote] = useState({ date_time: '', notes: '', template_id: '' });
  
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchPatientData();
    fetchTemplates();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const pRes = await api.get(`/patients/${id}`);
      setPatient(pRes.data);
      setEditedPatient(pRes.data);
      const aRes = await api.get(`/appointments/patient/${id}`);
      setAppointments(aRes.data);
      const dRes = await api.get(`/patients/${id}/documents`);
      setDocuments(dRes.data);
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

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/patients/${id}`, editedPatient);
      setEditMode(false);
      fetchPatientData();
    } catch (err) {
      console.error('Erro ao atualizar paciente', err);
      alert('Erro ao atualizar os dados do paciente.');
    } finally {
      setUpdating(false);
    }
  };

  if (!patient) return <LoadingScreen />;

  const filteredAppointments = [...appointments].filter(appt => {
    if (filterType === 'all') return true;
    const apptDate = new Date(appt.date_time);
    const now = new Date();
    
    if (filterType === 'month') {
      return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
    }
    if (filterType === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return apptDate >= startOfWeek && apptDate <= endOfWeek;
    }
    if (filterType === 'specific' && filterDate) {
      const filterD = new Date(filterDate + 'T00:00:00');
      return apptDate.getDate() === filterD.getDate() && apptDate.getMonth() === filterD.getMonth() && apptDate.getFullYear() === filterD.getFullYear();
    }
    return true;
  }).sort((a,b) => new Date(b.date_time) - new Date(a.date_time));

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
        borderBottom: activeTab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontWeight: activeTab === id ? 600 : 500,
        backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
        whiteSpace: 'nowrap', flexShrink: 0, fontSize: isMobile ? '0.8rem' : '1rem'
      }}
    >
      <Icon size={isMobile ? 16 : 18} /> {label}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={20} /> Voltar para Pacientes
      </Link>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>{patient.name}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <CreditCard size={16} /> <strong>CPF:</strong> {patient.cpf || 'Não informado'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <Phone size={16} /> <strong>Telefone:</strong> {patient.phone || 'Não informado'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <Mail size={16} /> <strong>E-mail:</strong> {patient.email || 'Não informado'}
          </div>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', overflowX: isMobile ? 'auto' : 'visible' }}>
        <TabButton id="dados" label="Dados Pessoais" icon={User} />
        <TabButton id="prontuario" label="Histórico" icon={Clock} />
        <TabButton id="financeiro" label="Financeiro" icon={DollarSign} />
        <TabButton id="documentos" label="Documentos" icon={FileText} />
      </div>

      {activeTab === 'dados' && (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: isMobile ? '1.25rem' : '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Informações Cadastrais</h3>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="btn btn-secondary" style={{ width: isMobile ? '100%' : 'auto' }}>Editar Informações</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
                <button onClick={() => { setEditMode(false); setEditedPatient(patient); }} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', flex: 1 }}>Cancelar</button>
                <button onClick={handleUpdatePatient} disabled={updating} className="btn btn-primary" style={{ flex: 2 }}>{updating ? 'Salvando...' : 'Salvar'}</button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem' }}>
            {!editMode ? (
              <>
                {[
                  { label: 'Nome Completo', value: patient.name, full: true },
                  { label: 'CPF', value: patient.cpf },
                  { label: 'RG', value: patient.rg },
                  { label: 'Data de Nascimento', value: patient.birth_date ? new Date(patient.birth_date + 'T12:00:00').toLocaleDateString('pt-BR') : '' },
                  { label: 'Profissão', value: patient.profession },
                  { label: 'Estado Civil', value: patient.marital_status },
                  { label: 'Telefone', value: patient.phone },
                  { label: 'E-mail', value: patient.email },
                  { label: 'Endereço', value: patient.address, full: true },
                  { label: 'Contato de Emergência', value: patient.emergency_contact, full: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    backgroundColor: 'var(--color-background)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    gridColumn: item.full && !isMobile ? 'span 2' : 'auto',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem'
                  }}>
                    <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</strong>
                    <span style={{ color: 'var(--color-text-main)', fontSize: '1rem', fontWeight: 500 }}>{item.value || '-'}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Nome Completo</label>
                  <input type="text" className="input-control" value={editedPatient.name} onChange={e => setEditedPatient({...editedPatient, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" className="input-control" value={editedPatient.cpf} onChange={e => setEditedPatient({...editedPatient, cpf: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>RG</label>
                  <input type="text" className="input-control" value={editedPatient.rg} onChange={e => setEditedPatient({...editedPatient, rg: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" className="input-control" value={editedPatient.phone} onChange={e => setEditedPatient({...editedPatient, phone: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>E-mail</label>
                  <input type="email" className="input-control" value={editedPatient.email} onChange={e => setEditedPatient({...editedPatient, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Profissão</label>
                  <input type="text" className="input-control" value={editedPatient.profession} onChange={e => setEditedPatient({...editedPatient, profession: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Estado Civil</label>
                  <input type="text" className="input-control" value={editedPatient.marital_status} onChange={e => setEditedPatient({...editedPatient, marital_status: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Endereço</label>
                  <input type="text" className="input-control" value={editedPatient.address} onChange={e => setEditedPatient({...editedPatient, address: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Contato de Emergência</label>
                  <input type="text" className="input-control" value={editedPatient.emergency_contact} onChange={e => setEditedPatient({...editedPatient, emergency_contact: e.target.value})} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'prontuario' && (
        <div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Histórico Completo</h3>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
              <select className="input-control" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">Todas as Consultas</option>
                <option value="month">Este Mês</option>
                <option value="week">Esta Semana</option>
                <option value="specific">Data Específica</option>
              </select>
              
              {filterType === 'specific' && (
                <input type="date" className="input-control" style={{ width: 'auto' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              )}

              <button onClick={() => setShowNoteModal(true)} className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
                <Plus size={20} /> Evolução Avulsa
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredAppointments.length === 0 ? (
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>
                Nenhum histórico encontrado com estes filtros.
              </div>
            ) : (
              filteredAppointments.map(appt => (
                <div key={appt.id} onClick={() => setSelectedAppointment(appt)} style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>{new Date(appt.date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span className={`badge ${appt.status === 'Confirmada' ? 'badge-primary' : appt.status === 'Realizada' ? 'badge-success' : appt.status === 'Cancelada' ? 'badge-error' : 'badge-warning'}`}>{appt.status}</span>
                        <span className={`badge ${appt.is_paid ? 'badge-success' : 'badge-warning'}`}>{appt.is_paid ? 'Pago' : 'Pendente'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--color-text-main)' }}>R$ {appt.fee?.toFixed(2)}</strong>
                    </div>
                  </div>
                  
                  {appt.notes && (
                    <div style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} /> Ver Anotações da Sessão
                    </div>
                  )}
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

      {activeTab === 'documentos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Documentos Emitidos</h3>
          </div>
          
          {documents.length === 0 ? (
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>
              Nenhum documento gerado para este paciente. Use a aba "Modelos" para emitir atestados e encaminhamentos.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data de Emissão</th>
                    <th>Tipo de Documento</th>
                    <th>Envio</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>{new Date(doc.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td style={{ fontWeight: 500 }}>{doc.document_type.toUpperCase()}</td>
                      <td>
                        {doc.sent_by_email ? (
                          <span className="badge badge-success">Enviado por E-mail</span>
                        ) : (
                          <span className="badge badge-primary">Baixado (PDF)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                <label>Anotações / Evolução</label>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <RichTextEditor 
                    value={newNote.notes || ''} 
                    onChange={val => setNewNote({...newNote, notes: val})} 
                    placeholder="Digite a evolução detalhada do paciente aqui..."
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Prontuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para Visualizar Consulta */}
      {selectedAppointment && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Detalhes da Consulta</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Data e Hora</strong>
                  <span>{new Date(selectedAppointment.date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Valor da Sessão</strong>
                  <span>R$ {selectedAppointment.fee?.toFixed(2)}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</strong>
                  <span className={`badge ${selectedAppointment.status === 'Confirmada' ? 'badge-primary' : selectedAppointment.status === 'Realizada' ? 'badge-success' : selectedAppointment.status === 'Cancelada' ? 'badge-error' : 'badge-warning'}`}>{selectedAppointment.status}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pagamento</strong>
                  <span className={`badge ${selectedAppointment.is_paid ? 'badge-success' : 'badge-warning'}`}>{selectedAppointment.is_paid ? 'Pago' : 'Pendente'}</span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div style={{ marginTop: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Evolução / Anotações</strong>
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    overflowWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    color: 'var(--color-text-main)', 
                    lineHeight: '1.6', 
                    backgroundColor: 'var(--color-background)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--color-border)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <div className="quill-content" dangerouslySetInnerHTML={{ __html: selectedAppointment.notes }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-primary" onClick={() => setSelectedAppointment(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
