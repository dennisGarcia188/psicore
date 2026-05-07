import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { format as fmt } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Plus, X, User, Clock, CheckCircle, XCircle, CalendarClock, Trash2, Save } from 'lucide-react';
import api from '../api';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

const STATUS_OPTIONS = ['Confirmada', 'Aguardando Confirmação', 'Realizada', 'Cancelada'];

const STATUS_COLORS = {
  'Confirmada': '#0284C7',
  'Aguardando Confirmação': '#F59E0B',
  'Realizada': '#10B981',
  'Cancelada': '#EF4444',
};

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchAllAppointments(); }, []);

  const fetchAllAppointments = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;

      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        const mapped = aRes.data.map(a => {
          const startDate = new Date(a.date_time);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          return {
            id: a.id,
            title: p.name,
            start: startDate,
            end: endDate,
            resource: { ...a, patient_name: p.name },
          };
        });
        allAppts = [...allAppts, ...mapped];
      }
      setEvents(allAppts);
    } catch (err) {
      console.error('Erro ao buscar agenda', err);
    }
  };

  const handleNavigate = useCallback((newDate) => setCurrentDate(newDate), []);
  const handleViewChange = useCallback((newView) => setCurrentView(newView), []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    // Formatar data/hora no formato aceito pelo input datetime-local
    const d = new Date(event.start);
    const pad = n => String(n).padStart(2, '0');
    const localDT = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditDate(localDT);
    setEditStatus(event.resource?.status || 'Confirmada');
  }, []);

  const handleCloseModal = () => setSelectedEvent(null);

  const handleSave = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      await api.patch(`/appointments/${selectedEvent.id}`, {
        date_time: new Date(editDate).toISOString(),
        status: editStatus,
      });
      await fetchAllAppointments();
      handleCloseModal();
    } catch (err) {
      alert('Erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Excluir a consulta de ${selectedEvent.resource?.patient_name}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/appointments/${selectedEvent.id}`);
      await fetchAllAppointments();
      handleCloseModal();
    } catch (err) {
      alert('Erro ao excluir.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: STATUS_COLORS[event.resource?.status] || '#0284C7',
      borderRadius: '6px',
      border: 'none',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 600,
      padding: '2px 6px',
      cursor: 'pointer',
    },
  });

  const messages = {
    allDay: 'Dia Todo',
    previous: '← Anterior',
    next: 'Próximo →',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Consulta',
    noEventsInRange: 'Nenhum agendamento neste período.',
    showMore: total => `+ ${total} mais`,
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Minha Agenda</h2>
        <button onClick={() => navigate('/dashboard/appointments/new')} className="btn btn-primary">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', minHeight: 0 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          messages={messages}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%', fontFamily: 'var(--font-family)' }}
          popup
        />
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            {/* Header do modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Detalhes da Consulta</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Edite ou cancele o agendamento</p>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }}>
                <X size={22} />
              </button>
            </div>

            {/* Info do paciente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {selectedEvent.resource?.patient_name?.[0] || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{selectedEvent.resource?.patient_name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {fmt(selectedEvent.start, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', backgroundColor: `${STATUS_COLORS[selectedEvent.resource?.status]}20`, color: STATUS_COLORS[selectedEvent.resource?.status] }}>
                {selectedEvent.resource?.status}
              </span>
            </div>

            {/* Editar Data/Hora */}
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CalendarClock size={15} color="var(--color-primary)" /> Nova Data e Hora
              </label>
              <input
                type="datetime-local"
                className="input-control"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
              />
            </div>

            {/* Alterar Status */}
            <div className="input-group" style={{ marginBottom: '0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={15} color="var(--color-primary)" /> Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEditStatus(s)}
                    style={{
                      padding: '0.625rem', borderRadius: 'var(--radius-md)', border: `2px solid`,
                      borderColor: editStatus === s ? STATUS_COLORS[s] : 'var(--color-border)',
                      backgroundColor: editStatus === s ? `${STATUS_COLORS[s]}15` : 'transparent',
                      color: editStatus === s ? STATUS_COLORS[s] : 'var(--color-text-muted)',
                      fontWeight: editStatus === s ? 700 : 500,
                      cursor: 'pointer', fontSize: '0.8rem',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', backgroundColor: 'transparent', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}
              >
                <Trash2 size={16} /> {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button onClick={handleCloseModal} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
