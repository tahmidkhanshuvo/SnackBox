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

// Optional helpers if you want auto-CSRF before mutating calls
export async function post(url, data, cfg) { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg) { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg){ await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)        { await ensureCsrf(); return apiClient.delete(url, cfg); }

export default apiClient;
