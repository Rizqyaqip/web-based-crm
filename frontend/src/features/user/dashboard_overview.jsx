import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, AlertTriangle, ArrowUpRight, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { getDashboardStats, updateOrderStatus, formatIDR } from '../../services/api';
import { useAuth } from '../../context/auth_context';

export function DashboardOverview({ setPage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats(options);
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat ringkasan dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchStats]);

  // Update optimistik lokal untuk menghindari query agregasi berat ke database secara berulang
  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user);
      setStats((prev) => {
        if (!prev) return prev;
        const updatedRecent = prev.recent_orders?.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, staff_nama: user?.nama || o.staff_nama } : o
        );
        return {
          ...prev,
          recent_orders: updatedRecent
        };
      });
    } catch (err) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>Memuat ringkasan KPI Ketsai...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{
        backgroundColor: 'var(--status-danger-bg)',
        color: 'var(--status-danger-text)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        maxWidth: '500px'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{error || 'Data dashboard tidak tersedia'}</p>
        <button onClick={fetchStats} className="zen-btn-primary" style={{ marginTop: '12px', padding: '6px 14px', fontSize: '12px' }}>
          Muat Ulang
        </button>
      </div>
    );
  }

  const { kpis, weekly_sales, recent_orders } = stats;

  // Kalkulasi bar chart scale
  const maxWeeklySales = Math.max(1, ...weekly_sales.map((d) => d.total));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. TOP-LEVEL KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Total Sales Today */}
        <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Penjualan Hari Ini
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--accent-vermilion)' }}>
            {formatIDR(kpis.total_sales_today)}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Dari {kpis.total_orders_today} pesanan masuk hari ini
          </span>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Keseluruhan Pesanan
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-info-bg)',
              color: 'var(--status-info-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontFamily: 'var(--font-serif)' }}>
            {kpis.total_all_orders} Pesanan
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Termasuk guest checkout & offline
          </span>
        </div>

        {/* KPI 3: Low Stock Alerts */}
        <div className="zen-card" style={{
          padding: 'clamp(16px, 3vw, 24px)',
          borderColor: kpis.low_stock_count > 0 ? 'var(--status-pending-border)' : 'var(--border-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Peringatan Stok Menipis
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: kpis.low_stock_count > 0 ? 'var(--status-pending-bg)' : 'var(--bg-surface)',
              color: kpis.low_stock_count > 0 ? 'var(--status-pending-text)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <h2 style={{
            fontSize: '26px',
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: kpis.low_stock_count > 0 ? 'var(--status-pending-text)' : 'var(--text-primary)'
          }}>
            {kpis.low_stock_count} Menu
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Stok ≤ 5 porsi tersisa
            </span>
            {kpis.low_stock_count > 0 && (
              <button
                onClick={() => setPage('user-stock-entry')}
                style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-vermilion)' }}
              >
                + Tambah Stok →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. WEEKLY SALES BAR CHART SECTION */}
      <div className="zen-card" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '17px', margin: 0 }}>Grafik Tren Penjualan Mingguan</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Volume omzet 7 hari terakhir (Rp)
            </p>
          </div>
          <span className="hanko-stamp">GRAFIK MINGGUAN</span>
        </div>

        {/* Minimalist Responsive Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '180px',
          paddingTop: '20px',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {weekly_sales.map((item, idx) => {
            const barHeightPct = maxWeeklySales > 0 ? (item.total / maxWeeklySales) * 100 : 0;
            const minHeight = item.total > 0 ? Math.max(12, barHeightPct) : 4;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
              >
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: item.total > 0 ? 'var(--text-primary)' : 'transparent',
                  marginBottom: '6px'
                }}>
                  {item.total > 0 ? `${(item.total / 1000).toFixed(0)}k` : ''}
                </span>

                <div
                  title={`${item.tanggal}: ${formatIDR(item.total)}`}
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${minHeight}%`,
                    backgroundColor: item.total > 0 ? 'var(--accent-vermilion)' : 'var(--border-subtle)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                />

                <span style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>
                  {item.hari}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MINI-TABLE: RECENT ORDERS NEEDING ACTION */}
      <div className="zen-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', margin: 0 }}>Pesanan Terbaru Perlu Ditindak</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Pesanan pelanggan dengan status Pending / Diproses
            </p>
          </div>
          <button
            onClick={() => setPage('user-orders')}
            className="zen-btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <span>Semua Riwayat Checkout</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {recent_orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
            Tidak ada pesanan tertunda saat ini. Semua pesanan telah diproses!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>ID Pesanan</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Pelanggan</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Total Harga</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Metode Bayar</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status Saat Ini</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Aksi Cepat</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>#{order.id}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{order.nama_customer}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-vermilion)' }}>
                      {formatIDR(order.total_harga)}
                    </td>
                    <td style={{ padding: '12px' }}>{order.metode_pembayaran || 'QRIS'}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge-status ${
                        order.status === 'Pending' ? 'badge-pending' :
                        order.status === 'Diproses' ? 'badge-processing' : 'badge-success'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleQuickStatusChange(order.id, 'Diproses')}
                          className="zen-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Proses Pesanan
                        </button>
                      )}
                      {order.status === 'Diproses' && (
                        <button
                          onClick={() => handleQuickStatusChange(order.id, 'Selesai')}
                          className="zen-btn-primary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {order.status === 'Selesai' && (
                        <span style={{ fontSize: '11px', color: 'var(--status-success-text)', fontWeight: 600 }}>
                          Tuntas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
