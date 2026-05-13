import { useState } from 'react';
import { Search, Book } from 'lucide-react';

const DSM_DATA = [
  { code: 'F32.x', title: 'Transtorno Depressivo Maior', description: 'Caracterizado por humor deprimido na maior parte do dia, diminuição do interesse ou prazer, perda ou ganho de peso, insônia ou hipersonia, entre outros sintomas, durando pelo menos duas semanas.' },
  { code: 'F41.1', title: 'Transtorno de Ansiedade Generalizada (TAG)', description: 'Ansiedade e preocupação excessivas (expectativa apreensiva), ocorrendo na maioria dos dias por pelo menos seis meses, sobre diversos eventos ou atividades.' },
  { code: 'F41.0', title: 'Transtorno do Pânico', description: 'Ataques de pânico recorrentes e inesperados. Um ataque de pânico é um surto abrupto de medo ou desconforto intenso que alcança um pico em minutos.' },
  { code: 'F42', title: 'Transtorno Obsessivo-Compulsivo (TOC)', description: 'Presença de obsessões, compulsões ou ambas, que consomem tempo e causam sofrimento clinicamente significativo ou prejuízo no funcionamento.' },
  { code: 'F90.x', title: 'Transtorno de Déficit de Atenção/Hiperatividade (TDAH)', description: 'Padrão persistente de desatenção e/ou hiperatividade-impulsividade que interfere no funcionamento ou no desenvolvimento.' },
  { code: 'F43.10', title: 'Transtorno de Estresse Pós-Traumático (TEPT)', description: 'Desenvolvimento de sintomas específicos após a exposição a um ou mais eventos traumáticos, incluindo lembranças intrusivas, esquiva e alterações cognitivas.' },
  { code: 'F31.x', title: 'Transtorno Bipolar', description: 'Episódios de alterações de humor que variam de mania ou hipomania a depressão. Requer histórico de pelo menos um episódio maníaco (Tipo I) ou hipomaníaco (Tipo II).' },
  { code: 'F50.0', title: 'Anorexia Nervosa', description: 'Restrição da ingestão calórica levando a um peso corporal significativamente baixo, medo intenso de ganhar peso e perturbação na percepção da imagem corporal.' },
  { code: 'F60.3', title: 'Transtorno da Personalidade Borderline', description: 'Padrão de instabilidade nas relações interpessoais, autoimagem e afetos, acompanhado de impulsividade acentuada, começando no início da idade adulta.' },
  { code: 'F84.0', title: 'Transtorno do Espectro Autista (TEA)', description: 'Déficits persistentes na comunicação e na interação social em múltiplos contextos, acompanhados de padrões restritos e repetitivos de comportamento.' },
];

export default function DsmConsult() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const normalize = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredDsm = DSM_DATA.filter(item => {
    const term = normalize(searchTerm);
    return (
      normalize(item.title).includes(term) ||
      normalize(item.code).includes(term) ||
      normalize(item.description).includes(term)
    );
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Consulta DSM-5</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>Pesquise por códigos ou sintomas dos principais transtornos.</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var(--color-background)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Search color="var(--color-text-muted)" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por código (ex: F32) ou nome (ex: Ansiedade)..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--color-text-main)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredDsm.map((item, index) => (
          <div key={index} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)', paddingRight: '1rem' }}>{item.title}</h3>
              <span className="badge badge-primary" style={{ whiteSpace: 'nowrap' }}>
                <Book size={14} style={{ marginRight: '4px' }} /> {item.code}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {item.description}
            </p>
          </div>
        ))}
        {filteredDsm.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Nenhum transtorno encontrado para a sua busca.
          </div>
        )}
      </div>
    </div>
  );
}
