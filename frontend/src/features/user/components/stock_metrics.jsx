import { memo } from 'react';
import { Boxes, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const StockMetrics = memo(function StockMetrics({ stats }) {
  if (!stats) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '16px'
    }}>
      {/* 1. Total Menu */}
      <div className="zen-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--status-info-bg)',
          color: 'var(--status-info-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Boxes size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Menu Produk
          </span>
          <h3 style={{ fontSize: '22px', margin: '2px 0 0', fontFamily: 'var(--font-serif)' }}>
            {stats.total} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>item</span>
          </h3>
        </div>
      </div>

      {/* 2. Stok Aman */}
      <div className="zen-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--status-success-bg)',
          color: 'var(--status-success-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle2 size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Stok Aman (&gt; 5)
          </span>
          <h3 style={{ fontSize: '22px', margin: '2px 0 0', fontFamily: 'var(--font-serif)', color: 'var(--status-success-text)' }}>
            {stats.safeStock} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>produk</span>
          </h3>
        </div>
      </div>

      {/* 3. Stok Menipis */}
      <div className="zen-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--status-pending-bg)',
          color: 'var(--status-pending-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Stok Menipis (1 - 5)
          </span>
          <h3 style={{ fontSize: '22px', margin: '2px 0 0', fontFamily: 'var(--font-serif)', color: 'var(--status-pending-text)' }}>
            {stats.lowStock} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>produk</span>
          </h3>
        </div>
      </div>

      {/* 4. Stok Habis */}
      <div className="zen-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--status-danger-bg)',
          color: 'var(--status-danger-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Stok Habis (0)
          </span>
          <h3 style={{ fontSize: '22px', margin: '2px 0 0', fontFamily: 'var(--font-serif)', color: 'var(--status-danger-text)' }}>
            {stats.outOfStock} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>produk</span>
          </h3>
        </div>
      </div>
    </div>
  );
});
