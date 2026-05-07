import { Link } from 'react-router-dom';
import { Activity, Shield, Users, Calendar, Brain, CheckCircle, DollarSign, FileText, Star, Zap, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ padding: '1.25rem 0', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={30} color="var(--color-primary)" />
            <h1 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>PsiCore</h1>
          </div>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#funcionalidades" style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Funcionalidades</a>
            <a href="#planos" style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Planos</a>
            <Link to="/login" className="btn btn-secondary">Entrar</Link>
            <Link to="/register" className="btn btn-primary">Começar Grátis</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ padding: '7rem 0 5rem', textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)' }}>
          <div className="container" style={{ maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(2,132,199,0.1)', color: 'var(--color-primary)', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <Zap size={14} /> Novo: Módulo de Consulta DSM-5 integrado
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.15, color: 'var(--color-text-main)' }}>
              O sistema <span style={{ color: 'var(--color-primary)' }}>completo</span> para psicólogos que querem focar no que importa
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Gerencie pacientes, agenda, prontuários eletrônicos, financeiro e muito mais em uma plataforma segura, intuitiva e feita especialmente para a prática clínica.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                Criar Conta Gratuita
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Já tenho conta
              </Link>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
              ✓ Grátis para começar &nbsp;·&nbsp; ✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Configuração em minutos
            </p>
          </div>
        </section>

        {/* Como Funciona */}
        <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-surface)' }}>
          <div className="container">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Como funciona?</h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3.5rem', fontSize: '1.1rem' }}>Em 3 passos simples você já está gerenciando sua clínica</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { step: '01', title: 'Crie sua conta', desc: 'Cadastre seus dados profissionais (CRP, especialidade, consultório) em menos de 2 minutos.' },
                { step: '02', title: 'Cadastre seus pacientes', desc: 'Adicione os pacientes com todos os dados clínicos, de contato e evolução.' },
                { step: '03', title: 'Gerencie sua clínica', desc: 'Agende consultas, registre prontuários, controle financeiro e muito mais.' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>{step}</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" style={{ padding: '5rem 0', backgroundColor: 'var(--color-background)' }}>
          <div className="container">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Tudo o que você precisa em um só lugar</h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3.5rem', fontSize: '1.1rem' }}>Recursos completos para a gestão clínica moderna</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: Users, title: 'Gestão de Pacientes', desc: 'Prontuários completos com CPF, histórico clínico, contato de emergência e evolução por sessão.' },
                { icon: Calendar, title: 'Agenda Inteligente', desc: 'Calendário visual estilo Google Agenda com visualização por dia, semana e mês.' },
                { icon: FileText, title: 'Modelos de Prontuário', desc: 'Crie e reutilize modelos de atestados, prescrições e orientações em qualquer sessão.' },
                { icon: Activity, title: 'Consulta DSM-5', desc: 'Acesse rapidamente os principais transtornos com busca inteligente por código ou sintoma.' },
                { icon: DollarSign, title: 'Controle Financeiro', desc: 'Gerencie honorários, pagamentos e inadimplências de forma simples e eficiente.' },
                { icon: Shield, title: 'Segurança Total', desc: 'Dados protegidos com autenticação JWT e comunicação criptografada SSL.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Icon color="var(--color-primary)" size={26} />
                  </div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-surface)' }}>
          <div className="container">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>O que dizem nossos usuários</h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3.5rem' }}>Psicólogos que transformaram a gestão de suas clínicas</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Dra. Ana Beatriz', crp: 'CRP 06/123456', specialty: 'TCC', text: 'O PsiCore revolucionou minha prática clínica. Consigo acessar o prontuário completo de qualquer paciente em segundos.' },
                { name: 'Dr. Marcos Oliveira', crp: 'CRP 08/98765', specialty: 'Psicanálise', text: 'A agenda integrada me poupou horas por semana. Os lembretes automáticos reduziram drasticamente as faltas dos pacientes.' },
                { name: 'Dra. Carla Mendes', crp: 'CRP 04/54321', specialty: 'Gestalt', text: 'A funcionalidade de modelos de prontuário é incrível. Crio atestados em segundos com meu próprio template personalizado.' },
              ].map(({ name, crp, specialty, text }) => (
                <div key={name} style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', marginBottom: '1rem' }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="var(--color-warning)" color="var(--color-warning)" />)}
                  </div>
                  <p style={{ color: 'var(--color-text-main)', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {name.split(' ')[1][0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{specialty} · {crp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" style={{ padding: '5rem 0', backgroundColor: 'var(--color-background)' }}>
          <div className="container">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Planos simples e transparentes</h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3.5rem' }}>Comece gratuitamente, escale quando precisar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              {/* Plano Gratuito */}
              <div style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.875rem' }}>Gratuito</p>
                <h4 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>R$0</h4>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Para sempre</p>
                {['Até 10 pacientes', 'Agenda básica', 'Modelos de prontuário', 'Consulta DSM-5'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <CheckCircle size={18} color="var(--color-success)" />
                    <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{f}</span>
                  </div>
                ))}
                <Link to="/register" className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>Começar Grátis</Link>
              </div>
              {/* Plano Pro */}
              <div style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-primary)', boxShadow: 'var(--shadow-lg)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>POPULAR</div>
                <p style={{ fontWeight: 700, opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.875rem' }}>Pro</p>
                <h4 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>R$49</h4>
                <p style={{ opacity: 0.8, marginBottom: '2rem' }}>por mês</p>
                {['Pacientes ilimitados', 'Agenda completa', 'E-mails automáticos', 'Relatórios avançados', 'Controle financeiro', 'Suporte prioritário'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <CheckCircle size={18} color="white" />
                    <span style={{ fontSize: '0.95rem' }}>{f}</span>
                  </div>
                ))}
                <Link to="/register" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem', backgroundColor: 'white', color: 'var(--color-primary)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem' }}>
                  Começar Teste Grátis
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #0284C7, #0D9488)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '700px' }}>
            <Brain size={48} color="white" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Pronto para transformar sua clínica?</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Junte-se a centenas de psicólogos que já usam o PsiCore para ter mais tempo para os pacientes.</p>
            <Link to="/register" style={{ backgroundColor: 'white', color: 'var(--color-primary)', padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1.1rem', display: 'inline-block' }}>
              Criar Conta Gratuita Agora
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ padding: '2.5rem 0', backgroundColor: 'var(--color-text-main)', color: 'rgba(255,255,255,0.6)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} color="white" />
            <span style={{ color: 'white', fontWeight: 700 }}>PsiCore</span>
          </div>
          <p style={{ margin: 0 }}>© 2026 PsiCore. Desenvolvido para transformar o atendimento clínico.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Privacidade</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
