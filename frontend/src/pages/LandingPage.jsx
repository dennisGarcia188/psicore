import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Shield, Users, Calendar, Brain, FileText, Zap, ArrowRight, MousePointer2, X, CheckCircle } from 'lucide-react';
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

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', message: '' });
  
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

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoError('');
    try {
      await api.post('/auth/request-demo', demoForm);
      setDemoSuccess(true);
      setDemoForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setDemoError('Não foi possível enviar a solicitação. Tente novamente mais tarde.');
    } finally {
      setDemoLoading(false);
    }
  };

  const Section = ({ title }) => (
    <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.25rem', marginTop: '1rem' }}>
      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
    </div>
  );

  return (
    <div style={{ overflowX: 'hidden', backgroundColor: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      {/* ── HEADER PREMIUM DARK ── */}
      <header style={{ 
        padding: '1.25rem 0', 
        backgroundColor: 'rgba(15, 23, 42, 0.85)', 
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        position: 'fixed', 
        width: '100%',
        top: 0, 
        zIndex: 100 
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={30} color="#38BDF8" strokeWidth={2.5} />
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>PsiCore</h1>
          </div>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#funcionalidades" className="mobile-hide" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.9rem', marginRight: '0.5rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.7)'}>Funcionalidades</a>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.backgroundColor='rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.backgroundColor='transparent'}>Entrar</Link>
            <button onClick={() => setShowRegister(true)} className="mobile-hide" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform='scale(1.05)'} onMouseOut={e => e.target.style.transform='scale(1)'}>Começar Agora</button>
          </nav>
        </div>
      </header>

      <main>
        {/* ── HERO SECTION DARK MODE ── */}
        <section style={{ 
          padding: '10rem 0 0', 
          textAlign: 'center', 
          background: 'radial-gradient(circle at top center, #1E293B 0%, #0F172A 100%)',
          position: 'relative',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Luz de fundo abstrata */}
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0) 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: 'rgba(56, 189, 248, 0.1)', 
              color: '#38BDF8', 
              padding: '0.4rem 1rem', 
              borderRadius: '99px', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              marginBottom: '2rem',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              <Zap size={14} fill="#38BDF8" /> Sistema Eletrônico Completo (Resolução CFP)
            </div>
            
            <h2 style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: 900, 
              marginBottom: '1.5rem', 
              lineHeight: 1.1, 
              letterSpacing: '-0.04em'
            }}>
              Sua clínica de psicologia <br />
              <span style={{ 
                background: 'linear-gradient(to right, #38BDF8, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>em outro nível.</span>
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '3rem', 
              lineHeight: 1.6,
              maxWidth: '650px',
              margin: '0 auto 3rem',
              fontWeight: 400
            }}>
              Deixe a burocracia para trás. Gerencie prontuários, agenda, pagamentos e emita atestados em uma plataforma de alto padrão, segura e exclusiva.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRegister(true)} style={{ padding: '1.1rem 2.5rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.39)' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                Experimentar 15 Dias Grátis <ArrowRight size={18} />
              </button>
              <button onClick={() => setShowDemoModal(true)} style={{ padding: '1.1rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'}>
                Agendar Demonstração
              </button>
            </div>
            <div style={{ marginTop: '5rem' }}></div>
          </div>
        </section>

        {/* ── TRUST & SOCIAL PROOF ── */}
        <section style={{ padding: '8rem 0 4rem', backgroundColor: '#F8FAFC' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', opacity: 0.8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                  <Shield size={24} color="#0EA5E9" /> Criptografia Ponta a Ponta
                </div>
                <span style={{ fontSize: '0.9rem' }}>Seus dados clínicos blindados</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                  <CheckCircle size={24} color="#10B981" /> Normas do CFP
                </div>
                <span style={{ fontSize: '0.9rem' }}>Atende à Resolução nº 06/2019</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                  <Activity size={24} color="#8B5CF6" /> Alta Disponibilidade
                </div>
                <span style={{ fontSize: '0.9rem' }}>99.9% de uptime garantido</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FUNCIONALIDADES PREMIUM ── */}
        <section id="funcionalidades" style={{ padding: '4rem 0 6rem', backgroundColor: '#F8FAFC' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#0F172A', letterSpacing: '-0.03em' }}>Tudo o que você precisa</h3>
              <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Uma suíte completa de ferramentas desenhada para minimizar o trabalho braçal e maximizar sua presença clínica.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[
                { 
                  icon: Users, 
                  title: 'Prontuário Eletrônico', 
                  desc: 'Histórico cronológico, anotações protegidas e anexos organizados. Acesso instantâneo e rastreabilidade total.',
                  color: '#0284C7', bg: '#F0F9FF'
                },
                { 
                  icon: Calendar, 
                  title: 'Agenda Touch Integrada', 
                  desc: 'Controle mobile perfeito. Visão por dia, semana ou mês. Marque faltas e reposições com apenas um clique.',
                  color: '#0D9488', bg: '#F0FDFA'
                },
                { 
                  icon: FileText, 
                  title: 'Geração de PDF Automático', 
                  desc: 'Emita atestados e declarações padronizadas com cabeçalho da sua clínica e envie direto para o e-mail do paciente.',
                  color: '#7C3AED', bg: '#F5F3FF'
                },
                { 
                  icon: Activity, 
                  title: 'Consulta DSM-5 Integrada', 
                  desc: 'Motor de busca rápido para os critérios do DSM-5, sem precisar sair da tela de evolução do paciente.',
                  color: '#EA580C', bg: '#FFF7ED'
                },
                { 
                  icon: Brain, 
                  title: 'Visão Geral Descomplicada', 
                  desc: 'Painel com as consultas do dia, próximos aniversariantes e faturamento rápido para não perder o controle.',
                  color: '#DB2777', bg: '#FDF2F8'
                },
                { 
                  icon: MousePointer2, 
                  title: 'Experiência Premium', 
                  desc: 'Navegação fluida sem tempo de carregamento e um design que transmite seriedade para o seu consultório.',
                  color: '#111827', bg: '#F1F5F9'
                }
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} style={{ 
                  padding: '2rem', 
                  borderRadius: '16px', 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                  border: '1px solid rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    backgroundColor: bg, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '1.25rem' 
                  }}>
                    <Icon color={color} size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0F172A' }}>{title}</h4>
                  <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ 
          padding: '6rem 0', 
          background: '#0F172A', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0) 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Dê o próximo passo na sua carreira clínica.
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', marginBottom: '3rem', lineHeight: 1.6 }}>
              Comece agora sem compromisso. Experimente todas as funcionalidades premium do PsiCore por 15 dias, totalmente de graça.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRegister(true)} style={{ backgroundColor: '#38BDF8', color: '#0F172A', border: 'none', cursor: 'pointer', padding: '1.1rem 2.5rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                Criar Minha Conta <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '2rem 0', backgroundColor: '#020617', color: 'rgba(255,255,255,0.4)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} color="rgba(255,255,255,0.8)" />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>PsiCore © {new Date().getFullYear()}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="#funcionalidades" style={{ fontSize: '0.85rem', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>Funcionalidades</a>
            <a href="#" style={{ fontSize: '0.85rem', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>Termos de Uso</a>
            <a href="#" style={{ fontSize: '0.85rem', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>Privacidade</a>
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>Acesso ao Sistema</Link>
          </div>
        </div>
      </footer>

      {/* ── MODAL DE REGISTRO (INALTERADO FUNCIONALMENTE) ── */}
      {showRegister && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '700px', padding: '2.5rem', backgroundColor: 'white', borderRadius: '24px' }}>
            <button 
              onClick={() => setShowRegister(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Brain size={32} color="#0284C7" />
                <h2 style={{ color: '#0F172A', fontSize: '1.75rem', fontWeight: 800 }}>PsiCore</h2>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Inicie seu Trial</h3>
              <p style={{ color: '#64748B', marginTop: '0.25rem' }}>15 dias gratuitos. Preencha seus dados para começar.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
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
                  borderRadius: '16px',
                  gap: '1rem'
                }}>
                  <div className="spinner" style={{ borderColor: '#E2E8F0', borderTopColor: '#0EA5E9' }}></div>
                  <p style={{ color: '#0EA5E9', fontWeight: 700, fontSize: '0.9rem' }}>Criando ambiente...</p>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <Section title="Dados de Acesso" />
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nome Completo *</label>
                    <input type="text" className="input-control" required placeholder="Dr. João da Silva" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>E-mail *</label>
                    <input type="email" className="input-control" required placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Senha *</label>
                    <input type="password" className="input-control" required placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>

                  <Section title="Dados Profissionais" />
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>CRP</label>
                    <input type="text" className="input-control" placeholder="CRP 06/123456" value={form.crp} onChange={e => set('crp', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Especialidade</label>
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
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Telefone Profissional</label>
                    <input type="text" className="input-control" placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#0F172A', border: 'none' }} disabled={loading}>
                  {loading ? 'Processando...' : 'Iniciar 15 Dias Grátis'}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
              Já tem uma conta? <Link to="/login" style={{ color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>Fazer login</Link>
            </p>
          </div>
        </div>
      )}

      {/* ── MODAL DE AGENDAR DEMONSTRAÇÃO ── */}
      {showDemoModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2.5rem', backgroundColor: 'white', borderRadius: '24px', textAlign: 'center' }}>
            <button 
              onClick={() => { setShowDemoModal(false); setDemoSuccess(false); setDemoError(''); }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            {demoSuccess ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ backgroundColor: '#D1FAE5', padding: '1rem', borderRadius: '50%' }}>
                    <CheckCircle size={48} color="#10B981" />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>Solicitação Enviada!</h3>
                <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve pelo e-mail ou telefone informado.
                </p>
                <button 
                  onClick={() => { setShowDemoModal(false); setDemoSuccess(false); }} 
                  className="btn" 
                  style={{ padding: '1rem 2rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#0F172A', color: 'white', border: 'none', width: '100%' }}
                >
                  Fechar Janela
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Activity size={32} color="#0D9488" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Agendar Demonstração</h3>
                  <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Preencha os dados e nossa equipe entrará em contato com você.</p>
                </div>

                {demoError && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'left' }}>
                    {demoError}
                  </div>
                )}

                <form onSubmit={handleDemoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nome Completo *</label>
                    <input type="text" className="input-control" required value={demoForm.name} onChange={e => setDemoForm({...demoForm, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>E-mail *</label>
                    <input type="email" className="input-control" required value={demoForm.email} onChange={e => setDemoForm({...demoForm, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Telefone / WhatsApp</label>
                    <input type="text" className="input-control" value={demoForm.phone} onChange={e => setDemoForm({...demoForm, phone: maskPhone(e.target.value)})} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sua Clínica / Observações</label>
                    <textarea className="input-control" rows="3" value={demoForm.message} onChange={e => setDemoForm({...demoForm, message: e.target.value})}></textarea>
                  </div>

                  <button type="submit" className="btn" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#0D9488', color: 'white', border: 'none', position: 'relative' }} disabled={demoLoading}>
                    {demoLoading ? 'Processando envio...' : 'Enviar Solicitação'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
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
          border: 3px solid;
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
