import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, DollarSign, BarChart2, FileText, Settings as SettingsIcon, LogOut, LayoutDashboard, Book, Brain, Menu, X } from 'lucide-react';
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
import Footer from '../components/Footer';
import SupportModal from '../components/SupportModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)', overflowX: 'hidden' }}>
      {/* Topbar */}
      <header style={{ 
        backgroundColor: 'rgba(2,132,199,0.04)', 
        borderBottom: '1px solid var(--color-border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        width: '100%'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '70px',
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button 
                onClick={() => setIsMenuOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.5rem', marginLeft: '-0.5rem' }}
              >
                <Menu size={24} />
              </button>
            )}
            <Brain size={isMobile ? 24 : 28} color="var(--color-primary)" strokeWidth={2.5} />
            <h1 style={{ color: 'var(--color-primary)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, margin: 0 }}>PsiCore</h1>
          </div>
            
          {!isMobile && (
            <nav style={{ display: 'flex', gap: '0.25rem' }}>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
              <NavItem to="/dashboard/patients" icon={Users} label="Pacientes" />
              <NavItem to="/dashboard/calendar" icon={CalendarIcon} label="Agenda" />
              <NavItem to="/dashboard/finance" icon={DollarSign} label="Financeiro" />
              <NavItem to="/dashboard/reports" icon={BarChart2} label="Relatórios" />
              <NavItem to="/dashboard/templates" icon={FileText} label="Modelos" />
              <NavItem to="/dashboard/dsm" icon={Book} label="DSM-5" />
              <NavItem to="/dashboard/settings" icon={SettingsIcon} label="Administração" />
            </nav>
          )}

          {!isMobile ? (
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
                <LogOut size={16} /> Sair
              </button>
            </div>
          ) : (
            <div style={{ width: '40px' }} /> /* Spacer for alignment */
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobile && isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-start' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ width: '280px', height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '1.5rem', animation: 'slideRight 0.3s ease-out' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={24} color="var(--color-primary)" strokeWidth={2.5} />
                <h1 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 800 }}>PsiCore</h1>
              </div>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {[
                { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
                { to: "/dashboard/patients", icon: Users, label: "Pacientes" },
                { to: "/dashboard/calendar", icon: CalendarIcon, label: "Agenda" },
                { to: "/dashboard/finance", icon: DollarSign, label: "Financeiro" },
                { to: "/dashboard/reports", icon: BarChart2, label: "Relatórios" },
                { to: "/dashboard/templates", icon: FileText, label: "Modelos" },
                { to: "/dashboard/dsm", icon: Book, label: "DSM-5" },
                { to: "/dashboard/settings", icon: SettingsIcon, label: "Administração" },
              ].map(item => (
                <Link 
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive(item.to) ? 'var(--color-primary)' : 'transparent',
                    color: isActive(item.to) ? 'white' : 'var(--color-text-main)',
                    fontWeight: isActive(item.to) ? 700 : 500,
                    textDecoration: 'none'
                  }}
                >
                  <item.icon size={20} /> {item.label}
                </Link>
              ))}
            </div>

            <button 
              onClick={handleLogout}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', marginTop: 'auto',
                backgroundColor: 'rgba(239, 68, 68, 0.05)', border: 'none', color: 'var(--color-error)', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, borderRadius: 'var(--radius-md)'
              }}
            >
              <LogOut size={20} /> Sair da Conta
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: isMobile ? '1rem 0' : '2rem 0', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/appointment/new" element={<AppointmentForm />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dsm" element={<DsmConsult />} />
        </Routes>
      </main>

      <Footer onContactClick={() => setShowSupportModal(true)} />

      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
    </div>
  );
}
