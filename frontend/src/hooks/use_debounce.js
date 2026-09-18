import { useState, useEffect } from 'react';

/**
 * Custom hook untuk menunda pembaruan nilai (debouncing).
 * Sangat efektif untuk mencegah query berulang atau re-render berlebih saat pengetikan di input search.
 *
 * @template T
 * @param {T} value - Nilai yang akan di-debounce
 * @param {number} [delay=300] - Waktu tunda dalam milidetik
 * @returns {T} Nilai yang telah di-debounce
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
