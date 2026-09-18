import { useState, useEffect, useMemo, useCallback } from 'react';
import { Receipt, Search, Filter, RefreshCw, X, Printer } from 'lucide-react';
import { getOrders, getOrderById, updateOrderStatus, formatIDR } from '../../services/api';
import { useAuth } from '../../context/auth_context';
import { printPdfReport } from '../../utils';
import { useDebounce } from '../../hooks';

export function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const statusOptions = ['Semua', 'Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

  // Debounce search query untuk optimasi pencarian instan
  const debouncedSearch = useDebounce(searchQuery, 250);

  const fetchOrderList = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'Semua') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getOrders(params, options);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch orders:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrderList({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchOrderList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrderList();
  };

  const handleResetFilter = () => {
    setStatusFilter('Semua');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // Cek status apakah sedang dalam filter view
  const isFiltered = Boolean(
    startDate ||
    endDate ||
    statusFilter !== 'Semua' ||
    searchQuery.trim()
  );

  // Client-side filtering untuk pencarian instan dan akurasi tampilan
  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'Semua' && order.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchName = (order.nama_customer || '').toLowerCase().includes(q);
        const matchId = String(order.id).includes(q);
        const matchHp = (order.no_hp || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchHp) return false;
      }
      if (startDate) {
        const orderDate = new Date(order.tanggal_pesan).toISOString().split('T')[0];
        if (orderDate < startDate) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.tanggal_pesan).toISOString().split('T')[0];
        if (orderDate > endDate) return false;
      }
      return true;
    });
  }, [orders, statusFilter, debouncedSearch, startDate, endDate]);

  // Ringkasan metrik untuk laporan
  const summaryMetrics = useMemo(() => {
    let totalNilai = 0;
    let countSelesai = 0;
    let countPending = 0;
    displayedOrders.forEach((o) => {
      totalNilai += Number(o.total_harga || 0);
      if (o.status === 'Selesai') countSelesai++;
      if (o.status === 'Pending') countPending++;
    });
    return { totalNilai, countSelesai, countPending };
  }, [displayedOrders]);

  // Handler cetak ke PDF
  const handlePrintPdf = () => {
    const filterDescParts = [];
    if (startDate || endDate) {
      filterDescParts.push(`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`);
    }
    if (statusFilter !== 'Semua') {
      filterDescParts.push(`Status: ${statusFilter}`);
    }
    if (searchQuery.trim()) {
      filterDescParts.push(`Pencarian: "${searchQuery.trim()}"`);
    }

    const columns = [
      {
        header: 'No',
        key: 'no',
        align: 'center',
        render: (_, idx) => `${idx + 1}`
      },
      {
        header: 'Order ID',
        key: 'id',
        align: 'center',
        render: (order) => `#${order.id}`
      },
      {
        header: 'Tanggal Pesan',
        key: 'tanggal_pesan',
        render: (order) =>
          new Date(order.tanggal_pesan).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
      },
      {
        header: 'Nama Pelanggan',
        key: 'nama_customer',
        render: (order) => `${order.nama_customer || '-'}${order.no_hp ? ` (${order.no_hp})` : ''}`
      },
      {
        header: 'Metode Bayar',
        key: 'metode_pembayaran',
        render: (order) => order.metode_pembayaran || 'QRIS'
      },
      {
        header: 'Total Harga',
        key: 'total_harga',
        align: 'right',
        render: (order) => formatIDR(order.total_harga)
      },
      {
        header: 'Status',
        key: 'status',
        align: 'center',
        render: (order) => order.status
      }
    ];

    printPdfReport({
      title: 'Laporan Riwayat Pesanan',
      subtitle: isFiltered
        ? 'Daftar seluruh riwayat pesanan berdasarkan filter aktif'
        : 'Daftar seluruh riwayat pesanan pelanggan',
      isFiltered,
      filterDescription: filterDescParts.join(' | '),
      printedBy: user?.nama || user?.username || 'Operator Staf',
      columns,
      data: displayedOrders,
      summaryCards: [
        { label: 'Total Pesanan', value: `${displayedOrders.length} Pesanan` },
        { label: 'Total Transaksi', value: formatIDR(summaryMetrics.totalNilai) },
        { label: 'Status Selesai / Pending', value: `${summaryMetrics.countSelesai} Selesai / ${summaryMetrics.countPending} Pending` }
      ],
      filename: `Laporan-Pesanan-Ketsai-${isFiltered ? 'Filter' : 'Semua'}`
    });
  };

  const handleRowClick = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await getOrderById(orderId);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      alert('Gagal memuat detail invoice: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Diproses': return 'badge-processing';
      case 'Dikirim': return 'badge-processing';
      case 'Selesai': return 'badge-success';
      case 'Dibatalkan': return 'badge-danger';
      default: return 'badge-pending';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Filter Toolbar */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 20px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Row 1: Status Filter Buttons & Active Badge */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--accent-vermilion)" />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Status Pesanan:</span>
            {isFiltered && (
              <span className="badge-status badge-processing" style={{ fontSize: '11px', padding: '2px 8px' }}>
                Filter Aktif
              </span>
            )}
          </div>
          <div className="scrollable-tabs" style={{ gap: '6px', maxWidth: '100%' }}>
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: statusFilter === st ? 'var(--text-primary)' : 'var(--bg-card)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${statusFilter === st ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Date Filters, Search, Reset, Refresh */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Tanggal Mulai & Sampai */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mulai:</span>
              <input
                type="date"
                className="zen-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sampai:</span>
              <input
                type="date"
                className="zen-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
              />
            </div>

            {isFiltered && (
              <button
                onClick={handleResetFilter}
                className="zen-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Reset Filter
              </button>
            )}

            <button
              onClick={fetchOrderList}
              className="zen-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Segarkan data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '340px', width: '100%', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="zen-input"
                placeholder="Cari ID / Nama Pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', height: '36px', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="zen-btn-secondary" style={{ padding: '0 14px', height: '36px', fontSize: '12px' }}>
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', margin: 0 }}>Daftar Riwayat Checkout Pelanggan</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Menampilkan {displayedOrders.length} dari total {orders.length} pesanan
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrintPdf}
              disabled={loading || displayedOrders.length === 0}
              className="zen-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderColor: 'var(--accent-vermilion)',
                color: 'var(--accent-vermilion)'
              }}
              title={isFiltered ? 'Cetak riwayat pesanan yang terfilter ke PDF' : 'Cetak seluruh riwayat pesanan ke PDF'}
            >
              <Printer size={16} />
              <span>Cetak PDF {isFiltered ? '(Data Terfilter)' : ''}</span>
            </button>
            <span className="hanko-stamp">RIWAYAT PESANAN</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px' }}>Memuat riwayat checkout...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <Receipt size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Tidak ada pesanan ditemukan
            </p>
            <p style={{ fontSize: '13px' }}>
              Belum ada pesanan yang sesuai dengan filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '90px' }}>Order ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Nama Pelanggan</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Tanggal Pesan</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Total Harga</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Metode Bayar</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status Pesanan</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Ubah Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => {
                  const dateFormatted = new Date(order.tanggal_pesan).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onClick={() => handleRowClick(order.id)}
                    >
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--accent-vermilion)' }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600 }}>
                        {order.nama_customer}
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {order.no_hp}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        {dateFormatted}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700 }}>
                        {formatIDR(order.total_harga)}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {order.metode_pembayaran || 'QRIS'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge-status ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td 
                        style={{ padding: '14px', textAlign: 'right' }}
                        onClick={(e) => e.stopPropagation()} // Hindari trigger row click saat ganti dropdown
                      >
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Dikirim">Dikirim</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL INVOICE (Clicking row opens modal) */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'rgba(43, 42, 40, 0.55)',
          backdropFilter: 'blur(5px)'
        }}>
          <div 
            onClick={() => setSelectedOrder(null)} 
            style={{ position: 'absolute', inset: 0 }} 
          />

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            border: '1px solid var(--border-card)',
            zIndex: 151,
            padding: '36px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="hanko-stamp">DETAIL INVOICE</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedOrder.invoice_number}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', margin: '4px 0 0' }}>
                  Pesanan #{selectedOrder.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: 'var(--radius-full)' }}
              >
                <X size={20} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', marginBottom: '20px' }} />

            {/* Customer Info Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--bg-card)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>PELANGGAN</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{selectedOrder.nama_customer}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedOrder.no_hp}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>ALAMAT</span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', lineHeight: 1.4 }}>
                  {selectedOrder.alamat}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>METODE & STATUS</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{selectedOrder.metode_pembayaran}</p>
                <span className={`badge-status ${getStatusBadgeClass(selectedOrder.status)}`} style={{ fontSize: '11px', marginTop: '4px' }}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Ordered Items Table */}
            <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>Rincian Menu Dipesan</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontWeight: 700 }}>Nama Menu</th>
                  <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'center' }}>Jumlah</th>
                  <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>Harga Satuan</th>
                  <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{item.nama_produk}</td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.jumlah}x</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>{formatIDR(item.harga)}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>
                      {formatIDR(item.total_harga)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 800,
              paddingTop: '12px',
              borderTop: '2px solid var(--text-primary)',
              marginBottom: '24px'
            }}>
              <span>Total Pembayaran:</span>
              <span style={{ color: 'var(--accent-vermilion)', fontFamily: 'var(--font-serif)' }}>
                {formatIDR(selectedOrder.total_harga)}
              </span>
            </div>

            {/* Quick Status Modifier & Print Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dikirim">Dikirim</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="zen-btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Printer size={15} />
                <span>Cetak Nota / Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
