import { useState, useEffect } from 'react';
import { FileText, Download, Send, X, User, Calendar, ChevronDown, CheckCircle, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../api';
import ModalPortal from './ModalPortal';

const DOC_TYPES = [
  {
    id: 'atestado',
    label: 'Atestado Psicológico',
    description: 'Documento que atesta condição psicológica para fins específicos',
    icon: '📋',
    fields: ['finalidade', 'observacoes'],
  },
  {
    id: 'declaracao',
    label: 'Declaração de Comparecimento',
    description: 'Declara que o paciente compareceu à consulta',
    icon: '📅',
    fields: ['data_consulta', 'horario'],
  },
  {
    id: 'encaminhamento',
    label: 'Encaminhamento',
    description: 'Encaminha o paciente a outro profissional de saúde',
    icon: '↗️',
    fields: ['destinatario', 'especialidade', 'motivo'],
  },
];

export default function DocumentGenerator({ isOpen, onClose, clinicSettings, psychologist }) {
  const [step, setStep] = useState(1); // 1: tipo, 2: dados, 3: preview/envio
  const [docType, setDocType] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isMobile] = useState(window.innerWidth <= 768);
  const [form, setForm] = useState({
    finalidade: '',
    observacoes: '',
    data_consulta: new Date().toISOString().split('T')[0],
    horario: '',
    destinatario: '',
    especialidade: '',
    motivo: '',
    send_email: false,
    custom_email: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/patients/').then(r => setPatients(r.data)).catch(() => {});
      setStep(1);
      setDocType(null);
      setSelectedPatient(null);
      setPdfBlob(null);
      setSent(false);
      setForm({
        finalidade: '',
        observacoes: '',
        data_consulta: new Date().toISOString().split('T')[0],
        horario: '',
        destinatario: '',
        especialidade: '',
        motivo: '',
        send_email: false,
        custom_email: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Geração do PDF ────────────────────────────────────────────────────────
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const margin = 25;
    const contentW = W - margin * 2;

    const clinicName = clinicSettings?.clinic_name || 'Consultório de Psicologia';
    const clinicAddress = clinicSettings?.address || '';
    const clinicPhone = clinicSettings?.phone || '';
    const psychName = psychologist?.name || '';
    const crp = psychologist?.crp || '';
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const patientName = selectedPatient?.name || '';

    // ── Cabeçalho ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Cinza escuro/preto
    doc.text(clinicName, W / 2, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Psicólogo(a) Responsável: Dr(a). ${psychName}  •  CRP: ${crp}`, W / 2, 32, { align: 'center' });

    // ── Linha divisória ──────────────────────────────────────────────────────
    doc.setDrawColor(226, 232, 240); // Linha sutil
    doc.setLineWidth(0.5);
    doc.line(margin, 42, W - margin, 42);

    // ── Título do documento ──────────────────────────────────────────────────
    const typeInfo = DOC_TYPES.find(d => d.id === docType);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(typeInfo?.label?.toUpperCase() || '', W / 2, 60, { align: 'center' });

    // ── Corpo do documento ───────────────────────────────────────────────────
    let y = 76;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    const addParagraph = (text, extraGap = 0) => {
      const lines = doc.splitTextToSize(text, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 4 + extraGap;
    };

    if (docType === 'atestado') {
      addParagraph(
        `Atesto, para os devidos fins, que ${patientName} encontra-se sob meus cuidados psicológicos e apresenta condições que justificam o presente documento.`,
        4
      );
      if (form.finalidade) {
        addParagraph(`Finalidade: ${form.finalidade}`, 4);
      }
      if (form.observacoes) {
        addParagraph(`Observações: ${form.observacoes}`, 4);
      }
      addParagraph(
        'O presente atestado foi elaborado com base em avaliação psicológica e é emitido de acordo com as normas éticas da profissão (Resolução CFP nº 06/2019).',
        0
      );
    } else if (docType === 'declaracao') {
      const dataConsulta = form.data_consulta
        ? new Date(form.data_consulta + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        : today;
      const horarioTexto = form.horario ? `, às ${form.horario}` : '';
      addParagraph(
        `Declaro, para os devidos fins, que ${patientName} compareceu a esta clínica em ${dataConsulta}${horarioTexto}, para atendimento psicológico.`,
        4
      );
      addParagraph(
        'Esta declaração é emitida a pedido do interessado, para os fins que se fizerem necessários.',
        0
      );
    } else if (docType === 'encaminhamento') {
      addParagraph(
        `Encaminho o(a) paciente ${patientName} ao(à) profissional ${form.destinatario}${form.especialidade ? ` — ${form.especialidade}` : ''}, para avaliação e acompanhamento especializado.`,
        4
      );
      if (form.motivo) {
        addParagraph(`Motivo do encaminhamento: ${form.motivo}`, 4);
      }
      addParagraph(
        'Coloco-me à disposição para esclarecimentos adicionais que se fizerem necessários.',
        0
      );
    }

    // ── Assinatura ───────────────────────────────────────────────────────────
    const signY = H - 65;
    doc.setDrawColor(180, 200, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, signY, margin + 80, signY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(psychName, margin, signY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`CRP: ${crp}`, margin, signY + 12);

    // ── Rodapé (Endereço e Telefone) ─────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, H - 24, W, 24, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    
    const footerText = [clinicAddress, clinicPhone].filter(Boolean).join('  •  ');
    if (footerText) doc.text(footerText, W / 2, H - 14, { align: 'center' });
    
    doc.setFontSize(7);
    doc.text(`Gerado em ${today} pelo PsiCore — Sistema de Gestão para Psicólogos`, W / 2, H - 8, { align: 'center' });

    return doc;
  };

  const handleGenerateAndPreview = () => {
    const doc = generatePDF();
    const blob = doc.output('blob');
    setPdfBlob(blob);
    setStep(3);
  };

  const handleDownload = async () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}_${selectedPatient?.name?.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    // Registra no histórico do banco de dados (baixado)
    if (selectedPatient?.id) {
      try {
        await api.post('/templates/history', {
          patient_id: selectedPatient.id,
          document_type: docType,
          sent_by_email: false,
        });
      } catch (err) {
        console.error('Erro ao registrar histórico de documento', err);
      }
    }
  };

  const handleSendEmail = async () => {
    const email = form.send_email ? form.custom_email : selectedPatient?.email;
    if (!email) {
      alert('O paciente não possui e-mail cadastrado. Digite um e-mail manualmente.');
      setForm(f => ({ ...f, send_email: true }));
      return;
    }
    
    setSending(true);
    
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });

      await api.post('/templates/send-document', {
        to_email: email,
        patient_id: selectedPatient?.id,
        patient_name: selectedPatient?.name,
        document_type: docType,
        pdf_base64: base64,
      });
      
      setSent(true);
    } catch (err) {
      alert('Erro ao enviar e-mail: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  const typeInfo = DOC_TYPES.find(d => d.id === docType);

  return (
    <ModalPortal>
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ alignItems: isMobile ? 'flex-end' : 'center' }}
      >
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: '560px', width: '100%' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-main)', margin: 0 }}>
                  Gerar Documento
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  {step === 1 ? 'Escolha o tipo' : step === 2 ? typeInfo?.label : 'Pré-visualização'}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={22} />
            </button>
          </div>

          {/* ── STEP 1: Escolha do tipo ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DOC_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setDocType(type.id); setStep(2); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'rgba(2,132,199,0.04)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{type.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--color-text-main)', margin: 0, fontSize: '0.95rem' }}>{type.label}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 2: Formulário de dados ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Seleção de paciente */}
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} /> Paciente *
                </label>
                <select
                  className="input-control"
                  value={selectedPatient?.id || ''}
                  onChange={e => setSelectedPatient(patients.find(p => p.id === parseInt(e.target.value)))}
                  required
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Campos específicos do tipo */}
              {docType === 'atestado' && (
                <>
                  <div className="input-group">
                    <label>Finalidade do atestado *</label>
                    <input className="input-control" type="text" placeholder="Ex: Justificar faltas ao trabalho" value={form.finalidade} onChange={e => setForm(f => ({ ...f, finalidade: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Observações adicionais (opcional)</label>
                    <textarea className="input-control" rows="3" placeholder="Informações complementares..." value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
                  </div>
                </>
              )}

              {docType === 'declaracao' && (
                <>
                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> Data da consulta *
                    </label>
                    <input className="input-control" type="date" value={form.data_consulta} onChange={e => setForm(f => ({ ...f, data_consulta: e.target.value }))} style={{ colorScheme: 'light' }} />
                  </div>
                  <div className="input-group">
                    <label>Horário (opcional)</label>
                    <input className="input-control" type="time" value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))} />
                  </div>
                </>
              )}

              {docType === 'encaminhamento' && (
                <>
                  <div className="input-group">
                    <label>Nome do profissional de destino *</label>
                    <input className="input-control" type="text" placeholder="Dr. João Silva" value={form.destinatario} onChange={e => setForm(f => ({ ...f, destinatario: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Especialidade</label>
                    <input className="input-control" type="text" placeholder="Psiquiatria, Neurologia..." value={form.especialidade} onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Motivo do encaminhamento *</label>
                    <textarea className="input-control" rows="3" placeholder="Descreva brevemente o motivo..." value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                <button
                  className="btn btn-primary"
                  disabled={!selectedPatient}
                  onClick={handleGenerateAndPreview}
                >
                  <FileText size={16} /> Gerar Documento
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview / Envio ── */}
          {step === 3 && (
            <div>
              {/* Preview do PDF inline */}
              {pdfBlob && (
                <div style={{ backgroundColor: 'var(--color-background)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--color-border)' }}>
                  <iframe
                    src={URL.createObjectURL(pdfBlob)}
                    title="Preview do Documento"
                    style={{ width: '100%', height: '340px', border: 'none', borderRadius: '8px' }}
                  />
                </div>
              )}

              {/* Opções de envio */}
              {sent ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle size={40} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>E-mail enviado com sucesso!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* E-mail personalizado */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    <input type="checkbox" checked={form.send_email} onChange={e => setForm(f => ({ ...f, send_email: e.target.checked }))} />
                    Enviar para e-mail diferente do cadastrado
                  </label>
                  {form.send_email && (
                    <input className="input-control" type="email" placeholder="email@exemplo.com" value={form.custom_email} onChange={e => setForm(f => ({ ...f, custom_email: e.target.value }))} />
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={handleDownload} style={{ flex: 1 }}>
                      <Download size={16} /> Baixar PDF
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSendEmail}
                      disabled={sending}
                      style={{ flex: 1 }}
                    >
                      {sending
                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</>
                        : <><Send size={16} /> Enviar por E-mail</>
                      }
                    </button>
                  </div>
                  {!selectedPatient?.email && !form.send_email && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-warning)', margin: 0 }}>
                      ⚠️ Este paciente não possui e-mail cadastrado. Marque a opção acima para digitar um e-mail.
                    </p>
                  )}
                </div>
              )}

              <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
                Voltar e editar
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
