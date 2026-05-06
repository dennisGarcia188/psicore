import { Link } from 'react-router-dom';
import { Activity, Shield, Users, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      <header style={{ padding: '1.5rem 0', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 700 }}>PsicoManager</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Começar Grátis</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ padding: '6rem 0', textAlign: 'center', backgroundColor: 'var(--color-background)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
              A gestão perfeita para sua clínica de psicologia
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              Simplifique seus agendamentos, organize prontuários e acompanhe a evolução dos seus pacientes em um sistema intuitivo e seguro.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Criar Minha Conta
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-surface)' }}>
          <div className="container">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>Tudo o que você precisa em um só lugar</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              
              <div style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Users color="var(--color-primary)" size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Gestão de Pacientes</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Prontuários eletrônicos organizados e fáceis de acessar de qualquer lugar.</p>
              </div>

              <div style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Calendar color="var(--color-primary)" size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Agendamentos</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Controle sua agenda e evite conflitos de horário com facilidade.</p>
              </div>

              <div style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Activity color="var(--color-primary)" size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Evolução Clínica</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Acompanhe o progresso de cada paciente através de anotações seguras.</p>
              </div>

              <div style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Shield color="var(--color-primary)" size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Segurança de Dados</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Seus dados e os de seus pacientes protegidos com criptografia de ponta.</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '2rem 0', backgroundColor: 'var(--color-text-main)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <p>© 2026 PsicoManager. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
