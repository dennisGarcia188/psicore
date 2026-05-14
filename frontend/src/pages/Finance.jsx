import { useState, useEffect } from 'react';
import {
  DollarSign, CheckCircle, Clock, X, ChevronRight,
  TrendingUp, AlertCircle, Calendar, User, CreditCard
} from 'lucide-react';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';

const STATUS_APPT = {
  'Confirmada':           { color: '#0284C7', bg: 'rgba(2,132,199,0.08)' },
  'Aguardando Confirmação': { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  'Realizada':            { color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  'Cancelada':            { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
};

export default function Finance() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading]           = useState(true);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);

  // Modal de lista (Total / Recebido / Pendente)
  const [listModal, setListModal]       = useState(null); // null | 'total' | 'paid' | 'pending'

  // Modal de detalhe de um pagamento
  const [detailAppt, setDetailAppt]     = useState(null);

  useEffect(() => {
    fetchFinances();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const response  = await api.get('/appointments/');
      const allAppts  = response.data;
      let total = 0, paid = 0, pending = 0;
      allAppts.forEach(a => {
        const fee = a.fee || 0;
        total   += fee;
        if (a.is_paid) paid    += fee;
        else           pending += fee;
      });
      setStats({ total, paid, pending });
      setAppointments(allAppts);
    } catch (err) {
      console.error('Erro ao buscar finanças', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePayment = async (appt) => {
    try {
      await api.put(`/appointments/${appt.id}`, { ...appt, is_paid: !appt.is_paid });
      // Atualiza localmente sem refetch completo
      setAppointments(prev =>
        prev.map(a => a.id === appt.id ? { ...a, is_paid: !a.is_paid } : a)
      );
      // Recalcula stats
      setStats(prev => {
        const fee = appt.fee || 0;
        if (appt.is_paid) {
          return { ...prev, paid: prev.paid - fee, pending: prev.pending + fee };
        } else {
          return { ...prev, paid: prev.paid + fee, pending: prev.pending - fee };
        }
      });
      // Atualiza o detalhe aberto se for o mesmo
      if (detailAppt?.id === appt.id) {
        setDetailAppt(prev => ({ ...prev, is_paid: !prev.is_paid }));
      }
    } catch (err) {
      console.error('Erro ao atualizar pagamento', err);
    }
  };

  // ── Filtra por categoria ──────────────────────────────────────────────────
  const listItems = {
    total:   appointments,
    paid:    appointments.filter(a => a.is_paid),
    pending: appointments.filter(a => !a.is_paid),
  };

  const listMeta = {
    total:   { label: 'Faturamento Total',      color: 'var(--color-primary)', icon: TrendingUp,  value: stats.total },
    paid:    { label: 'Recebido (Pago)',         color: 'var(--color-success)', icon: CheckCircle, value: stats.paid },
    pending: { label: 'A Receber (Pendente)',    color: 'var(--color-warning)', icon: AlertCircle, value: stats.pending },
  };

  // ── Componente: Card de resumo ────────────────────────────────────────────
  const StatCard = ({ type, title, value, color, icon: Icon }) => (
    <div
      onClick={() => setListModal(type)}
      style={{
        backgroundColor: 'var(--color-surface)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Barra decorativa lateral */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: color, borderRadius: '4px 0 0 4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            {title}
          </p>
          <h3 style={{ fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 800, color }}>
            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        {listItems[type]?.length || 0} consulta(s) · clique para ver detalhes
      </p>
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: isMobile ? 'center' : 'flex-start' }}>
        <DollarSign size={isMobile ? 24 : 32} color="var(--color-primary)" />
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>Controle Financeiro</h2>
      </div>

      {/* ── Cards clicáveis ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard type="total"   title={isMobile ? 'Total'     : 'Faturamento Total'}   value={stats.total}   color="var(--color-primary)" icon={TrendingUp}  />
        <StatCard type="paid"    title={isMobile ? 'Pago'      : 'Recebido (Pago)'}     value={stats.paid}    color="var(--color-success)" icon={CheckCircle} />
        <StatCard type="pending" title={isMobile ? 'Pendente'  : 'A Receber (Pendente)'} value={stats.pending} color="var(--color-warning)" icon={AlertCircle} />
      </div>

      {/* ── Tabela completa ─────────────────────────────────────────────── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum registro encontrado.</td></tr>
            ) : (
              appointments.map(appt => (
                <tr
                  key={appt.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setDetailAppt(appt)}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(2,132,199,0.03)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td>{new Date(appt.date_time).toLocaleDateString('pt-BR')}</td>
                  <td style={{ fontWeight: 500 }}>{appt.patient_name}</td>
                  <td style={{ fontWeight: 700 }}>R$ {(appt.fee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`badge ${appt.is_paid ? 'badge-success' : 'badge-warning'}`}>
                      {appt.is_paid ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={e => { e.stopPropagation(); togglePayment(appt); }}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      Mudar para {appt.is_paid ? 'Pendente' : 'Pago'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Lista de pagamentos por categoria
      ══════════════════════════════════════════════════════════════════ */}
      {listModal && (
        <div className="modal-overlay" onClick={() => setListModal(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${listMeta[listModal].color}15` }}>
                  {(() => { const Icon = listMeta[listModal].icon; return <Icon size={22} color={listMeta[listModal].color} />; })()}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text-main)' }}>
                    {listMeta[listModal].label}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {listItems[listModal].length} consulta(s) · R$ {listMeta[listModal].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <button onClick={() => setListModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Lista */}
            {listItems[listModal].length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <DollarSign size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p>Nenhum registro nesta categoria.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {listItems[listModal]
                  .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
                  .map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => { setListModal(null); setDetailAppt(appt); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: '14px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = listMeta[listModal].color; e.currentTarget.style.backgroundColor = `${listMeta[listModal].color}08`; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                    >
                      {/* Avatar */}
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: listMeta[listModal].color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                        {appt.patient_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.patient_name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {new Date(appt.date_time).toLocaleDateString('pt-BR')}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '99px', backgroundColor: appt.is_paid ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: appt.is_paid ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {appt.is_paid ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: '1rem', color: listMeta[listModal].color }}>
                          R$ {(appt.fee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <ChevronRight size={16} color="var(--color-text-muted)" style={{ marginTop: '2px' }} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Detalhe de um pagamento
      ══════════════════════════════════════════════════════════════════ */}
      {detailAppt && (
        <div className="modal-overlay" onClick={() => setDetailAppt(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Detalhe do Pagamento</h3>
              <button onClick={() => setDetailAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Card do paciente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--color-background)', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
                {detailAppt.patient_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{detailAppt.patient_name}</p>
                <span style={{
                  display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem', fontWeight: 700,
                  padding: '0.2rem 0.75rem', borderRadius: '99px',
                  backgroundColor: detailAppt.is_paid ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: detailAppt.is_paid ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {detailAppt.is_paid ? '✓ Pago' : '⏳ Pendente'}
                </span>
              </div>
            </div>

            {/* Infos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {[
                { icon: Calendar,   label: 'Data da Consulta', value: new Date(detailAppt.date_time).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) },
                { icon: Clock,      label: 'Horário',          value: new Date(detailAppt.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
                { icon: CreditCard, label: 'Valor',            value: `R$ ${(detailAppt.fee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                { icon: User,       label: 'Status da Sessão', value: detailAppt.status },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="var(--color-primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ fontWeight: 700, color: 'var(--color-text-main)', textTransform: label === 'Data da Consulta' ? 'capitalize' : 'none' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ação */}
            <button
              onClick={() => togglePayment(detailAppt)}
              className={`btn ${detailAppt.is_paid ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
            >
              {detailAppt.is_paid
                ? <><Clock size={16} /> Marcar como Pendente</>
                : <><CheckCircle size={16} /> Confirmar Pagamento</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
