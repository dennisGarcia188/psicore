import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, LogOut, Users, Shield, CheckCircle, XCircle, Plus, X, ChevronDown, DollarSign, LayoutDashboard, Settings as SettingsIcon, Search, CreditCard, Filter, Calendar, Mail, AlertTriangle } from 'lucide-react';
import api from '../api';

const SUB_COLORS = {
  'Trial': { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  'Ativo': { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  'Inadimplente': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  'Cancelado': { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
};

const CHARGE_STATUS_COLORS = {
  'Pendente': { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  'Pago': { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  'Atrasado': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  'Cancelado': { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
};

function adminApi() {
  const token = localStorage.getItem('admin_token');
  return {
    get: (url, params) => api.get(url, { headers: { Authorization: `Bearer ${token}` }, params }),
    post: (url, data) => api.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    patch: (url, data) => api.patch(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    delete: (url) => api.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  };
}

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'finance'
  
  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  // Create User
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', crp: '', specialty: '' });
  const [creating, setCreating] = useState(false);
  
  // Edit User
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  
  // Charge
  const [showGenerateCharge, setShowGenerateCharge] = useState(false);
  const [newCharge, setNewCharge] = useState({ user_id: '', amount: '', due_date: '', reference_month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` });
  const [generatingCharge, setGeneratingCharge] = useState(false);

  // Actions
  const [confirmAction, setConfirmAction] = useState(null); // { userId, isActive, action, msg }
  
  const navigate = useNavigate();
  const aApi = adminApi();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    fetchUsers();
    fetchCharges();
  }, [filterMonth, filterYear]);

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

  const fetchCharges = async () => {
    try {
      const res = await aApi.get('/admin/charges', { month: filterMonth, year: filterYear });
      setCharges(res.data);
    } catch (err) {
      console.error('Erro ao buscar cobranças:', err);
    }
  };

  const handleBlockClick = (e, user) => {
    e.stopPropagation();
    setConfirmAction({
      userId: user.id,
      isActive: user.is_active,
      action: user.is_active ? 'block' : 'unblock',
      msg: user.is_active ? `Bloquear ${user.name}? Ele perderá o acesso imediatamente.` : `Reativar o acesso de ${user.name}?`,
    });
  };

  const confirmBlock = async () => {
    if (!confirmAction) return;
    try {
      await aApi.post(`/admin/users/${confirmAction.userId}/${confirmAction.action}`, {});
      await fetchUsers();
      setConfirmAction(null);
    } catch (err) { 
      console.error('Erro block:', err);
      alert('Erro ao atualizar: ' + (err.response?.data?.detail || err.message)); 
      setConfirmAction(null);
    }
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

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      crp: user.crp || '',
      specialty: user.specialty || '',
      plan_price: user.plan_price || 0,
      subscription_status: user.subscription_status,
      next_billing_date: user.next_billing_date ? user.next_billing_date.split('T')[0] : '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const dataToSource = { ...editFormData };
      if (dataToSource.next_billing_date === '') delete dataToSource.next_billing_date;
      
      await aApi.patch(`/admin/users/${editingUser.id}`, dataToSource);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao atualizar usuário.');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateCharge = async (e) => {
    e.preventDefault();
    setGeneratingCharge(true);
    try {
      await aApi.post('/admin/charges', newCharge);
      setShowGenerateCharge(false);
      fetchCharges();
      alert('Cobrança gerada e e-mail enviado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao gerar cobrança.');
    } finally {
      setGeneratingCharge(false);
    }
  };

  const handleMarkAsPaid = async (chargeId) => {
    try {
      await aApi.patch(`/admin/charges/${chargeId}/pay`, {});
      fetchCharges();
    } catch (err) {
      alert('Erro ao marcar como pago.');
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
    totalRevenue: charges.reduce((acc, c) => acc + (c.status === 'Pago' ? c.amount : 0), 0),
    pendingRevenue: charges.reduce((acc, c) => acc + (c.status === 'Pendente' || c.status === 'Atrasado' ? c.amount : 0), 0)
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: activeTab === id ? 'rgba(2,132,199,0.1)' : 'transparent',
        color: activeTab === id ? '#0284C7' : '#94A3B8',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s',
        textAlign: 'left',
        fontFamily: 'inherit'
      }}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const isOverdue = (charge) => {
    if (charge.status === 'Pago' || charge.status === 'Cancelado') return false;
    const dueDate = new Date(charge.due_date);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: 'white', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* Mobile Header */}
      {isMobile && (
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1rem 1.5rem', 
          backgroundColor: '#1E293B', 
          borderBottom: '1px solid #334155',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={24} color="#0284C7" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>PsiCore</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
          </button>
        </header>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 140 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: isMobile ? '280px' : '260px', 
        backgroundColor: '#1E293B', 
        borderRight: isMobile ? 'none' : '1px solid #334155', 
        display: (isMobile && !isMobileMenuOpen) ? 'none' : 'flex', 
        flexDirection: 'column', 
        padding: '1.5rem', 
        position: 'fixed', 
        top: 0,
        left: 0,
        height: '100vh', 
        zIndex: 150,
        transition: 'transform 0.3s ease',
        transform: (isMobile && !isMobileMenuOpen) ? 'translateX(-100%)' : 'translateX(0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <Brain size={32} color="#0284C7" />
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', display: 'block', lineHeight: 1 }}>PsiCore</span>
            <span style={{ color: '#0284C7', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>PAINEL ADMIN</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div onClick={() => isMobile && setIsMobileMenuOpen(false)}>
            <NavItem id="users" icon={Users} label="Psicólogos" />
          </div>
          <div onClick={() => isMobile && setIsMobileMenuOpen(false)}>
            <NavItem id="finance" icon={DollarSign} label="Financeiro" />
          </div>
          <div style={{ margin: '1.5rem 0', borderTop: '1px solid #334155' }} />
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'transparent', color: '#EF4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', textAlign: 'left' }}>
            <LogOut size={20} /> Sair
          </button>
        </nav>

        {!isMobile && (
          <div style={{ backgroundColor: 'rgba(2,132,199,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(2,132,199,0.1)' }}>
            <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status Sistema</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Operacional</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ 
        marginLeft: isMobile ? 0 : '260px', 
        flex: 1, 
        padding: isMobile ? '1.5rem' : '2rem 3rem',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        
        {activeTab === 'users' ? (
          <>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 800 }}>Psicólogos</h1>
                <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Gerencie o acesso e dados dos profissionais</p>
              </div>
              <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                <Plus size={18} /> Novo Psicólogo
              </button>
            </div>

            {/* Estatísticas Rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Total', value: stats.total, icon: Users, color: '#0284C7' },
                { label: 'Ativos', value: stats.active, icon: CheckCircle, color: '#10B981' },
                { label: 'Bloqueados', value: stats.blocked, icon: XCircle, color: '#EF4444' },
                { label: 'Inadimplentes', value: stats.overdue, icon: Shield, color: '#F59E0B' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ backgroundColor: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} color={color} />
                    </div>
                    <div>
                      <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', overflowX: 'auto' }}>
              <table style={{ width: isMobile ? '800px' : '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A' }}>
                    {['Psicólogo', 'CRP / Especialidade', 'Pacientes', 'Último Acesso', 'Status', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Carregando psicólogos...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Nenhum psicólogo encontrado.</td></tr>
                  ) : users.map((u, i) => (
                    <tr 
                      key={u.id} 
                      onClick={() => handleEditClick(u)}
                      style={{ 
                        borderTop: '1px solid #334155', 
                        cursor: 'pointer', 
                        backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(2,132,199,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#0284C720', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                            {u.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.name}</p>
                            <p style={{ color: '#64748B', fontSize: '0.8rem' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{u.crp || '—'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{u.specialty || '—'}</p>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#0284C7' }}>{u.patient_count}</span>
                          <span style={{ color: '#64748B', fontSize: '0.75rem' }}>pacientes</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#64748B' }}>
                        {u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ backgroundColor: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: u.is_active ? '#10B981' : '#EF4444', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${u.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                          {u.is_active ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <button
                          onClick={(e) => handleBlockClick(e, u)}
                          style={{ backgroundColor: u.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: u.is_active ? '#EF4444' : '#10B981', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        >
                          {u.is_active ? 'Bloquear' : 'Reativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 800 }}>Módulo Financeiro</h1>
                <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Controle de cobranças e faturamento mensal</p>
              </div>
              <button onClick={() => setShowGenerateCharge(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                <Plus size={18} /> Gerar Cobrança
              </button>
            </div>

            {/* Filtros e Stats */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ flex: 2, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#1E293B', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155', borderLeft: '4px solid #10B981' }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Recebido no Mês</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div style={{ backgroundColor: '#1E293B', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155', borderLeft: '4px solid #F59E0B' }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Pendente / Atrasado</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>R$ {stats.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div style={{ backgroundColor: '#1E293B', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155' }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Cobranças Totais</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{charges.length}</p>
                </div>
              </div>

              <div style={{ flex: 1, backgroundColor: '#1E293B', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Mês</label>
                  <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} style={{ width: '100%', backgroundColor: '#0F172A', border: '1px solid #334155', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Ano</label>
                  <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} style={{ width: '100%', backgroundColor: '#0F172A', border: '1px solid #334155', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabela de Cobranças */}
            <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', width: '100%', overflowX: 'auto' }}>
              <table style={{ width: isMobile ? '800px' : '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A' }}>
                    {['Psicólogo', 'Mês Ref.', 'Valor', 'Vencimento', 'Status', 'Ação'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {charges.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Nenhuma cobrança encontrada para este período.</td></tr>
                  ) : charges.map((c) => {
                    const overdue = isOverdue(c);
                    return (
                      <tr 
                        key={c.id} 
                        style={{ 
                          borderTop: '1px solid #334155',
                          backgroundColor: overdue ? 'rgba(239,68,68,0.05)' : 'transparent',
                          borderLeft: overdue ? '4px solid #EF4444' : '4px solid transparent'
                        }}
                      >
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <p style={{ fontWeight: 600 }}>{c.user_name}</p>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>{c.reference_month}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ fontWeight: 700 }}>R$ {c.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: overdue ? '#EF4444' : '#CBD5E1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {overdue && <AlertTriangle size={14} />}
                            {new Date(c.due_date).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ 
                            backgroundColor: overdue ? 'rgba(239,68,68,0.1)' : (CHARGE_STATUS_COLORS[c.status]?.bg || '#0F172A'), 
                            color: overdue ? '#EF4444' : (CHARGE_STATUS_COLORS[c.status]?.color || 'white'), 
                            padding: '0.35rem 0.75rem', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700 
                          }}>
                            {overdue ? 'Atrasado' : c.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {c.status === 'Pendente' || overdue ? (
                            <button 
                              onClick={() => handleMarkAsPaid(c.id)}
                              style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <CheckCircle size={14} /> Baixar
                            </button>
                          ) : (
                            <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>Pago em {new Date(c.paid_at).toLocaleDateString('pt-BR')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal Gerar Cobrança */}
        {showGenerateCharge && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#1E293B', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '500px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gerar Cobrança</h3>
                <button onClick={() => setShowGenerateCharge(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleGenerateCharge} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>PSICÓLOGO</label>
                  <select required value={newCharge.user_id} onChange={e => {
                    const u = users.find(u => u.id === parseInt(e.target.value));
                    setNewCharge(f => ({ ...f, user_id: parseInt(e.target.value), amount: u?.plan_price || 0 }));
                  }} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none' }}>
                    <option value="">Selecione um psicólogo</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>VALOR (R$)</label>
                    <input type="number" step="0.01" required value={newCharge.amount} onChange={e => setNewCharge(f => ({ ...f, amount: parseFloat(e.target.value) }))} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>VENCIMENTO</label>
                    <input type="date" required value={newCharge.due_date} onChange={e => setNewCharge(f => ({ ...f, due_date: e.target.value }))} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>MÊS DE REFERÊNCIA</label>
                  <input type="month" required value={newCharge.reference_month} onChange={e => setNewCharge(f => ({ ...f, reference_month: e.target.value }))} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none' }} />
                </div>
                
                <div style={{ backgroundColor: 'rgba(2,132,199,0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                   <Mail size={20} color="#0284C7" />
                   <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0 }}>Um e-mail de notificação será enviado ao psicólogo automaticamente após a geração.</p>
                </div>

                <button type="submit" disabled={generatingCharge} style={{ backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', marginTop: '1rem' }}>
                  {generatingCharge ? 'Gerando...' : 'Confirmar e Enviar'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Criação Psicólogo */}
        {showCreate && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#1E293B', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '600px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Novo Psicólogo</h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Preencha os dados para criar a conta</p>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nome Completo</label>
                  <input required placeholder="Ex: Dr. João Silva" value={newUser.name} onChange={e => setNewUser(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '0.875rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-mail</label>
                  <input type="email" required placeholder="joao@email.com" value={newUser.email} onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: '0.875rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Senha</label>
                  <input type="password" required placeholder="••••••••" value={newUser.password} onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))} style={{ width: '100%', padding: '0.875rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>CRP</label>
                  <input placeholder="06/123456" value={newUser.crp} onChange={e => setNewUser(f => ({ ...f, crp: e.target.value }))} style={{ width: '100%', padding: '0.875rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Especialidade</label>
                  <input placeholder="Ex: TCC" value={newUser.specialty} onChange={e => setNewUser(f => ({ ...f, specialty: e.target.value }))} style={{ width: '100%', padding: '0.875rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                  <button type="submit" disabled={creating} style={{ width: '100%', backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', fontFamily: 'inherit' }}>
                    {creating ? 'Criando Conta...' : 'Cadastrar Psicólogo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {editingUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#1E293B', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '700px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#0284C720', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                    {editingUser.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Editar Profissional</h3>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{editingUser.name}</p>
                  </div>
                </div>
                <button onClick={() => setEditingUser(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', borderBottom: '1px solid rgba(2,132,199,0.2)', paddingBottom: '0.5rem' }}>Informações Cadastrais</h4>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>NOME</label>
                    <input value={editFormData.name} onChange={e => setEditFormData(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>E-MAIL</label>
                    <input value={editFormData.email} onChange={e => setEditFormData(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>CRP</label>
                    <input value={editFormData.crp} onChange={e => setEditFormData(f => ({ ...f, crp: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>ESPECIALIDADE</label>
                    <input value={editFormData.specialty} onChange={e => setEditFormData(f => ({ ...f, specialty: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', borderBottom: '1px solid rgba(245,158,11,0.2)', paddingBottom: '0.5rem' }}>Configurações Financeiras</h4>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>STATUS DA ASSINATURA</label>
                    <select value={editFormData.subscription_status} onChange={e => setEditFormData(f => ({ ...f, subscription_status: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', cursor: 'pointer' }}>
                      {['Trial', 'Ativo', 'Inadimplente', 'Cancelado'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>VALOR DO PLANO (R$)</label>
                    <input type="number" step="0.01" value={editFormData.plan_price} onChange={e => setEditFormData(f => ({ ...f, plan_price: parseFloat(e.target.value) }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>PRÓXIMA COBRANÇA</label>
                    <input type="date" value={editFormData.next_billing_date} onChange={e => setEditFormData(f => ({ ...f, next_billing_date: e.target.value }))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #334155', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Cancelar</button>
                  <button type="submit" disabled={updating} style={{ flex: 2, backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', fontFamily: 'inherit' }}>
                    {updating ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação Bloqueio */}
        {confirmAction && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '20px', maxWidth: '420px', width: '90%', border: '1px solid #334155', textAlign: 'center' }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: confirmAction.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: confirmAction.isActive ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                 {confirmAction.isActive ? <XCircle size={32} /> : <CheckCircle size={32} />}
               </div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Confirmar Ação</h3>
               <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: '1.6' }}>{confirmAction.msg}</p>
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <button onClick={() => setConfirmAction(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #334155', color: '#94A3B8', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                 <button onClick={confirmBlock} style={{ flex: 1, backgroundColor: confirmAction.isActive ? '#EF4444' : '#10B981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Confirmar</button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
