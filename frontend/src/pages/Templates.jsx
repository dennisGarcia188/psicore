import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../api';
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', type: 'Atestado', content: '' });
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchTemplates();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/templates/');
      setTemplates(response.data);
    } catch (err) {
      console.error('Erro ao buscar templates', err);
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
      fetchTemplates();
    } catch (err) {
      console.error('Erro ao salvar modelo', err.response?.data || err);
      alert('Erro ao salvar modelo. ' + (err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : ''));
    }
  };

  const handleDelete = async (id) => {
    setTemplateToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await api.delete(`/templates/${templateToDelete}`);
      fetchTemplates();
    } catch (err) {
      console.error('Erro ao excluir modelo', err);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700, textAlign: isMobile ? 'center' : 'left' }}>Modelos de Prontuário</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Plus size={20} /> Novo Modelo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {templates.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum modelo cadastrado. Crie um atestado, prescrição ou plano de tratamento para reaproveitar.</p>
        ) : (
          templates.map(template => (
            <div key={template.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <button onClick={() => handleDelete(template.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>{template.type}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{template.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {template.content}
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Novo Modelo</h3>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label>Título (Ex: Atestado de Comparecimento Padrão)</label>
                <input type="text" className="input-control" required value={newTemplate.title} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} placeholder="Meu Atestado Padrão" />
              </div>
              <div className="input-group">
                <label>Tipo de Documento</label>
                <select className="input-control" value={newTemplate.type} onChange={e => setNewTemplate({...newTemplate, type: e.target.value})}>
                  <option value="Atestado">Atestado</option>
                  <option value="Orientações">Orientações</option>
                  <option value="Plano de Tratamento">Plano de Tratamento</option>
                  <option value="Prescrição">Prescrição</option>
                </select>
              </div>
              <div className="input-group">
                <label>Conteúdo (Texto base)</label>
                <textarea className="input-control" rows="8" required value={newTemplate.content} onChange={e => setNewTemplate({...newTemplate, content: e.target.value})} placeholder="Declaro para os devidos fins..."></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Modelo</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
