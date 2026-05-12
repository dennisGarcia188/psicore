import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

export default function Finance() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchFinances();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFinances = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;
      
      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        const withPatient = aRes.data.map(a => ({ ...a, patient_name: p.name }));
        allAppts = [...allAppts, ...withPatient];
      }

      allAppts.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      
      let total = 0, paid = 0, pending = 0;
      allAppts.forEach(a => {
        total += a.fee;
        if (a.is_paid) paid += a.fee;
        else pending += a.fee;
      });

      setStats({ total, paid, pending });
      setAppointments(allAppts);

    } catch (err) {
      console.error('Erro ao buscar finanças', err);
    }
  };

  const togglePayment = async (appt) => {
    try {
      await api.put(`/appointments/${appt.id}`, { ...appt, is_paid: !appt.is_paid });
      fetchFinances();
    } catch (err) {
      console.error('Erro ao atualizar pagamento', err);
    }
  };

  const StatBox = ({ title, value, color, bg }) => (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</p>
      <h3 style={{ fontSize: '2rem', fontWeight: 800, color }}>R$ {value.toFixed(2)}</h3>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <DollarSign size={isMobile ? 24 : 32} color="var(--color-primary)" />
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>Controle Financeiro</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatBox title={isMobile ? "Total" : "Faturamento Total"} value={stats.total} color="var(--color-primary)" />
        <StatBox title={isMobile ? "Pago" : "Recebido (Pago)"} value={stats.paid} color="var(--color-success)" />
        <StatBox title={isMobile ? "Pendente" : "A Receber (Pendente)"} value={stats.pending} color="var(--color-warning)" />
      </div>

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
                <tr key={appt.id}>
                  <td>{new Date(appt.date_time).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{appt.patient_name}</td>
                  <td>R$ {appt.fee.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${appt.is_paid ? 'badge-success' : 'badge-warning'}`}>
                      {appt.is_paid ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => togglePayment(appt)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                      Mudar para {appt.is_paid ? 'Pendente' : 'Pago'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
