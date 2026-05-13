import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, ChevronRight } from 'lucide-react';
import { maskCPF, maskPhone, maskRG } from '../utils/masks';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ 
    name: '', email: '', phone: '', cpf: '', rg: '', 
    address: '', profession: '', emergency_contact: '', marital_status: '', birth_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients/');
      setPatients(response.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newPatient };
      // O backend Pydantic não aceita string vazia para EmailStr, precisa ser null
      if (payload.email === '') payload.email = null;
      if (payload.cpf === '') payload.cpf = null;
      
      await api.post('/patients/', payload);
      setShowModal(false);
      setNewPatient({ name: '', email: '', phone: '', cpf: '', rg: '', address: '', profession: '', emergency_contact: '', marital_status: '', birth_date: '' });
      fetchPatients();
    } catch (err) {
      console.error('Erro ao criar paciente', err.response?.data || err);
      alert('Erro ao cadastrar paciente. Verifique os dados. ' + (err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : ''));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (err) {
        console.error('Erro ao excluir paciente', err);
      }
    }
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const PatientCard = ({ patient }) => (
    <div 
      onClick={() => navigate(`/dashboard/patients/${patient.id}`)}
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        padding: '2rem 1.5rem', 
        borderRadius: 'var(--radius-xl)', 
        boxShadow: 'var(--shadow-sm)', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem',
        position: 'relative'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{ 
        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(2,132,199,0.08)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
        fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', border: '2px solid rgba(2,132,199,0.1)'
      }}>
        {patient.name.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1.25rem', marginBottom: '0.35rem', lineHeight: 1.2 }}>{patient.name}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{patient.profession || 'Paciente'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Phone size={14} />
          <span>{patient.phone || 'Sem telefone'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Mail size={14} />
          <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.email || 'Sem e-mail'}</span>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', width: '100%', display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
         <button 
          onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}
         >
           <Trash2 size={16} /> Excluir
         </button>
         <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)' }} />
         <button 
          style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.875rem', fontWeight: 600 }}
         >
           Ver Perfil <ChevronRight size={16} />
         </button>
      </div>
    </div>
  );
  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>Meus Pacientes</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Plus size={20} /> Novo Paciente
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search color="var(--color-text-muted)" size={20} />
        <input 
          type="text" 
          placeholder="Buscar paciente por nome..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', backgroundColor: 'transparent' }}
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '5rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text-muted)' }}>
          <User size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.15, color: 'var(--color-primary)' }} />
          <h3 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Nenhum paciente encontrado</h3>
          <p>Tente ajustar sua busca ou cadastrar um novo paciente.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Novo Paciente</h3>
             <form onSubmit={handleCreatePatient}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 1rem' }}>
                <div className="input-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label>Nome Completo *</label>
                  <input type="text" className="input-control" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} placeholder="Ex: João da Silva" />
                </div>
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" className="input-control" value={newPatient.cpf} onChange={e => setNewPatient({...newPatient, cpf: maskCPF(e.target.value)})} placeholder="000.000.000-00" />
                </div>
                <div className="input-group">
                  <label>RG</label>
                  <input type="text" className="input-control" value={newPatient.rg} onChange={e => setNewPatient({...newPatient, rg: maskRG(e.target.value)})} placeholder="00.000.000-0" />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" className="input-control" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" className="input-control" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} placeholder="joao@email.com" />
                </div>
                <div className="input-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label>Endereço Completo</label>
                  <input type="text" className="input-control" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} placeholder="Rua Exemplo, 123 - Bairro" />
                </div>
                <div className="input-group">
                  <label>Profissão</label>
                  <input type="text" className="input-control" value={newPatient.profession} onChange={e => setNewPatient({...newPatient, profession: e.target.value})} placeholder="Engenheiro" />
                </div>
                <div className="input-group">
                  <label>Contato de Emergência</label>
                  <input type="text" className="input-control" value={newPatient.emergency_contact} onChange={e => setNewPatient({...newPatient, emergency_contact: maskPhone(e.target.value)})} placeholder="(00) 00000-0000 (Mãe)" />
                </div>
                <div className="input-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label>Estado Civil</label>
                  <select className="input-control" value={newPatient.marital_status} onChange={e => setNewPatient({...newPatient, marital_status: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Solteiro">Solteiro(a)</option>
                    <option value="Casado">Casado(a)</option>
                    <option value="Divorciado">Divorciado(a)</option>
                    <option value="Viúvo">Viúvo(a)</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 1' }}>
                  <label>Data de Nascimento</label>
                  <input type="date" className="input-control" value={newPatient.birth_date} onChange={e => setNewPatient({...newPatient, birth_date: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
