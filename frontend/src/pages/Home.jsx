import { useState, useEffect } from 'react';
import { Users, User, CheckCircle, Clock, Plus, CalendarPlus, ChevronRight, Calendar, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../api';
import AppointmentModal from '../components/AppointmentModal';
import LoadingScreen from '../components/LoadingScreen';

const STATUS_COLOR = {
  'Confirmada': 'var(--color-success)',
  'Aguardando Confirmação': 'var(--color-warning)',
  'Cancelada': 'var(--color-error)',
  'Realizada': 'var(--color-text-muted)',
};

export default function Home() {
  const [stats, setStats] = useState({ confirmed: 0, pending: 0, totalPatients: 0 });
  const [allAppts, setAllAppts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'week'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Optimized: Fetch all data in parallel
      const [patientsRes, appointmentsRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/appointments/')
      ]);
      
      const pts = patientsRes.data;
      const appts = appointmentsRes.data;

      const confirmed = appts.filter(a => a.status === 'Confirmada').length;
      const pending   = appts.filter(a => a.status === 'Aguardando Confirmação').length;
      
      setStats({ confirmed, pending, totalPatients: pts.length });
      setPatients(pts);
      setAllAppts(appts.sort((a, b) => new Date(a.date_time) - new Date(b.date_time)));
    } catch (err) {
      console.error('Erro ao buscar dados', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtros por modo ────────────────────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000 - 1);
  const weekStart  = startOfWeek(now, { locale: ptBR });
  const weekEnd    = endOfWeek(now, { locale: ptBR });

  const filtered = allAppts.filter(a => {
    const d = new Date(a.date_time);
    if (viewMode === 'today') return d >= todayStart && d <= todayEnd;
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  // ── Agrupamento por dia (para modo semana) ─────────────────────────────────
  const groupByDay = (appts) => {
    const groups = {};
    appts.forEach(a => {
      const key = format(new Date(a.date_time), 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };

  const dayGroups = viewMode === 'week' ? groupByDay(filtered) : null;

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date))    return `Hoje, ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`;
    return format(date, "EEE dd/MM, HH:mm", { locale: ptBR });
  };

  const formatDayHeader = (dateKey) => {
    const d = new Date(dateKey + 'T12:00:00');
    if (isToday(d)) return `Hoje — ${format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })}`;
    if (isTomorrow(d)) return `Amanhã — ${format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })}`;
    return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const AppointmentCard = ({ appt }) => (
    <div 
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        padding: '1.5rem', 
        borderRadius: 'var(--radius-xl)', 
        boxShadow: 'var(--shadow-sm)', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
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
      onClick={() => setSelectedAppointment(appt)}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: STATUS_COLOR[appt.status] || 'var(--color-text-muted)' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={22} color="var(--color-primary)" />
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '99px', backgroundColor: `${STATUS_COLOR[appt.status]}15`, color: STATUS_COLOR[appt.status], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {appt.status}
        </span>
      </div>

      <div>
        <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>{appt.patient_name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          <Clock size={14} />
          <span>{formatDateLabel(appt.date_time)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dotted var(--color-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Valor</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>R$ {appt.fee?.toFixed(2)}</span>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(2,132,199,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );

  const [sendingEmailId, setSendingEmailId] = useState(null);

  const sendBirthdayEmail = async (patientId) => {
    setSendingEmailId(patientId);
    try {
      await api.post(`/patients/${patientId}/birthday-email`, {});
      alert('E-mail de felicitações enviado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar e-mail.');
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleUpdateAppointment = async (updatedData) => {
    try {
      await api.put(`/appointments/${updatedData.id}`, updatedData);
      setSelectedAppointment(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar consulta.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      setSelectedAppointment(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir consulta.');
    }
  };

  if (loading) return <LoadingScreen />;

  const todayStr = format(new Date(), 'MM-dd');
  const birthdaysToday = patients.filter(p => p.birth_date && p.birth_date.endsWith(todayStr));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700, textAlign: isMobile ? 'center' : 'left' }}>Visão Geral</h2>
        <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
          <Link to="/dashboard/patients" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: isMobile ? 1 : 'none', padding: isMobile ? '0.625rem 0.5rem' : '0.625rem 1.25rem', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            <Plus size={16} /> Novo Paciente
          </Link>
          <Link to="/dashboard/calendar" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: isMobile ? 1 : 'none', padding: isMobile ? '0.625rem 0.5rem' : '0.625rem 1.25rem', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            <CalendarPlus size={16} /> Nova Consulta
          </Link>
        </div>
      </div>

      {/* Banner Aniversariantes */}
      {birthdaysToday.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {birthdaysToday.map(p => (
            <div key={p.id} style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: isMobile ? '2rem' : '2.5rem' }}>🎉</span>
                <div>
                  <h3 style={{ fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: 700, color: '#065F46', margin: 0 }}>Hoje é aniversário de {p.name}!</h3>
                  <p style={{ color: '#047857', fontSize: '0.875rem', margin: '0.25rem 0 0', fontWeight: 500 }}>Aproveite para desejar muitas felicitações.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
                <button 
                  onClick={() => sendBirthdayEmail(p.id)} 
                  disabled={sendingEmailId === p.id}
                  className="btn btn-secondary" 
                  style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: sendingEmailId === p.id ? 0.7 : 1, flex: isMobile ? 1 : 'none', padding: isMobile ? '0.5rem' : '0.625rem 1.25rem', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                >
                  <Mail size={16} /> {sendingEmailId === p.id ? 'Enviando...' : 'E-mail'}
                </button>
                {p.phone && (
                  <a href={`https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá ${p.name.split(' ')[0]}, feliz aniversário! 🎉 A equipe da PsiCore te deseja um dia maravilhoso!`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flex: isMobile ? 1 : 'none', padding: isMobile ? '0.5rem' : '0.625rem 1.25rem', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: isMobile ? '0.75rem' : '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { title: isMobile ? 'Confirmadas' : 'Consultas Confirmadas', value: stats.confirmed, icon: CheckCircle, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
          { title: isMobile ? 'Pendentes' : 'Aguardando', value: stats.pending, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' },
          { title: isMobile ? 'Pacientes' : 'Total de Pacientes', value: stats.totalPatients, icon: Users, color: 'var(--color-primary)', bg: 'rgba(2,132,199,0.1)', span: isMobile ? 'span 2' : 'span 1' },
        ].map(({ title, value, icon: Icon, color, bg, span }) => (
          <div key={title} style={{ gridColumn: span || 'auto', backgroundColor: 'var(--color-surface)', padding: isMobile ? '1rem' : '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ width: isMobile ? '40px' : '56px', height: isMobile ? '40px' : '56px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon color={color} size={isMobile ? 20 : 28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '2rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Header da Seção de Consultas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700, fontSize: isMobile ? '1.15rem' : '1.25rem', margin: 0 }}>Próximas Consultas</h3>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-border)', borderRadius: '99px', padding: '3px', gap: '2px' }}>
            {[{ key: 'today', label: 'Hoje' }, { key: 'week', label: 'Semana' }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  padding: isMobile ? '0.3rem 0.8rem' : '0.4rem 1.25rem', borderRadius: '99px', border: 'none', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: viewMode === key ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: viewMode === key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <Link to="/dashboard/calendar" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', alignSelf: isMobile ? 'flex-end' : 'center' }}>
          Agenda completa <ChevronRight size={18} />
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <Calendar size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: 'var(--color-primary)' }} />
          <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Tudo limpo por aqui!</h4>
          <p>Nenhuma consulta {viewMode === 'today' ? 'hoje' : 'esta semana'}.</p>
          <Link to="/dashboard/calendar" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            <Plus size={16} /> Agendar Nova Consulta
          </Link>
        </div>
      ) : viewMode === 'today' ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(dayGroups).sort(([a], [b]) => a.localeCompare(b)).map(([dayKey, appts]) => (
            <div key={dayKey}>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {formatDayHeader(dayKey)}
                </h4>
                <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
                  {appts.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {appts.map(appt => (
                  <AppointmentCard key={appt.id} appt={appt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSave={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
}
