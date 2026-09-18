// Currency utility formatter for Indonesian Rupiah (IDR)

export function formatIdr(number) {
  const validNumber = Number(number) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(validNumber);
}

// Aliases for camelCase
export const formatIDR = formatIdr;
