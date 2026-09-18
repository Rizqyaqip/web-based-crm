import { API_BASE_URL } from '../config/api_config';

// In-memory cache untuk request GET agar tidak membebani database
const apiCache = new Map();
const DEFAULT_CACHE_TTL = 45000; // 45 detik

/**
 * Membersihkan cache API.
 * @param {string|RegExp} [pattern] - Jika diberikan, hanya membersihkan endpoint yang cocok.
 */
export function clearApiCache(pattern) {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (typeof pattern === 'string' && key.includes(pattern)) {
      apiCache.delete(key);
    } else if (pattern instanceof RegExp && pattern.test(key)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Client HTTP terpusat dengan dukungan in-memory cache, auto-invalidation, dan AbortController signal.
 */
export async function request(endpoint, options = {}) {
  const {
    headers = {},
    body,
    signal,
    skipCache = false,
    ttlMs = DEFAULT_CACHE_TTL,
    ...customConfig
  } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
  const method = (customConfig.method || (body ? 'POST' : 'GET')).toUpperCase();

  // 1. Cek In-Memory Cache untuk GET request
  const cacheKey = `${method}:${endpoint}`;
  if (method === 'GET' && !skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers
    },
    signal,
    ...customConfig
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Parse JSON dengan penanganan respon kosong
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Permintaan gagal dengan status ${response.status}`);
  }

  // 2. Simpan cache jika GET berhasil
  if (method === 'GET' && !skipCache) {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  // 3. Auto Cache Invalidation untuk mutasi (POST, PUT, PATCH, DELETE)
  // Menjamin UI selalu mendapatkan data paling mutakhir dari database setelah data diubah
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    clearApiCache();
  }

  return data;
}
