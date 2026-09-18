import { RefreshCw } from 'lucide-react';

export function LoadingSpinner({ text = 'Memuat data...', size = 32 }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <RefreshCw size={size} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
      <p style={{ fontSize: '14px', margin: 0 }}>{text}</p>
    </div>
  );
}
