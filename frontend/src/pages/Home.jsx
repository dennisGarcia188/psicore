import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Plus, CalendarPlus, ChevronRight, Calendar, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../api';

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
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'week'

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;
      let appts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        appts = [...appts, ...aRes.data.map(a => ({ ...a, patient_name: p.name }))];
      }
      const confirmed = appts.filter(a => a.status === 'Confirmada').length;
      const pending   = appts.filter(a => a.status === 'Aguardando Confirmação').length;
      setStats({ confirmed, pending, totalPatients: pts.length });
      setPatients(pts);
      setAllAppts(appts.sort((a, b) => new Date(a.date_time) - new Date(b.date_time)));
    } catch (err) {
      console.error('Erro ao buscar dados', err);
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

  const AppointmentRow = ({ appt, isLast }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.875rem 1.5rem', borderBottom: isLast ? 'none' : '1px solid var(--color-border)', gap: '1rem' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: STATUS_COLOR[appt.status] || 'var(--color-text-muted)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>{appt.patient_name}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDateLabel(appt.date_time)}</p>
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '99px', backgroundColor: `${STATUS_COLOR[appt.status]}20`, color: STATUS_COLOR[appt.status], whiteSpace: 'nowrap' }}>
        {appt.status}
      </span>
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
      alert('Erro ao enviar e-mail. Verifique se o paciente possui e-mail cadastrado e se o servidor está online.');
    } finally {
      setSendingEmailId(null);
    }
  };

  const todayStr = format(new Date(), 'MM-dd');
  const birthdaysToday = patients.filter(p => p.birth_date && p.birth_date.endsWith(todayStr));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Visão Geral</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/patients" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Novo Paciente
          </Link>
          <Link to="/dashboard/calendar" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarPlus size={16} /> Nova Consulta
          </Link>
        </div>
      </div>

      {/* Banner Aniversariantes */}
      {birthdaysToday.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {birthdaysToday.map(p => (
            <div key={p.id} style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🎉</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#065F46', margin: 0 }}>Hoje é aniversário de {p.name}!</h3>
                  <p style={{ color: '#047857', fontSize: '0.875rem', margin: '0.25rem 0 0', fontWeight: 500 }}>Aproveite para desejar muitas felicitações.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => sendBirthdayEmail(p.id)} 
                  disabled={sendingEmailId === p.id}
                  className="btn btn-secondary" 
                  style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: sendingEmailId === p.id ? 0.7 : 1 }}
                >
                  <Mail size={16} /> {sendingEmailId === p.id ? 'Enviando...' : 'Enviar E-mail'}
                </button>
                {p.phone && (
                  <a href={`https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá ${p.name.split(' ')[0]}, feliz aniversário! 🎉 A equipe da PsiCore te deseja um dia maravilhoso!`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { title: 'Consultas Confirmadas', value: stats.confirmed, icon: CheckCircle, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
          { title: 'Aguardando Confirmação', value: stats.pending, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' },
          { title: 'Total de Pacientes', value: stats.totalPatients, icon: Users, color: 'var(--color-primary)', bg: 'rgba(2,132,199,0.1)' },
        ].map(({ title, value, icon: Icon, color, bg }) => (
          <div key={title} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon color={color} size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Consultas com toggle Hoje / Semana */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Consultas</h3>
            {/* Toggle Hoje / Semana */}
            <div style={{ display: 'flex', backgroundColor: 'var(--color-background)', borderRadius: '99px', padding: '3px', gap: '2px' }}>
              {[{ key: 'today', label: 'Hoje' }, { key: 'week', label: 'Semana' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  style={{
                    padding: '0.3rem 0.875rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                    backgroundColor: viewMode === key ? 'var(--color-primary)' : 'transparent',
                    color: viewMode === key ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Link to="/dashboard/calendar" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ver agenda <ChevronRight size={16} />
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Nenhuma consulta {viewMode === 'today' ? 'hoje' : 'esta semana'}.</p>
            <Link to="/dashboard/calendar" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              <Plus size={16} /> Agendar Consulta
            </Link>
          </div>
        ) : viewMode === 'today' ? (
          <div>
            {filtered.map((appt, i) => (
              <AppointmentRow key={appt.id} appt={appt} isLast={i === filtered.length - 1} />
            ))}
          </div>
        ) : (
          <div>
            {Object.entries(dayGroups).map(([dayKey, appts]) => (
              <div key={dayKey}>
                <div style={{ padding: '0.625rem 1.5rem', backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'capitalize', letterSpacing: '0.03em' }}>
                    {formatDayHeader(dayKey)}
                  </span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', backgroundColor: 'rgba(2,132,199,0.1)', color: 'var(--color-primary)', padding: '0.1rem 0.5rem', borderRadius: '99px', fontWeight: 700 }}>
                    {appts.length} consulta{appts.length > 1 ? 's' : ''}
                  </span>
                </div>
                {appts.map((appt, i) => (
                  <AppointmentRow key={appt.id} appt={appt} isLast={i === appts.length - 1} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
