import { useState, useEffect } from 'react';
import { X, Trash2, Save, Settings2, FileText, CalendarClock, CheckCircle, DollarSign } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import CurrencyInput from 'react-currency-input-field';
import { format as fmt } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLORS = {
  'Confirmada': '#10B981',
  'Aguardando Confirmação': '#F59E0B',
  'Cancelada': '#EF4444',
  'Realizada': '#64748B',
};

const STATUS_OPTIONS = ['Confirmada', 'Aguardando Confirmação', 'Cancelada', 'Realizada'];

export default function AppointmentModal({ 
  appointment, 
  onClose, 
  onSave, 
  onDelete 
}) {
  const [editStatus, setEditStatus] = useState(appointment.status);
  const [editDate, setEditDate] = useState(new Date(appointment.date_time || appointment.start));
  const [editNotes, setEditNotes] = useState(appointment.notes || '');
  const [editFee, setEditFee] = useState(appointment.fee || appointment.resource?.fee || 0);
  const [editIsPaid, setEditIsPaid] = useState(appointment.is_paid || appointment.resource?.is_paid || false);
  const [activeTab, setActiveTab] = useState('dados');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fallback property access because Calendar uses 'resource' while Home uses direct properties
  const patientName = appointment.resource?.patient_name || appointment.patient_name;
  const currentStatus = appointment.resource?.status || appointment.status;
  const startTime = appointment.start || appointment.date_time;

  const handleSaveClick = async () => {
    setSaving(true);
    await onSave({
      id: appointment.id,
      status: editStatus,
      date_time: editDate.toISOString(),
      notes: editNotes,
      fee: parseFloat(editFee) || 0,
      is_paid: editIsPaid,
      patient_id: appointment.resource?.patient_id || appointment.patient_id
    });
    setSaving(false);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta consulta?")) {
      setDeleting(true);
      await onDelete(appointment.id);
      setDeleting(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Detalhes da Consulta</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Edite ou cancele o agendamento</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
              {patientName?.[0] || '?'}
            </div>
            <div>
              <p style={{ fontWeight: 700 }}>{patientName}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {fmt(new Date(startTime), isMobile ? "dd/MM/yy 'às' HH:mm" : "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          <span style={{ marginLeft: isMobile ? 0 : 'auto', marginTop: isMobile ? '0.5rem' : 0, fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', backgroundColor: `${STATUS_COLORS[editStatus]}20`, color: STATUS_COLORS[editStatus] }}>
            {editStatus}
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
              <DateTimePicker value={editDate} onChange={setEditDate} />
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

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={15} color="var(--color-primary)" /> Valor (R$)
                </label>
                <CurrencyInput
                  id="fee"
                  name="fee"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  className="input-control"
                  value={editFee}
                  onValueChange={(value) => setEditFee(value)}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: isMobile ? 0 : '1.25rem' }}>
                  <input
                    type="checkbox"
                    checked={editIsPaid}
                    onChange={e => setEditIsPaid(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: editIsPaid ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {editIsPaid ? 'Pagamento Realizado' : 'Aguardando Pagamento'}
                  </span>
                </label>
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

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
            <button onClick={handleDeleteClick} disabled={deleting} style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', backgroundColor: 'transparent', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}>
              <Trash2 size={16} /> {deleting ? '...' : 'Excluir'}
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          </div>
          <button onClick={handleSaveClick} disabled={saving} className="btn btn-primary" style={{ flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : 'auto' }}>
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
