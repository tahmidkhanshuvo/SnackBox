// src/api/api.js
import axios from "axios";

/**
 * We keep baseURL empty so requests are relative to the frontend origin.
 * This matches your working setup (Vite proxy → Laravel) and fixes CSRF.
 */
const apiClient = axios.create({
  baseURL: "",                  // IMPORTANT: keep empty to use the dev proxy
  withCredentials: true,        // send/receive Sanctum cookies
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
  // payload: { name, email, password, password_confirmation, account_type: 'customer'|'staff' }
  const { data } = await post("/api/auth/register", payload);
  return data;
}

export async function logout() {
  await post("/api/auth/logout");
}

/* ================== Admin ================== */
export async function adminLogin(email, password) {
  // IMPORTANT: the admin endpoint lives under /api/admin/login
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
    { method: "patch", url: `/api/orders/${id}/status`, data: payload }, // primary
    { method: "patch", url: `/api/orders/${id}`,        data: payload }, // alias
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
