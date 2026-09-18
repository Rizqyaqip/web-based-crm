export function StatusBadge({ status }) {
  let badgeClass = 'badge-pending';
  if (['Selesai', 'Lunas'].includes(status)) {
    badgeClass = 'badge-success';
  } else if (['Dibatalkan', 'Gagal', 'Habis'].includes(status)) {
    badgeClass = 'badge-danger';
  } else if (['Diproses', 'Dikirim'].includes(status)) {
    badgeClass = 'badge-info';
  }

  return <span className={`badge-status ${badgeClass}`}>{status}</span>;
}
