import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Plus, CalendarPlus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../api';

export default function Home() {
  const [stats, setStats] = useState({ confirmed: 0, pending: 0, totalPatients: 0 });
  const [upcomingAppts, setUpcomingAppts] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;

      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        allAppts = [...allAppts, ...aRes.data.map(a => ({ ...a, patient_name: p.name }))];
      }

      const confirmed = allAppts.filter(a => a.status === 'Confirmada').length;
      const pending = allAppts.filter(a => a.status === 'Aguardando Confirmação').length;

      // Próximas consultas (ordenadas por data)
      const upcoming = allAppts
        .filter(a => new Date(a.date_time) >= new Date())
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
        .slice(0, 5);

      setStats({ confirmed, pending, totalPatients: pts.length });
      setUpcomingAppts(upcoming);
    } catch (err) {
      console.error('Erro ao buscar stats', err);
    }
  };

  const formatDateLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Hoje, ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`;
    return format(date, "dd 'de' MMM, HH:mm", { locale: ptBR });
  };

  const statusColor = {
    'Confirmada': 'var(--color-success)',
    'Aguardando Confirmação': 'var(--color-warning)',
    'Cancelada': 'var(--color-error)',
    'Realizada': 'var(--color-text-muted)',
  };

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

      {/* Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { title: 'Consultas Confirmadas', value: stats.confirmed, icon: CheckCircle, color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)' },
          { title: 'Aguardando Confirmação', value: stats.pending, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
          { title: 'Total de Pacientes', value: stats.totalPatients, icon: Users, color: 'var(--color-primary)', bg: 'rgba(2, 132, 199, 0.1)' },
        ].map(({ title, value, icon: Icon, color, bg }) => (
          <div key={title} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon color={color} size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Próximas Consultas */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Próximas Consultas</h3>
          <Link to="/dashboard/calendar" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ver agenda <ChevronRight size={16} />
          </Link>
        </div>

        {upcomingAppts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <CalendarPlus size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>Nenhuma consulta agendada ainda.</p>
            <Link to="/dashboard/calendar" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              <Plus size={16} /> Agendar Consulta
            </Link>
          </div>
        ) : (
          <div>
            {upcomingAppts.map((appt, i) => (
              <div key={appt.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < upcomingAppts.length - 1 ? '1px solid var(--color-border)' : 'none', gap: '1rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColor[appt.status] || 'var(--color-text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{appt.patient_name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{formatDateLabel(appt.date_time)}</p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '99px', backgroundColor: `${statusColor[appt.status]}20`, color: statusColor[appt.status] }}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
