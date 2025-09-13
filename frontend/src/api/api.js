// frontend/src/api/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

let csrfPromise = null;
export async function ensureCsrf() {
  if (!csrfPromise) csrfPromise = apiClient.get('/sanctum/csrf-cookie');
  try { await csrfPromise; } finally { csrfPromise = null; }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    if (response?.status === 419 && !config?.__retried) {
      try {
        await ensureCsrf();
        return apiClient.request({ ...config, __retried: true });
      } catch { /* fall through */ }
    }
    return Promise.reject(error);
  }
);

// Convenience wrappers that auto-fetch CSRF for mutating requests
export async function post(url, data, cfg) { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg) { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg){ await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)        { await ensureCsrf(); return apiClient.delete(url, cfg); }

// -------- SPA helpers (used by App & pages) --------
/** Get the current authenticated user (plain user object). */
export async function getMe() {
  const { data } = await apiClient.get('/api/auth/me'); // aliased server-side as /api/me too
  return data; // controller returns the user object directly
}

/** List menu items, normalized for Laravel Resource or raw arrays. */
export async function listMenuItems(params = {}) {
  const { data } = await apiClient.get('/api/menu-items', { params });
  // If using JsonResource pagination: { data: [...], meta, links }
  const items = Array.isArray(data) ? data : (data?.data ?? []);
  return {
    items,
    meta: data?.meta ?? null,
    links: data?.links ?? null,
  };
}

/** Get one menu item, normalized for Resource or raw. */
export async function getMenuItem(id) {
  const { data } = await apiClient.get(`/api/menu-items/${id}`);
  return data?.data ?? data;
}

export default apiClient;
