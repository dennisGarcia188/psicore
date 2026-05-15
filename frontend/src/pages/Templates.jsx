import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Download } from 'lucide-react';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';
import ModalPortal from '../components/ModalPortal';
import DocumentGenerator from '../components/DocumentGenerator';

const TYPE_BADGE = {
  'Atestado': { bg: 'rgba(2,132,199,0.1)', color: '#0284C7' },
  'Declaração': { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  'Encaminhamento': { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
  'Orientações': { bg: 'rgba(139,92,246,0.1)', color: '#7C3AED' },
  'Plano de Tratamento': { bg: 'rgba(236,72,153,0.1)', color: '#BE185D' },
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', type: 'Atestado', content: '' });
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showDocGen, setShowDocGen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [psychologist, setPsychologist] = useState(null);

  useEffect(() => {
    fetchAll();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, meRes] = await Promise.all([
        api.get('/templates/'),
        api.get('/auth/me'),
      ]);
      setTemplates(tRes.data);
      setPsychologist(meRes.data);
      setClinicSettings(meRes.data.clinic_settings || null);
    } catch (err) {
      console.error('Erro ao buscar dados', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/templates/', newTemplate);
      setShowModal(false);
      setNewTemplate({ title: '', type: 'Atestado', content: '' });
      fetchAll();
    } catch (err) {
      alert('Erro ao salvar modelo. ' + (err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : ''));
    }
  };

  const handleDelete = (id) => {
    setTemplateToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await api.delete(`/templates/${templateToDelete}`);
      fetchAll();
    } catch (err) {
      console.error('Erro ao excluir modelo', err);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>Modelos e Documentos</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Crie modelos reutilizáveis e gere documentos profissionais em PDF
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowDocGen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: isMobile ? 1 : 'none' }}
          >
            <FileText size={18} /> Gerar Documento
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: isMobile ? 1 : 'none' }}
          >
            <Plus size={18} /> Novo Modelo
          </button>
        </div>
      </div>

      {/* Info box */}
      <div style={{ backgroundColor: 'rgba(2,132,199,0.05)', border: '1px solid rgba(2,132,199,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <FileText size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem', margin: 0 }}>Documentos suportados (CFP Res. 06/2019)</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            <strong>Atestado Psicológico</strong>, <strong>Declaração de Comparecimento</strong> e <strong>Encaminhamento</strong>.
            Clique em "Gerar Documento" para criar um PDF personalizado com os dados do paciente e enviá-lo por e-mail.
          </p>
        </div>
      </div>

      {/* Template cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {templates.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum modelo salvo ainda</p>
            <p style={{ fontSize: '0.875rem' }}>Salve textos base que você usa com frequência para reutilizar rapidamente.</p>
          </div>
        ) : (
          templates.map(template => {
            const badge = TYPE_BADGE[template.type] || TYPE_BADGE['Orientações'];
            return (
              <div
                key={template.id}
                style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '99px', backgroundColor: badge.bg, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {template.type}
                  </span>
                  <button onClick={() => handleDelete(template.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>{template.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                  {template.content}
                </p>
                <button
                  onClick={() => setShowDocGen(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', gap: '0.35rem' }}
                >
                  <Download size={14} /> Gerar PDF com este modelo
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Novo Modelo */}
      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>Novo Modelo</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="input-group">
                  <label>Título *</label>
                  <input type="text" className="input-control" required value={newTemplate.title} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} placeholder="Ex: Atestado de Comparecimento Padrão" />
                </div>
                <div className="input-group">
                  <label>Tipo de Documento</label>
                  <select className="input-control" value={newTemplate.type} onChange={e => setNewTemplate({...newTemplate, type: e.target.value})}>
                    <option value="Atestado">Atestado</option>
                    <option value="Declaração">Declaração de Comparecimento</option>
                    <option value="Encaminhamento">Encaminhamento</option>
                    <option value="Orientações">Orientações</option>
                    <option value="Plano de Tratamento">Plano de Tratamento</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Conteúdo base *</label>
                  <textarea className="input-control" rows="7" required value={newTemplate.content} onChange={e => setNewTemplate({...newTemplate, content: e.target.value})} placeholder="Declaro para os devidos fins..." />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Modelo</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Document Generator */}
      <DocumentGenerator
        isOpen={showDocGen}
        onClose={() => setShowDocGen(false)}
        clinicSettings={clinicSettings}
        psychologist={psychologist}
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Excluir Modelo"
        message="Deseja mesmo excluir este modelo de prontuário? Esta ação é irreversível."
      />
    </div>
  );
}
