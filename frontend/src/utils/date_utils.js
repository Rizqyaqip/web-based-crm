// Date and time formatting utilities in Indonesian locale

export function formatDateIndonesian(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDatetimeIndonesian(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeIndonesian(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Aliases for camelCase
export const formatDate = formatDateIndonesian;
export const formatDateTime = formatDatetimeIndonesian;
export const formatTime = formatTimeIndonesian;
