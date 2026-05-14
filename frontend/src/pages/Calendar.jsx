import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, CalendarClock, CalendarPlus, Users } from 'lucide-react';
import api from '../api';
import DateTimePicker from '../components/DateTimePicker';
import AppointmentModal from '../components/AppointmentModal';
import LoadingScreen from '../components/LoadingScreen';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

const STATUS_COLORS = {
  'Confirmada': '#0284C7',
  'Aguardando Confirmação': '#F59E0B',
  'Realizada': '#10B981',
  'Cancelada': '#EF4444',
};

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentView, setCurrentView] = useState(window.innerWidth <= 768 ? Views.DAY : Views.WEEK);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Auto-open new appointment modal if ?new=1 is in URL
    if (searchParams.get('new') === '1') {
      openNewModal(new Date());
      setSearchParams({});
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && currentView === Views.WEEK) {
        setCurrentView(Views.DAY);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentView]);

  // Modal de detalhes do agendamento
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Modal de NOVO agendamento
  const [showNewModal, setShowNewModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newForm, setNewForm] = useState({
    patient_id: '',
    date_time: null,
    fee: '',
    status: 'Aguardando Confirmação',
  });
  const [submitting, setSubmitting] = useState(false);
  const [newError, setNewError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllAppointments(),
        fetchPatients()
      ]);
    } catch (err) {
      console.error('Erro ao buscar dados da agenda', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes', err);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      // Optimized fetching
      const res = await api.get('/appointments/');
      const mapped = res.data.map(a => {
        const startDate = new Date(a.date_time);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        return {
          id: a.id,
          title: a.patient_name,
          start: startDate,
          end: endDate,
          resource: { ...a },
        };
      });
      setEvents(mapped);
    } catch (err) {
      console.error('Erro ao buscar agenda', err);
    }
  };

  const handleNavigate = useCallback((newDate) => setCurrentDate(newDate), []);
  const handleViewChange = useCallback((newView) => setCurrentView(newView), []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => setSelectedEvent(null);

  const handleSaveModal = async (updatedData) => {
    try {
      await api.put(`/appointments/${updatedData.id}`, updatedData);
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar agendamento');
    }
  };

  const handleDeleteModal = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir agendamento');
    }
  };

  // ── Novo Agendamento ────────────────────────────────────────────────────────
  const openNewModal = (selectedDate = null) => {
    setNewForm({ 
      patient_id: '', 
      date_time: selectedDate || null, 
      fee: '', 
      status: 'Aguardando Confirmação' 
    });
    setNewError('');
    setShowNewModal(true);
  };

  const handleSelectSlot = ({ start }) => {
    openNewModal(start);
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    setNewError('');
    if (!newForm.patient_id) { setNewError('Selecione um paciente.'); return; }
    if (!newForm.date_time)  { setNewError('Selecione a data e horário.'); return; }

    setSubmitting(true);
    try {
      await api.post('/appointments/', {
        patient_id: parseInt(newForm.patient_id),
        date_time: new Date(newForm.date_time).toISOString(),
        fee: parseFloat(newForm.fee) || 0,
        status: newForm.status,
      });
      setShowNewModal(false);
      await fetchAllAppointments();
    } catch (err) {
      setNewError(err.response?.data?.detail || 'Erro ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Estilos do evento ───────────────────────────────────────────────────────
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
    allDay: 'Dia Todo', previous: '← Anterior', next: 'Próximo →',
    today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia',
    agenda: 'Agenda', date: 'Data', time: 'Hora', event: 'Consulta',
    noEventsInRange: 'Nenhum agendamento neste período.',
    showMore: total => `+ ${total} mais`,
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in" style={{ height: isMobile ? '700px' : 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700, textAlign: isMobile ? 'center' : 'left' }}>Minha Agenda</h2>
        <button onClick={openNewModal} className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
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
          onSelectSlot={handleSelectSlot}
          selectable
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          messages={messages}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%', fontFamily: 'var(--font-family)' }}
          popup
        />
      </div>

      {/* ── Modal: Novo Agendamento ─────────────────────────────────────────── */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarPlus size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Novo Agendamento</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Preencha os dados da consulta</p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {newError && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {newError}
              </div>
            )}

            <form onSubmit={handleSubmitNew}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} color="var(--color-primary)" /> Paciente *
                </label>
                <select
                  className="input-control"
                  value={newForm.patient_id}
                  onChange={e => setNewForm({ ...newForm, patient_id: e.target.value })}
                >
                  <option value="">— Selecione o Paciente —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CalendarClock size={14} color="var(--color-primary)" /> Data e Hora *
                </label>
                <DateTimePicker
                  value={newForm.date_time}
                  onChange={(date) => setNewForm({ ...newForm, date_time: date })}
                  placeholder="Selecionar data e horário"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Status</label>
                  <select
                    className="input-control"
                    value={newForm.status}
                    onChange={e => setNewForm({ ...newForm, status: e.target.value })}
                  >
                    <option value="Aguardando Confirmação">Aguardando Confirmação</option>
                    <option value="Confirmada">Confirmada</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Valor (R$)</label>
                  <input
                    type="number" step="0.01" min="0"
                    className="input-control"
                    placeholder="0,00"
                    value={newForm.fee}
                    onChange={e => setNewForm({ ...newForm, fee: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  <CalendarPlus size={16} />
                  {submitting ? 'Salvando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <AppointmentModal
          appointment={selectedEvent}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
          onDelete={handleDeleteModal}
        />
      )}
    </div>
  );
}
