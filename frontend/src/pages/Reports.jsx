import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import api from '../api';

export default function Reports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/patients/');
      const patients = res.data;
      
      // Simulação simples de relatório: Pacientes agrupados de forma fictícia para visualização.
      // Em uma aplicação real, agruparíamos pela data de criação.
      const mockData = [
        { name: 'Jan', pacientes: Math.floor(Math.random() * 5) },
        { name: 'Fev', pacientes: Math.floor(Math.random() * 5) },
        { name: 'Mar', pacientes: Math.floor(Math.random() * 5) },
        { name: 'Abr', pacientes: Math.floor(Math.random() * 5) },
        { name: 'Mai', pacientes: patients.length }, // Mês atual = total real
      ];
      
      setData(mockData);
    } catch (err) {
      console.error('Erro ao buscar dados para relatório', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BarChart2 size={32} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Relatórios</h2>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Evolução de Cadastro de Pacientes</h3>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(2, 132, 199, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              <Bar dataKey="pacientes" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
