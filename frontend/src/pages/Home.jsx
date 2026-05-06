import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

export default function Home() {
  const [stats, setStats] = useState({
    confirmedThisWeek: 0,
    pendingThisWeek: 0,
    newPatientsThisWeek: 0
  });

  useEffect(() => {
    // Para fins de simplificação nesta versão, simularemos a contagem buscando tudo 
    // e filtrando localmente. Em produção com alto volume, idealmente teríamos rotas analíticas.
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const pRes = await api.get('/patients/');
      const pts = pRes.data;
      
      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        allAppts = [...allAppts, ...aRes.data];
      }

      // Filtro simplificado de estatísticas (Considerando tudo como 'recente' para o MVP)
      const confirmed = allAppts.filter(a => a.status === 'Confirmada').length;
      const pending = allAppts.filter(a => a.status === 'Aguardando Confirmação').length;

      setStats({
        confirmedThisWeek: confirmed,
        pendingThisWeek: pending,
        newPatientsThisWeek: pts.length
      });
    } catch (err) {
      console.error('Erro ao buscar stats', err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon color={color} size={32} />
      </div>
      <div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Visão Geral</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <StatCard 
          title="Consultas Confirmadas" 
          value={stats.confirmedThisWeek} 
          icon={CheckCircle} 
          color="var(--color-success)" 
          bg="rgba(16, 185, 129, 0.1)" 
        />
        <StatCard 
          title="Aguardando Confirmação" 
          value={stats.pendingThisWeek} 
          icon={Clock} 
          color="var(--color-warning)" 
          bg="rgba(245, 158, 11, 0.1)" 
        />
        <StatCard 
          title="Total de Pacientes" 
          value={stats.newPatientsThisWeek} 
          icon={Users} 
          color="var(--color-primary)" 
          bg="rgba(2, 132, 199, 0.1)" 
        />
      </div>
    </div>
  );
}
