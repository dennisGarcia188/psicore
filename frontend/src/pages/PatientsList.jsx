import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { maskCPF, maskPhone, maskRG } from '../utils/masks';
import api from '../api';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ 
    name: '', email: '', phone: '', cpf: '', rg: '', 
    address: '', profession: '', emergency_contact: '', marital_status: '', birth_date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/');
      setPatients(response.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes', err);
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Meus Pacientes</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum paciente encontrado.</td></tr>
            ) : (
              filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/dashboard/patients/${patient.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {patient.name}
                    </Link>
                  </td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.cpf || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => navigate(`/dashboard/patients/${patient.id}`)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem' }} title="Prontuário">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="btn" style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--color-error)', border: '1px solid var(--color-error)' }} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Novo Paciente</h3>
            <form onSubmit={handleCreatePatient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
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
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
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
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Estado Civil</label>
                  <select className="input-control" value={newPatient.marital_status} onChange={e => setNewPatient({...newPatient, marital_status: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Solteiro">Solteiro(a)</option>
                    <option value="Casado">Casado(a)</option>
                    <option value="Divorciado">Divorciado(a)</option>
                    <option value="Viúvo">Viúvo(a)</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
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
