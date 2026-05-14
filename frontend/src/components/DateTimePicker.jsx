import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS = ['D','S','T','Q','Q','S','S'];
const HOURS = Array.from({length: 13}, (_, i) => i + 7);
const MINUTES = ['00','15','30','45'];

export default function DateTimePicker({ value, onChange, placeholder = 'Selecionar data e hora' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({});
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [selectedHour, setSelectedHour] = useState(value ? new Date(value).getHours() : 9);
  const [selectedMinute, setSelectedMinute] = useState(
    value ? String(new Date(value).getMinutes()).padStart(2, '0') : '00'
  );

  const inputRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const close = (e) => {
      if (inputRef.current && !inputRef.current.closest('[data-dtpicker]')?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Emitir valor sempre que mudar
  useEffect(() => {
    if (selectedDate && onChange) {
      const d = new Date(selectedDate);
      d.setHours(selectedHour, parseInt(selectedMinute), 0, 0);
      onChange(d);
    }
  }, [selectedDate, selectedHour, selectedMinute]);

  const handleOpen = () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const isSelected = (d) =>
    selectedDate &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  const formatDisplay = () => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    d.setHours(selectedHour, parseInt(selectedMinute));
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div data-dtpicker="true" style={{ position: 'relative', width: '100%' }}>
      <div
        ref={inputRef}
        onClick={handleOpen}
        className="input-control"
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          userSelect: 'none',
          color: selectedDate ? 'var(--color-text-main)' : 'var(--color-text-muted)',
        }}
      >
        <Calendar size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span>{formatDisplay() || placeholder}</span>
      </div>

      {open && (
        <div
          data-dtpicker="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            maxHeight: '420px',
            overflowY: 'auto',
            zIndex: 100000,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header mês/ano */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 0.875rem',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 1,
          }}>
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '2px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
              {MONTHS_FULL[month]} {year}
            </span>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '2px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Grade de dias */}
          <div style={{ padding: '0.5rem 0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '2px 0' }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  style={{
                    aspectRatio: '1',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s',
                    backgroundColor: isSelected(day)
                      ? 'var(--color-primary)'
                      : isToday(day)
                      ? 'rgba(2,132,199,0.1)'
                      : 'transparent',
                    color: isSelected(day)
                      ? 'white'
                      : isToday(day)
                      ? 'var(--color-primary)'
                      : 'var(--color-text-main)',
                    fontWeight: isSelected(day) || isToday(day) ? 700 : 400,
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Horário */}
          <div style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <Clock size={12} color="var(--color-primary)" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Horário
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <select
                value={selectedHour}
                onChange={e => setSelectedHour(parseInt(e.target.value))}
                className="input-control"
                style={{ flex: 1, padding: '0.4rem 0.25rem', fontSize: '0.875rem', textAlign: 'center' }}
              >
                {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}h</option>)}
              </select>
              <span style={{ fontWeight: 800, color: 'var(--color-text-muted)' }}>:</span>
              <select
                value={selectedMinute}
                onChange={e => setSelectedMinute(e.target.value)}
                className="input-control"
                style={{ flex: 1, padding: '0.4rem 0.25rem', fontSize: '0.875rem', textAlign: 'center' }}
              >
                {MINUTES.map(m => <option key={m} value={m}>{m}min</option>)}
              </select>
            </div>
          </div>

          {/* Confirmar */}
          <div style={{ padding: '0.5rem 0.75rem 0.75rem' }}>
            <button
              onClick={() => setOpen(false)}
              disabled={!selectedDate}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.875rem' }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
