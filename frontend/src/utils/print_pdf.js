/**
 * Utility Reusable untuk Mencetak Tabel Laporan ke Format PDF / Printer Browser.
 * Menggunakan iframe terisolasi dengan layout A4 profesional, kop Ketsai,
 * metadata filter aktif, tabel rapi dengan pemotongan halaman otomatis, dan kartu ringkasan.
 */
import logoImg from '../assets/logo.png';


function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Mencetak laporan tabel ke PDF / Dialog Cetak
 * @param {Object} options
 * @param {string} options.title - Judul laporan (e.g. 'Laporan Riwayat Mutasi Stok')
 * @param {string} [options.subtitle] - Subjudul laporan
 * @param {boolean} [options.isFiltered] - Status apakah data sedang dalam filter view
 * @param {string} [options.filterDescription] - Rincian parameter filter yang sedang aktif
 * @param {string} [options.printedBy] - Nama operator/user yang mencetak
 * @param {Array<{header: string, key: string, align?: 'left'|'center'|'right', render?: (item: any, index: number) => string}>} options.columns
 * @param {Array<any>} options.data - Data baris tabel
 * @param {Array<{label: string, value: string|number}>} [options.summaryCards] - Kartu ringkasan metrik
 * @param {string} [options.filename] - Nama default file saat disimpan sebagai PDF
 */
export function printPdfReport({
  title = 'Laporan Data',
  subtitle = 'Ketsai Management System',
  isFiltered = false,
  filterDescription = '',
  printedBy = 'Operator',
  columns = [],
  data = [],
  summaryCards = [],
  filename = 'Laporan-Ketsai',
  logo = null
}) {
  const logoSrc = logo || (typeof window !== 'undefined' ? new URL(logoImg, window.location.href).href : logoImg);
  const printDate = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';

  // Format HTML Metadata Grid
  const metadataItems = [
    { label: 'Status Data', value: isFiltered ? 'Data Terfilter' : 'Semua Riwayat (Lengkap)', isBadge: true, isFiltered },
    { label: 'Tanggal Cetak', value: printDate },
    { label: 'Dicetak Oleh', value: printedBy },
    { label: 'Total Catatan', value: `${data.length} baris data` }
  ];

  if (isFiltered && filterDescription) {
    metadataItems.push({ label: 'Parameter Filter', value: filterDescription, fullWidth: true });
  }

  // Buat HTML Table Headers
  const tableHeadersHtml = columns
    .map(col => `<th style="text-align: ${col.align || 'left'};">${escapeHtml(col.header)}</th>`)
    .join('');

  // Buat HTML Table Rows
  let tableRowsHtml = '';
  if (data.length === 0) {
    tableRowsHtml = `
      <tr>
        <td colspan="${columns.length}" style="text-align: center; padding: 28px; color: #6b7280; font-style: italic;">
          Tidak ada data catatan yang sesuai dengan filter saat ini.
        </td>
      </tr>
    `;
  } else {
    tableRowsHtml = data
      .map((item, index) => {
        const cellsHtml = columns
          .map(col => {
            const content = col.render ? col.render(item, index) : escapeHtml(item[col.key] ?? '-');
            const align = col.align || 'left';
            return `<td style="text-align: ${align};">${content}</td>`;
          })
          .join('');

        return `<tr>${cellsHtml}</tr>`;
      })
      .join('');
  }

  // Buat HTML Summary Cards jika ada
  let summaryHtml = '';
  if (summaryCards.length > 0) {
    summaryHtml = `
      <div class="summary-section">
        <div class="summary-title">Ringkasan Laporan</div>
        <div class="summary-grid">
          ${summaryCards.map(c => `
            <div class="summary-card">
              <div class="summary-label">${escapeHtml(c.label)}</div>
              <div class="summary-val">${escapeHtml(String(c.value))}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Konten HTML Lengkap Dokumen Cetak
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(filename)}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 12mm 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #1f2937;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.45;
        }
        /* Kop Surat Resmi */
        .kop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #111827;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #991b1b;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 2px 0 0;
        }
        .contact-info {
          text-align: right;
          font-size: 10px;
          color: #4b5563;
          line-height: 1.4;
        }
        /* Judul Laporan */
        .report-header {
          margin-bottom: 12px;
        }
        .report-title {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 3px;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        .report-subtitle {
          font-size: 11px;
          color: #6b7280;
          margin: 0;
        }
        /* Metadata Grid */
        .meta-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .meta-item.full-width {
          grid-column: span 4;
          border-top: 1px dashed #e5e7eb;
          padding-top: 6px;
          margin-top: 2px;
        }
        .meta-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .meta-value {
          font-size: 11px;
          font-weight: 600;
          color: #111827;
        }
        .badge {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .badge-warning {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .badge-info {
          background-color: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        /* Tabel Data */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        thead {
          display: table-header-group;
        }
        tr {
          page-break-inside: avoid;
        }
        th {
          background: #f3f4f6;
          color: #1f2937;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 8px 10px;
          border-top: 1px solid #d1d5db;
          border-bottom: 1.5px solid #9ca3af;
        }
        td {
          padding: 7px 10px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          font-size: 10.5px;
        }
        tbody tr:nth-child(even) {
          background-color: #fafafa;
        }
        /* Ringkasan */
        .summary-section {
          margin-top: 12px;
          margin-bottom: 16px;
        }
        .summary-title {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .summary-grid {
          display: flex;
          gap: 10px;
        }
        .summary-card {
          flex: 1;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .summary-label {
          font-size: 9.5px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .summary-val {
          font-size: 13px;
          font-weight: 800;
          color: #111827;
        }
        /* Footer Cetak */
        .print-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          color: #9ca3af;
          margin-top: 16px;
        }
      </style>
    </head>
    <body>
      <!-- Kop Surat -->
      <div class="kop-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${logoSrc}" alt="Ketsai Logo" style="height: 38px; width: auto; object-fit: contain; border-radius: 4px;" />
        </div>
        <div class="contact-info">
          <div>Layanan CS: +62 851-1735-4040</div>
          <div>Instagram: @ketsai</div>
          <div>Sistem Manajemen Operasional &amp; Logistik</div>
        </div>
      </div>

      <!-- Judul Laporan -->
      <div class="report-header">
        <div class="report-title">${escapeHtml(title)}</div>
        <div class="report-subtitle">${escapeHtml(subtitle)}</div>
      </div>

      <!-- Metadata Box -->
      <div class="meta-box">
        ${metadataItems.map(m => `
          <div class="meta-item ${m.fullWidth ? 'full-width' : ''}">
            <div class="meta-label">${escapeHtml(m.label)}</div>
            <div class="meta-value">
              ${m.isBadge ? `
                <span class="badge ${m.isFiltered ? 'badge-warning' : 'badge-info'}">
                  ${escapeHtml(m.value)}
                </span>
              ` : escapeHtml(m.value)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Tabel Data -->
      <table>
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Ringkasan Metrik (Jika Ada) -->
      ${summaryHtml}

      <!-- Footer Cetak -->
      <div class="print-footer">
        <span>Dokumen resmi sistem internal Ketsai • Waktu cetak: ${escapeHtml(printDate)}</span>
        <span>Halaman 1</span>
      </div>
    </body>
    </html>
  `;

  // Gunakan iframe terisolasi agar tidak merusak DOM utama
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(htmlContent);
  frameDoc.close();

  let hasTriggered = false;
  const triggerPrint = () => {
    if (hasTriggered) return;
    hasTriggered = true;
    try {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    } catch (err) {
      console.error('Gagal mencetak dokumen:', err);
    } finally {
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }
  };

  // Tunggu gambar logo selesai dimuat sebelum memunculkan dialog cetak
  const frameImages = frameDoc.images;
  if (frameImages && frameImages.length > 0) {
    let loaded = 0;
    const total = frameImages.length;
    const onImgFinish = () => {
      loaded++;
      if (loaded >= total) {
        setTimeout(triggerPrint, 100);
      }
    };
    for (let i = 0; i < total; i++) {
      if (frameImages[i].complete) {
        onImgFinish();
      } else {
        frameImages[i].onload = onImgFinish;
        frameImages[i].onerror = onImgFinish;
      }
    }
    // Fallback timer maksimal 700ms jika event onload tertunda
    setTimeout(triggerPrint, 700);
  } else {
    setTimeout(triggerPrint, 300);
  }
}
