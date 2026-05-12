import { useState, useEffect } from 'react';
import { BarChart2, DollarSign, Calendar, FileText, Download, Filter } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../api';

const TABS = [
  { key: 'financial', label: 'Financeiro', icon: DollarSign },
  { key: 'bydate', label: 'Consultas por Data', icon: Calendar },
  { key: 'period', label: 'Atendimentos por Período', icon: BarChart2 },
];

const STATUS_COLOR = {
  'Confirmada': '#0284C7', 'Aguardando Confirmação': '#F59E0B',
  'Realizada': '#10B981', 'Cancelada': '#EF4444',
};

function exportCSV(rows, filename) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [tab, setTab] = useState('financial');
  const [allAppts, setAllAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchAll();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtros Financeiro
  const [finMonth, setFinMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [finPaid, setFinPaid] = useState('all'); // all | paid | pending

  // Filtros Por Data
  const [dateStart, setDateStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateEnd, setDateEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateStatus, setDateStatus] = useState('all');

  // Filtros Por Período
  const [periodMode, setPeriodMode] = useState('month'); // week | month | quarter

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await api.get('/patients/');
      let appts = [];
      for (let p of pRes.data) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        appts = [...appts, ...aRes.data.map(a => ({ ...a, patient_name: p.name }))];
      }
      setAllAppts(appts.sort((a, b) => new Date(b.date_time) - new Date(a.date_time)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Dados Financeiro ───────────────────────────────────────────────────────
  const finData = allAppts.filter(a => {
    const d = new Date(a.date_time);
    const monthMatch = format(d, 'yyyy-MM') === finMonth;
    const paidMatch = finPaid === 'all' ? true : finPaid === 'paid' ? a.is_paid : !a.is_paid;
    return monthMatch && paidMatch;
  });

  const finTotals = {
    total: finData.reduce((s, a) => s + (a.fee || 0), 0),
    received: finData.filter(a => a.is_paid).reduce((s, a) => s + (a.fee || 0), 0),
    pending: finData.filter(a => !a.is_paid).reduce((s, a) => s + (a.fee || 0), 0),
  };

  // ── Dados Por Data ─────────────────────────────────────────────────────────
  const byDateData = allAppts.filter(a => {
    const d = new Date(a.date_time);
    const start = new Date(dateStart + 'T00:00:00');
    const end   = new Date(dateEnd + 'T23:59:59');
    const inRange = d >= start && d <= end;
    const statusOk = dateStatus === 'all' || a.status === dateStatus;
    return inRange && statusOk;
  });

  // ── Dados Por Período ──────────────────────────────────────────────────────
  const getPeriodBuckets = () => {
    const now = new Date();
    const buckets = [];
    if (periodMode === 'week') {
      for (let i = 3; i >= 0; i--) {
        const ref = new Date(now.getTime() - i * 7 * 86400000);
        const s = startOfWeek(ref, { locale: ptBR });
        const e = endOfWeek(ref, { locale: ptBR });
        const label = `${format(s, 'dd/MM')} – ${format(e, 'dd/MM')}`;
        const count = allAppts.filter(a => isWithinInterval(new Date(a.date_time), { start: s, end: e })).length;
        buckets.push({ label, count });
      }
    } else if (periodMode === 'month') {
      for (let i = 5; i >= 0; i--) {
        const ref = subMonths(now, i);
        const s = startOfMonth(ref); const e = endOfMonth(ref);
        const label = format(ref, 'MMM/yy', { locale: ptBR });
        const count = allAppts.filter(a => isWithinInterval(new Date(a.date_time), { start: s, end: e })).length;
        buckets.push({ label, count });
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        const ref = subMonths(now, i * 3);
        const s = startOfMonth(subMonths(ref, 2)); const e = endOfMonth(ref);
        const label = `T${4 - i} ${format(ref, 'yyyy')}`;
        const count = allAppts.filter(a => isWithinInterval(new Date(a.date_time), { start: s, end: e })).length;
        buckets.push({ label, count });
      }
    }
    return buckets;
  };

  const periodBuckets = getPeriodBuckets();
  const maxCount = Math.max(...periodBuckets.map(b => b.count), 1);

  const card = (children) => (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      {children}
    </div>
  );

  const filterBar = (children) => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}>
      <Filter size={14} color="var(--color-text-muted)" />
      {children}
    </div>
  );

  const select = (value, onChange, options) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.75rem' }}>Relatórios</h2>

      {/* Tabs */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-surface)', padding: '0.375rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', width: isMobile ? '100%' : 'fit-content', overflowX: isMobile ? 'auto' : 'visible' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 600, transition: 'all 0.15s', backgroundColor: tab === key ? 'var(--color-primary)' : 'transparent', color: tab === key ? 'white' : 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Carregando dados...</p>}

      {/* ── TAB: FINANCEIRO ─────────────────────────────────────────────────── */}
      {!loading && tab === 'financial' && card(<>
        {filterBar(<>
          <input type="month" value={finMonth} onChange={e => setFinMonth(e.target.value)} className="input-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
          {select(finPaid, setFinPaid, [['all','Todos'],['paid','Pagos'],['pending','Pendentes']])}
          <button onClick={() => exportCSV(
            [['Paciente','Data','Valor','Status Pagamento','Status Consulta'],
             ...finData.map(a => [a.patient_name, format(new Date(a.date_time), 'dd/MM/yyyy HH:mm'), `R$ ${a.fee?.toFixed(2)}`, a.is_paid ? 'Pago' : 'Pendente', a.status])],
            'financeiro.csv'
          )} className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
            <Download size={14} /> Exportar CSV
          </button>
        </>)}

        {/* Totalizadores */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'var(--color-border)' }}>
          {[
            { label: 'Total Faturado', value: finTotals.total, color: 'var(--color-primary)' },
            { label: 'Recebido', value: finTotals.received, color: 'var(--color-success)' },
            { label: 'Pendente', value: finTotals.pending, color: 'var(--color-warning)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: 'var(--color-surface)', padding: isMobile ? '1rem' : '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, color }}>{`R$ ${value.toFixed(2).replace('.', ',')}`}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Paciente</th><th>Data</th><th>Valor</th><th>Pagamento</th><th>Status</th></tr></thead>
            <tbody>
              {finData.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Nenhum registro encontrado.</td></tr>
              ) : finData.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(a.date_time), 'dd/MM/yy HH:mm')}</td>
                  <td style={{ fontWeight: 600 }}>R$ {a.fee?.toFixed(2)}</td>
                  <td><span className={`badge ${a.is_paid ? 'badge-success' : 'badge-warning'}`}>{a.is_paid ? 'Pago' : 'Pendente'}</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: STATUS_COLOR[a.status] }}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* ── TAB: POR DATA ───────────────────────────────────────────────────── */}
      {!loading && tab === 'bydate' && card(<>
        {filterBar(<>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>De</label>
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="input-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Até</label>
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="input-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
          {select(dateStatus, setDateStatus, [['all','Todos os status'],['Confirmada','Confirmada'],['Realizada','Realizada'],['Aguardando Confirmação','Aguardando'],['Cancelada','Cancelada']])}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{byDateData.length} consulta(s)</span>
          <button onClick={() => exportCSV(
            [['Paciente','Data','Hora','Status','Valor','Pago'],
             ...byDateData.map(a => [a.patient_name, format(new Date(a.date_time),'dd/MM/yyyy'), format(new Date(a.date_time),'HH:mm'), a.status, `R$ ${a.fee?.toFixed(2)}`, a.is_paid ? 'Sim' : 'Não'])],
            'consultas-por-data.csv'
          )} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
            <Download size={14} /> Exportar CSV
          </button>
        </>)}

        <div className="table-container">
          <table className="table">
            <thead><tr><th>Paciente</th><th>Data</th><th>Horário</th><th>Status</th><th>Valor</th></tr></thead>
            <tbody>
              {byDateData.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Nenhum registro no período.</td></tr>
              ) : byDateData.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(a.date_time), 'dd/MM/yy')}</td>
                  <td>{format(new Date(a.date_time), 'HH:mm')}</td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: `${STATUS_COLOR[a.status]}18`, color: STATUS_COLOR[a.status] }}>{a.status}</span></td>
                  <td>R$ {a.fee?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* ── TAB: POR PERÍODO ────────────────────────────────────────────────── */}
      {!loading && tab === 'period' && card(<>
        {filterBar(<>
          {select(periodMode, setPeriodMode, [['week','Por Semana'],['month','Por Mês'],['quarter','Por Trimestre']])}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total: {periodBuckets.reduce((s, b) => s + b.count, 0)} atendimentos
          </span>
        </>)}

        <div style={{ padding: '2rem 1.5rem' }}>
          {/* Gráfico de barras CSS */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '200px', marginBottom: '1rem' }}>
            {periodBuckets.map(({ label, count }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{count}</span>
                <div style={{ width: '100%', backgroundColor: count > 0 ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '6px 6px 0 0', height: `${Math.max((count / maxCount) * 100, count > 0 ? 4 : 0)}%`, transition: 'height 0.3s ease', minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.4 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tabela resumo */}
          <table className="table" style={{ marginTop: '1rem' }}>
            <thead><tr><th>Período</th><th>Atendimentos</th><th>% do Total</th></tr></thead>
            <tbody>
              {periodBuckets.map(({ label, count }) => {
                const total = periodBuckets.reduce((s, b) => s + b.count, 0);
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={label}>
                    <td style={{ fontWeight: 600 }}>{label}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{count}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '99px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '36px' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}
