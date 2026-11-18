import { API_BASE_URL } from '../config/api_config';

const apiCache = new Map();
const DEFAULT_CACHE_TTL = 45000;

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

  if (method === 'GET' && !skipCache) {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    clearApiCache();
  }

  return data;
}
