import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;

      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        const apptsWithPatient = aRes.data.map(a => {
          const startDate = new Date(a.date_time);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1 hr duration
          return {
            id: a.id,
            title: `${p.name} - ${a.status}`,
            start: startDate,
            end: endDate,
            resource: a
          };
        });
        allAppts = [...allAppts, ...apptsWithPatient];
      }
      setEvents(allAppts);
    } catch (err) {
      console.error('Erro ao buscar dados do calendário', err);
    }
  };

  const messages = {
    allDay: 'Dia Todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há agendamentos neste período.',
    showMore: total => `+ mais ${total}`
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Minha Agenda</h2>
        <button onClick={() => navigate('/dashboard/appointments/new')} className="btn btn-primary">
          <Plus size={20} /> Novo Agendamento
        </button>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          messages={messages}
          culture="pt-BR"
          style={{ height: '100%', fontFamily: 'var(--font-family)' }}
        />
      </div>
    </div>
  );
}
