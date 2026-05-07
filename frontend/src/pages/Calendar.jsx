import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { format as fmt } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, CalendarClock, CheckCircle, Trash2, Save, FileText, Settings2, CalendarPlus, Users } from 'lucide-react';
import api from '../api';
import DateTimePicker from '../components/DateTimePicker';

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

  // Modal de detalhes do agendamento
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [editDate, setEditDate] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    fetchAllAppointments();
    fetchPatients();
  }, []);

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
    setActiveTab('dados');
    setEditDate(new Date(event.start));
    setEditStatus(event.resource?.status || 'Confirmada');
    setEditNotes(event.resource?.notes || '');
  }, []);

  const handleCloseModal = () => setSelectedEvent(null);

  const handleSave = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      await api.patch(`/appointments/${selectedEvent.id}`, {
        date_time: editDate ? new Date(editDate).toISOString() : undefined,
        status: editStatus,
        notes: editNotes,
      });
      await fetchAllAppointments();
      handleCloseModal();
    } catch (err) {
      alert('Erro ao salvar. Tente novamente.');
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
    } finally {
      setDeleting(false);
    }
  };

  // ── Novo Agendamento ────────────────────────────────────────────────────────
  const openNewModal = () => {
    setNewForm({ patient_id: '', date_time: null, fee: '', status: 'Aguardando Confirmação' });
    setNewError('');
    setShowNewModal(true);
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

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Minha Agenda</h2>
        <button onClick={openNewModal} className="btn btn-primary">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
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

      {/* ── Modal: Detalhes do Agendamento ─────────────────────────────────── */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Detalhes da Consulta</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Edite ou cancele o agendamento</p>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {selectedEvent.resource?.patient_name?.[0] || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>{selectedEvent.resource?.patient_name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {fmt(selectedEvent.start, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', backgroundColor: `${STATUS_COLORS[selectedEvent.resource?.status]}20`, color: STATUS_COLORS[selectedEvent.resource?.status] }}>
                {selectedEvent.resource?.status}
              </span>
            </div>

            {/* Abas */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              {[{ id: 'dados', label: 'Dados', icon: Settings2 }, { id: 'notas', label: 'Anotações da Sessão', icon: FileText }].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: activeTab === id ? 700 : 500, color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === id ? '2px solid var(--color-primary)' : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.15s' }}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>

            {activeTab === 'dados' && (
              <>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CalendarClock size={15} color="var(--color-primary)" /> Nova Data e Hora
                  </label>
                  <DateTimePicker value={editDate} onChange={(date) => setEditDate(date)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="var(--color-primary)" /> Status
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {STATUS_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => setEditStatus(s)} style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: editStatus === s ? STATUS_COLORS[s] : 'var(--color-border)', backgroundColor: editStatus === s ? `${STATUS_COLORS[s]}15` : 'transparent', color: editStatus === s ? STATUS_COLORS[s] : 'var(--color-text-muted)', fontWeight: editStatus === s ? 700 : 500, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notas' && (
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  📝 Anotações desta sessão
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Descreva as observações clínicas desta sessão..."
                  style={{ width: '100%', minHeight: '180px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={handleDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', backgroundColor: 'transparent', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}>
                <Trash2 size={16} /> {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button onClick={handleCloseModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
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
