import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Shield, Users, Calendar, Brain, FileText, Zap, ArrowRight, MousePointer2, X } from 'lucide-react';
import api from '../api';
import { maskPhone } from '../utils/masks';

export default function LandingPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    crp: '', specialty: '', phone: '',
    clinic_name: '', clinic_cnpj: '', clinic_address: '', clinic_phone: '',
  });
  const navigate = useNavigate();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      await api.post('/auth/register', payload);

      const formData = new URLSearchParams();
      formData.append('username', form.email);
      formData.append('password', form.password);
      const loginResponse = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', loginResponse.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title }) => (
    <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.25rem', marginTop: '1rem' }}>
      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
    </div>
  );

  return (
    <div style={{ overflowX: 'hidden', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 0', 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={30} color="var(--color-primary)" strokeWidth={2.5} />
            <h1 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>PsiCore</h1>
          </div>
          <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a href="#funcionalidades" className="mobile-hide" style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', marginRight: '0.5rem' }}>Funcionalidades</a>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Entrar</Link>
            <button onClick={() => setShowRegister(true)} className="btn btn-primary mobile-hide" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Começar Agora</button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ 
          padding: '8rem 0 6rem', 
          textAlign: 'center', 
          background: 'radial-gradient(circle at top center, #E0F2FE 0%, #F8FAFC 70%)',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: 'white', 
              color: 'var(--color-primary)', 
              padding: '0.5rem 1.25rem', 
              borderRadius: '99px', 
              fontSize: '0.875rem', 
              fontWeight: 700, 
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)'
            }}>
              <Zap size={16} fill="var(--color-primary)" /> Inteligência e simplicidade na gestão clínica
            </div>
            
            <h2 style={{ 
              fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
              fontWeight: 900, 
              marginBottom: '1.5rem', 
              lineHeight: 1.1, 
              color: 'var(--color-text-main)',
              letterSpacing: '-0.03em'
            }}>
              Sua clínica de psicologia <br />
              <span style={{ 
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>em outro nível.</span>
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', 
              color: 'var(--color-text-muted)', 
              marginBottom: '3rem', 
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto 3rem'
            }}>
              Deixe a burocracia para trás. Gerencie prontuários, agenda e financeiro em uma plataforma premium, segura e feita para psicólogos modernos.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRegister(true)} className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: 'var(--radius-lg)' }}>
                Criar Conta Gratuita <ArrowRight size={20} />
              </button>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'white' }}>
                Ver Demonstração
              </Link>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Shield size={18} /> Criptografia de Ponta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Activity size={18} /> Disponibilidade 99.9%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Users size={18} /> Suporte Especializado
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Overlay (Colorful decoration) */}
        <div style={{ 
          height: '100px', 
          background: 'linear-gradient(to bottom, #F8FAFC, var(--color-background))' 
        }}></div>

        {/* Funcionalidades */}
        <section id="funcionalidades" style={{ padding: '6rem 0', backgroundColor: 'var(--color-background)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Tudo o que você precisa</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>Uma suite completa de ferramentas para otimizar seu tempo e profissionalizar seu atendimento.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {[
                { 
                  icon: Users, 
                  title: 'Prontuário Digital', 
                  desc: 'Histórico completo, evolução de sessões e documentos organizados por paciente com total privacidade.',
                  color: '#0284C7'
                },
                { 
                  icon: Calendar, 
                  title: 'Agenda Inteligente', 
                  desc: 'Controle seus horários com visualização intuitiva e gestão de faltas e remarcações em um clique.',
                  color: '#0D9488'
                },
                { 
                  icon: FileText, 
                  title: 'Modelos Personalizados', 
                  desc: 'Crie seus próprios templates para atestados, anamneses e contratos, agilizando sua escrita clínica.',
                  color: '#7C3AED'
                },
                { 
                  icon: Activity, 
                  title: 'Consulta DSM-5', 
                  desc: 'Base de dados integrada para consulta rápida de critérios diagnósticos durante ou após a sessão.',
                  color: '#EA580C'
                },
                { 
                  icon: Brain, 
                  title: 'Visão Geral (Dashboard)', 
                  desc: 'Estatísticas de atendimento e lembretes de aniversariantes e consultas do dia em uma única tela.',
                  color: '#DB2777'
                },
                { 
                  icon: MousePointer2, 
                  title: 'Interface Premium', 
                  desc: 'Design limpo, minimalista e profissional que passa credibilidade para sua prática clínica.',
                  color: '#111827'
                }
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} style={{ 
                  padding: '2.5rem', 
                  borderRadius: 'var(--radius-2xl)', 
                  backgroundColor: 'var(--color-surface)', 
                  boxShadow: 'var(--shadow-md)', 
                  border: '1px solid var(--color-border)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = color }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: 'var(--radius-xl)', 
                    backgroundColor: `${color}15`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '1.5rem' 
                  }}>
                    <Icon color={color} size={30} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>{title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section style={{ 
          padding: '8rem 0', 
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 50%, #0D9488 100%)', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background circles */}
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

          <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Pronto para transformar sua clínica?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: '3.5rem', lineHeight: 1.6 }}>
              Junte-se a centenas de psicólogos que já profissionalizaram sua gestão com o PsiCore.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRegister(true)} style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', padding: '1.25rem 3rem', borderRadius: 'var(--radius-lg)', fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
                Criar Conta Gratuita <ArrowRight size={20} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '2rem', fontWeight: 500 }}>
              ✓ Sem fidelidade &nbsp; · &nbsp; ✓ Sem cartão de crédito &nbsp; · &nbsp; ✓ Backup diário
            </p>
          </div>
        </section>
      </main>

      <footer style={{ padding: '4rem 0', backgroundColor: 'var(--color-text-main)', color: 'rgba(255,255,255,0.5)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Brain size={24} color="white" />
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>PsiCore</span>
              </div>
              <p style={{ maxWidth: '300px', lineHeight: 1.6, fontSize: '0.9rem' }}>
                A plataforma de gestão clínica definitiva para psicólogos que buscam excelência e praticidade.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Produto</span>
                <a href="#funcionalidades" style={{ fontSize: '0.9rem' }}>Funcionalidades</a>
                <Link to="/login" style={{ fontSize: '0.9rem' }}>Acesso</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Legal</span>
                <a href="#" style={{ fontSize: '0.9rem' }}>Privacidade</a>
                <a href="#" style={{ fontSize: '0.9rem' }}>Termos</a>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
            <p style={{ margin: 0 }}>© 2026 PsiCore. Todos os direitos reservados.</p>
            <p style={{ margin: 0 }}>Desenvolvido com ❤️ para a psicologia brasileira.</p>
          </div>
        </div>
      </footer>

      {showRegister && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '700px', padding: '2.5rem' }}>
            <button 
              onClick={() => setShowRegister(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Brain size={32} color="var(--color-primary)" />
                <h2 style={{ color: 'var(--color-primary)', fontSize: '1.75rem', fontWeight: 800 }}>PsiCore</h2>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Crie sua conta</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Preencha seus dados profissionais para começar</p>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
                {error}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              {loading && (
                <div style={{
                  position: 'absolute',
                  inset: '-1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-xl)',
                  gap: '1rem'
                }}>
                  <div className="spinner"></div>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Criando sua conta...</p>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <Section title="Dados de Acesso" />
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Nome Completo *</label>
                    <input type="text" className="input-control" required placeholder="Dr. João da Silva" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>E-mail *</label>
                    <input type="email" className="input-control" required placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Senha *</label>
                    <input type="password" className="input-control" required placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>

                  <Section title="Dados Profissionais" />
                  <div className="input-group">
                    <label>CRP</label>
                    <input type="text" className="input-control" placeholder="CRP 06/123456" value={form.crp} onChange={e => set('crp', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Especialidade</label>
                    <select className="input-control" value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                      <option value="">Selecione...</option>
                      <option>Psicanálise</option>
                      <option>TCC (Terapia Cognitivo-Comportamental)</option>
                      <option>Gestalt-terapia</option>
                      <option>Humanismo</option>
                      <option>Psicologia Positiva</option>
                      <option>EMDR</option>
                      <option>DBT</option>
                      <option>Outra</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Telefone Profissional</label>
                    <input type="text" className="input-control" placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1.5rem', fontSize: '1rem' }} disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar Minha Conta no PsiCore'}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Já tem uma conta? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Fazer login</Link>
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
        }
        @media (max-width: 640px) {
          .modal-content {
            padding: 1.5rem !important;
          }
          .modal-content form > div {
            grid-template-columns: 1fr !important;
          }
          .modal-content form > div > div {
            grid-column: span 1 !important;
          }
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
