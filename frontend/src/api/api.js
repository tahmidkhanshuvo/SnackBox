import axios from "axios";

/** Decide baseURL:
 * - In production (Render), use VITE_API_URL (https://snackbox-backend.onrender.com)
 * - In local dev, keep "" so Vite proxy handles /api + Sanctum.
 */
const isLocal =
  typeof window !== "undefined" &&
  /localhost|127\.0\.0\.1/.test(window.location.hostname);

const BASE_URL = import.meta.env.VITE_API_URL && !isLocal
  ? import.meta.env.VITE_API_URL
  : ""; // dev proxy / same-origin

const WITH_CREDENTIALS = (import.meta.env.VITE_WITH_CREDENTIALS ?? "true") === "true";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: WITH_CREDENTIALS,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let csrfPromise = null;
export async function ensureCsrf() {
  if (!csrfPromise) csrfPromise = apiClient.get("/sanctum/csrf-cookie");
  try { await csrfPromise; } finally { csrfPromise = null; }
}

// Auto-retry once on 419 (expired/missing CSRF)
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    if (response?.status === 419 && !config?.__retried) {
      try {
        await ensureCsrf();
        return apiClient.request({ ...config, __retried: true });
      } catch {}
    }
    return Promise.reject(error);
  }
);

/* ---------- convenience wrappers that auto-CSRF for mutating ---------- */
export async function post(url, data, cfg)  { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg)  { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg) { await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)         { await ensureCsrf(); return apiClient.delete(url, cfg); }

/* ================== Auth (Sanctum cookie) ================== */
export async function getMe() {
  const { data } = await apiClient.get("/api/auth/me");
  return data?.user ?? data?.data ?? data ?? null;
}

export async function login(email, password, remember = false) {
  const { data } = await post("/api/auth/login", { email, password, remember });
  return data;
}

export async function register(payload) {
  const { data } = await post("/api/auth/register", payload);
  return data;
}

export async function logout() {
  await post("/api/auth/logout");
}

/* ================== Admin ================== */
export async function adminLogin(email, password) {
  const { data } = await post("/api/admin/login", { email, password });
  return data; // cookie session → no token needed
}

export async function getPendingUsers() {
  const { data } = await apiClient.get("/api/admin/pending-users");
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function approveUser(userId) {
  const { data } = await post(`/api/admin/approve-user/${userId}`);
  return data;
}

/* ================== Menu ================== */
export async function listMenuItems(params = {}) {
  const { data } = await apiClient.get("/api/menu-items", { params });
  const items = Array.isArray(data) ? data : (data?.data ?? []);
  return { items, meta: data?.meta ?? null, links: data?.links ?? null };
}

export async function getMenuItem(id) {
  const { data } = await apiClient.get(`/api/menu-items/${id}`);
  return data?.data ?? data;
}

/* ================== Orders ================== */
export async function listOrders(params = {}) {
  const merged = { with: params.with ?? "items", ...params };
  const { data } = await apiClient.get("/api/orders", { params: merged });
  const items = Array.isArray(data) ? data : (data?.data ?? []);
  return { items, meta: data?.meta ?? null, links: data?.links ?? null };
}

export async function getOrder(id) {
  const { data } = await apiClient.get(`/api/orders/${id}`);
  return data?.data ?? data;
}

export async function cancelOrder(id, reason) {
  const payload = { status: "cancelled" };
  if (reason && String(reason).trim()) payload.reason = String(reason).trim();

  const attempts = [
    { method: "patch", url: `/api/orders/${id}/status`, data: payload },
    { method: "patch", url: `/api/orders/${id}`,        data: payload },
  ];

  let lastErr = null;
  for (const a of attempts) {
    try { const { data } = await apiClient.request(a); return data; }
    catch (e) {
      const code = e?.response?.status;
      if (code === 404 || code === 405) { lastErr = e; continue; }
      throw e;
    }
  }
  throw lastErr || new Error("No cancellation endpoint available on the API.");
}

export async function updateOrderStatus(id, status, extra = {}) {
  const payload = { status, ...extra };
  const { data } = await patch(`/api/orders/${id}/status`, payload);
  return data;
}

export default apiClient;
