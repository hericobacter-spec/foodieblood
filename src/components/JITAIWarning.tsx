import { AlertTriangle, Footprints, X } from 'lucide-react';
import { useI18n } from '../i18n';

const JITAIWarning = ({ onClose, onWalk }: { onClose: () => void, onWalk: () => void }) => {
  const { t } = useI18n();
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--color-surface)',
      border: '2px solid var(--color-warning)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-4)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-3)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-warning)' }}>
          <AlertTriangle size={24} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)' }}>{t('spikePredicted')}</h3>
        </div>
        <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {t('jitaiDesc')}
      </p>

      <div style={{ background: 'var(--color-primary-light)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <Footprints size={18} /> {t('jitaiSuggestionTitle')}
        </h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
          {t('jitaiSuggestionBody')}
        </p>
      </div>

      <button className="btn-primary" onClick={onWalk} style={{ marginTop: 'var(--spacing-2)' }}>
        {t('takeWalkBtn')}
      </button>
    </div>
  );
};

export default JITAIWarning;
