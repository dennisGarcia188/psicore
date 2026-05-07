import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, LogOut, Users, Shield, CheckCircle, XCircle, Plus, X, ChevronDown } from 'lucide-react';
import api from '../api';

const SUB_COLORS = {
  'Trial': { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  'Ativo': { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  'Inadimplente': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  'Cancelado': { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
};

function adminApi() {
  const token = localStorage.getItem('admin_token');
  return {
    get: (url) => api.get(url, { headers: { Authorization: `Bearer ${token}` } }),
    post: (url, data) => api.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    patch: (url, data) => api.patch(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    delete: (url) => api.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  };
}

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', crp: '', specialty: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const aApi = adminApi();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await aApi.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId, isActive) => {
    const action = isActive ? 'block' : 'unblock';
    const msg = isActive ? 'Bloquear este psicólogo? Ele receberá um e-mail.' : 'Reativar este psicólogo?';
    if (!window.confirm(msg)) return;
    try {
      await aApi.post(`/admin/users/${userId}/${action}`);
      await fetchUsers();
    } catch (err) { alert('Erro ao atualizar.'); }
  };

  const handleSubscription = async (userId, status) => {
    try {
      await aApi.patch(`/admin/users/${userId}/subscription`, { subscription_status: status });
      await fetchUsers();
    } catch (err) { alert('Erro ao atualizar assinatura.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await aApi.post('/admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', crp: '', specialty: '' });
      setShowCreate(false);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao criar usuário.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    blocked: users.filter(u => !u.is_active).length,
    overdue: users.filter(u => u.subscription_status === 'Inadimplente').length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: 'white' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1E293B', borderBottom: '1px solid #334155', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={28} color="#0284C7" />
            <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>PsiCore</span>
            <span style={{ backgroundColor: 'rgba(2,132,199,0.2)', color: '#0284C7', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.25rem' }}>ADMIN</span>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #334155', color: '#94A3B8', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Gerenciamento de Psicólogos</h1>
          <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Gerencie todos os acessos e assinaturas da plataforma</p>
        </div>

        {/* Cards de estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Cadastrados', value: stats.total, icon: Users, color: '#0284C7' },
            { label: 'Contas Ativas', value: stats.active, icon: CheckCircle, color: '#10B981' },
            { label: 'Contas Bloqueadas', value: stats.blocked, icon: XCircle, color: '#EF4444' },
            { label: 'Inadimplentes', value: stats.overdue, icon: Shield, color: '#F59E0B' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ backgroundColor: '#1E293B', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de ações */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit' }}>
            <Plus size={16} /> Novo Psicólogo
          </button>
        </div>

        {/* Formulário de criação */}
        {showCreate && (
          <div style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>Criar Novo Psicólogo</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { field: 'name', placeholder: 'Nome completo', label: 'Nome *', col: 'span 1' },
                { field: 'email', placeholder: 'email@exemplo.com', label: 'E-mail *', col: 'span 1' },
                { field: 'password', placeholder: 'Senha inicial', label: 'Senha *', col: 'span 1' },
                { field: 'crp', placeholder: 'CRP 06/123456', label: 'CRP', col: 'span 1' },
                { field: 'specialty', placeholder: 'TCC, Psicanálise...', label: 'Especialidade', col: 'span 2' },
              ].map(({ field, placeholder, label, col }) => (
                <div key={field} style={{ gridColumn: col }}>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</label>
                  <input
                    type={field === 'password' ? 'password' : 'text'}
                    required={['name', 'email', 'password'].includes(field)}
                    placeholder={placeholder}
                    value={newUser[field]}
                    onChange={e => setNewUser(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontFamily: 'inherit', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={creating} style={{ backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                  {creating ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela de usuários */}
        <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F172A' }}>
                {['Psicólogo', 'CRP / Especialidade', 'Pacientes', 'Último Acesso', 'Assinatura', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Carregando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Nenhum psicólogo cadastrado.</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #1E293B' : 'none', backgroundColor: i % 2 === 0 ? '#1E293B' : '#172032' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284C720', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {u.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                        <p style={{ color: '#64748B', fontSize: '0.8rem' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{u.crp || '—'}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{u.specialty || '—'}</p>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0284C7' }}>{u.patient_count}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={u.subscription_status}
                      onChange={e => handleSubscription(u.id, e.target.value)}
                      style={{ backgroundColor: SUB_COLORS[u.subscription_status]?.bg || '#1E293B', color: SUB_COLORS[u.subscription_status]?.color || 'white', border: 'none', borderRadius: '99px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                    >
                      {['Trial', 'Ativo', 'Inadimplente', 'Cancelado'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ backgroundColor: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: u.is_active ? '#10B981' : '#EF4444', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {u.is_active ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleBlock(u.id, u.is_active)}
                      style={{ backgroundColor: u.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: u.is_active ? '#EF4444' : '#10B981', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                      {u.is_active ? 'Bloquear' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
