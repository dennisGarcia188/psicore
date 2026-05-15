import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, X, ExternalLink } from 'lucide-react';
import api from '../api';

export default function TrialBanner() {
  const [trialInfo, setTrialInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const res = await api.get('/auth/me/trial-status');
        setTrialInfo(res.data);
      } catch (err) {
        // Silencioso: não exibe se não conseguir
      }
    };
    fetchTrialStatus();
  }, []);

  if (!trialInfo || dismissed) return null;
  // Só mostra se for trial
  if (!trialInfo.is_trial) return null;

  const days = trialInfo.days_remaining ?? 0;
  const isExpired = trialInfo.trial_expired;
  const isUrgent = days <= 3;

  const colors = isExpired
    ? { bg: 'rgba(239,68,68,0.08)', border: '#EF4444', icon: '#EF4444', text: '#B91C1C' }
    : isUrgent
    ? { bg: 'rgba(245,158,11,0.08)', border: '#F59E0B', icon: '#F59E0B', text: '#92400E' }
    : { bg: 'rgba(2,132,199,0.06)', border: '#0284C7', icon: '#0284C7', text: '#0369A1' };

  const message = isExpired
    ? 'Seu período de avaliação gratuita expirou.'
    : days === 0
    ? 'Seu período de avaliação gratuita termina hoje!'
    : `Seu período de avaliação gratuita termina em ${days} dia${days !== 1 ? 's' : ''}.`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {isExpired || isUrgent
          ? <AlertTriangle size={20} color={colors.icon} />
          : <Clock size={20} color={colors.icon} />
        }
        <div>
          <p style={{ fontWeight: 700, color: colors.text, fontSize: '0.9rem', margin: 0 }}>
            {message}
          </p>
          <p style={{ color: colors.text, fontSize: '0.8rem', margin: '0.15rem 0 0', opacity: 0.8 }}>
            {isExpired
              ? 'Entre em contato com o suporte para continuar usando o PsiCore.'
              : 'Para continuar usando o PsiCore após o período gratuito, entre em contato com o suporte.'
            }
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <a
          href="mailto:contato@psicore.app.br?subject=Assinatura PsiCore"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.border,
            color: 'white',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <ExternalLink size={14} /> Assinar agora
        </a>
        {!isExpired && (
          <button
            onClick={() => setDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.icon, padding: '4px' }}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
