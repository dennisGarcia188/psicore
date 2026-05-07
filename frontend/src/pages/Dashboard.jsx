import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, DollarSign, BarChart2, FileText, Settings as SettingsIcon, LogOut, LayoutDashboard, Book } from 'lucide-react';
import PatientsList from './PatientsList';
import PatientDetail from './PatientDetail';
import CalendarView from './Calendar';
import AppointmentForm from './AppointmentForm';
import Finance from './Finance';
import Reports from './Reports';
import Templates from './Templates';
import SettingsPage from './Settings';
import Home from './Home';
import DsmConsult from './DsmConsult';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.includes(path)) return true;
    return false;
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', borderRadius: '99px',
        backgroundColor: isActive(to) ? 'var(--color-primary)' : 'transparent',
        color: isActive(to) ? 'white' : 'var(--color-text-muted)',
        fontWeight: isActive(to) ? 600 : 500,
        fontSize: '0.8rem',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      onMouseOver={(e) => { if (!isActive(to)) e.currentTarget.style.color = 'var(--color-primary)' }}
      onMouseOut={(e) => { if (!isActive(to)) e.currentTarget.style.color = 'var(--color-text-muted)' }}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Topbar */}
      <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>PsiCore</h1>
            
            <nav style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
              <NavItem to="/dashboard/patients" icon={Users} label="Pacientes" />
              <NavItem to="/dashboard/calendar" icon={CalendarIcon} label="Agenda" />
              <NavItem to="/dashboard/finance" icon={DollarSign} label="Financeiro" />
              <NavItem to="/dashboard/reports" icon={BarChart2} label="Relatórios" />
              <NavItem to="/dashboard/templates" icon={FileText} label="Modelos" />
              <NavItem to="/dashboard/dsm" icon={Book} label="DSM-5" />
              <NavItem to="/dashboard/settings" icon={SettingsIcon} label="Administração" />
            </nav>
          </div>

          <div>
            <button 
              onClick={handleLogout}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, borderRadius: '99px', transition: 'all var(--transition-fast)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.color = 'var(--color-error)' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-main)' }}
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '2rem 0', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/dsm" element={<DsmConsult />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
