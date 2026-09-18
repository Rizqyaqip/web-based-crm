import { useState, useEffect, useMemo, useCallback } from 'react';
import { History, Calendar, RefreshCw, Filter, ArrowDownRight, ArrowUpRight, Printer, Search } from 'lucide-react';
import { getStockLogs } from '../../services/api';
import { useAuth } from '../../context/auth_context';
import { printPdfReport } from '../../utils';
import { useDebounce } from '../../hooks';

export function StockLogHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');

  const debouncedSearch = useDebounce(searchQuery, 250);

  const fetchLogs = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getStockLogs(params, options);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch stock logs:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchLogs]);

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setTypeFilter('Semua');
  };

  // Filter client-side untuk pencarian dan tipe mutasi
  const displayedLogs = useMemo(() => {
    return logs.filter((log) => {
      if (typeFilter !== 'Semua' && log.jenis !== typeFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchProduct = (log.nama_produk || '').toLowerCase().includes(q);
        const matchCat = (log.kategori || '').toLowerCase().includes(q);
        const matchOperator = (log.operator_name || '').toLowerCase().includes(q);
        if (!matchProduct && !matchCat && !matchOperator) return false;
      }
      return true;
    });
  }, [logs, typeFilter, debouncedSearch]);

  // Cek apakah saat ini sedang dalam filter view
  const isFiltered = Boolean(
    startDate ||
    endDate ||
    typeFilter !== 'Semua' ||
    searchQuery.trim()
  );

  // Hitung total mutasi untuk ringkasan
  const summaryMetrics = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    displayedLogs.forEach((l) => {
      const qty = Number(l.jumlah || 0);
      if (l.jenis === 'masuk') totalMasuk += qty;
      else totalKeluar += qty;
    });
    return { totalMasuk, totalKeluar };
  }, [displayedLogs]);

  // Handler cetak ke PDF
  const handlePrintPdf = () => {
    const filterDescParts = [];
    if (startDate || endDate) {
      filterDescParts.push(`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`);
    }
    if (typeFilter !== 'Semua') {
      filterDescParts.push(`Jenis: ${typeFilter === 'masuk' ? 'Stok Masuk' : 'Penjualan'}`);
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
        header: 'Tanggal & Waktu',
        key: 'tanggal',
        render: (log) =>
          new Date(log.tanggal).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
      },
      {
        header: 'Nama Produk',
        key: 'nama_produk',
        render: (log) => log.nama_produk || `Produk ID #${log.product_id}`
      },
      {
        header: 'Kategori',
        key: 'kategori',
        render: (log) => log.kategori || '-'
      },
      {
        header: 'Jenis Mutasi',
        key: 'jenis',
        render: (log) => (log.jenis === 'masuk' ? 'Stok Masuk' : 'Penjualan')
      },
      {
        header: 'Jumlah',
        key: 'jumlah',
        align: 'center',
        render: (log) => (log.jenis === 'masuk' ? `+${log.jumlah}` : `-${log.jumlah}`)
      },
      {
        header: 'Operator',
        key: 'operator_name',
        render: (log) => log.operator_name || 'Sistem'
      }
    ];

    printPdfReport({
      title: 'Laporan Riwayat Mutasi Stok',
      subtitle: isFiltered
        ? 'Daftar seluruh riwayat mutasi stok berdasarkan filter tanggal'
        : 'Daftar seluruh riwayat mutasi stok',
      isFiltered,
      filterDescription: filterDescParts.join(' | '),
      printedBy: user?.nama || user?.username || 'Operator Staf',
      columns,
      data: displayedLogs,
      summaryCards: [
        { label: 'Total Catatan', value: `${displayedLogs.length} Baris` },
        { label: 'Total Stok Masuk', value: `+${summaryMetrics.totalMasuk} Porsi` },
        { label: 'Total Penjualan', value: `-${summaryMetrics.totalKeluar} Porsi` }
      ],
      filename: `Laporan-Stok-Ketsai-${isFiltered ? 'Filter' : 'Semua'}`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Filter Toolbar */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--accent-vermilion)" />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Filter Riwayat Stok</span>
            {isFiltered && (
              <span className="badge-status badge-processing" style={{ fontSize: '11px', padding: '2px 8px' }}>
                Filter Aktif
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', flex: '1 1 180px' }}>
              <input
                type="text"
                className="zen-input"
                placeholder="Cari produk / operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '13px', width: '100%' }}
              />
            </div>

            {/* Jenis Mutasi Select */}
            <select
              className="zen-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
            >
              <option value="Semua">Semua Jenis</option>
              <option value="masuk">Stok Masuk</option>
              <option value="keluar">Penjualan</option>
            </select>

            {/* Rentang Tanggal */}
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
              onClick={fetchLogs}
              className="zen-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Segarkan data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Logs Data Table */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', margin: 0 }}>Log Mutasi Inventaris</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Menampilkan {displayedLogs.length} dari total {logs.length} riwayat
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrintPdf}
              disabled={loading || displayedLogs.length === 0}
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
              title={isFiltered ? 'Cetak riwayat yang terfilter ke PDF' : 'Cetak seluruh riwayat ke PDF'}
            >
              <Printer size={16} />
              <span>Cetak PDF {isFiltered ? '(Data Terfilter)' : ''}</span>
            </button>
            <span className="hanko-stamp">RIWAYAT MUTASI</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px' }}>Memuat riwayat stok...</p>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <History size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isFiltered ? 'Tidak ada riwayat yang sesuai filter' : 'Belum ada riwayat mutasi stok'}
            </p>
            <p style={{ fontSize: '13px' }}>
              {isFiltered
                ? 'Silakan sesuaikan kembali kata kunci atau rentang tanggal filter Anda.'
                : 'Catatan akan otomatis muncul saat Anda menambahkan stok atau pesanan pelanggan dibuat.'}
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilter}
                className="zen-btn-secondary"
                style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px' }}
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Tanggal & Waktu</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Nama Produk</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Kategori</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Jenis Mutasi</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Jumlah</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Operator Staf</th>
                </tr>
              </thead>
              <tbody>
                {displayedLogs.map((log) => {
                  const isMasuk = log.jenis === 'masuk';
                  const dateFormatted = new Date(log.tanggal).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {dateFormatted}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {log.nama_produk || 'Produk ID #' + log.product_id}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {log.kategori || '-'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge-status ${isMasuk ? 'badge-success' : 'badge-processing'}`} style={{ gap: '4px' }}>
                          {isMasuk ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          <span>{isMasuk ? 'Stok Masuk' : 'Penjualan'}</span>
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: isMasuk ? 'var(--status-success-text)' : 'var(--text-primary)'
                      }}>
                        {isMasuk ? `+${log.jumlah}` : `-${log.jumlah}`}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 500 }}>
                        {log.operator_name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

