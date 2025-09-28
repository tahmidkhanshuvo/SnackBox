import axios from "axios";

/** Base URL rules
 * - On localhost: use VITE_API_URL only if VITE_FORCE_REMOTE=true
 * - In production (Render): always use VITE_API_URL
 */
const isLocal =
  typeof window !== "undefined" &&
  /localhost|127\.0\.0\.1/.test(window.location.hostname);

const FORCE_REMOTE = (import.meta.env.VITE_FORCE_REMOTE ?? "false") === "true";

const BASE_URL = isLocal
  ? (FORCE_REMOTE ? import.meta.env.VITE_API_URL : "")
  : (import.meta.env.VITE_API_URL || "");

const WITH_CREDENTIALS =
  (import.meta.env.VITE_WITH_CREDENTIALS ?? "true") === "true";

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

// If a token exists from a previous login, attach it on boot
try {
  const saved = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (saved) apiClient.defaults.headers.Authorization = `Bearer ${saved}`;
} catch { /* ignore */ }

let csrfPromise = null;
export async function ensureCsrf() {
  if (!csrfPromise) csrfPromise = apiClient.get("/sanctum/csrf-cookie");
  try { await csrfPromise; } finally { csrfPromise = null; }
}

// Retry once on 419 (expired/missing CSRF)
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

/* ---------- helpers that auto-CSRF on mutating ---------- */
export async function post(url, data, cfg)  { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg)  { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg) { await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)         { await ensureCsrf(); return apiClient.delete(url, cfg); }

/* ================== Auth (Sanctum cookie via web routes) ================== */
export async function getMe() {
  try {
    const { data } = await apiClient.get("/api/auth/me");
    return data?.user ?? data?.data ?? data ?? null;
  } catch (e) {
    if (e?.response?.status === 401) return null; // guest
    throw e;
  }
}

// Token auth fallback (no CSRF/cookies required)
export async function tokenLogin(email, password) {
  const { data } = await apiClient.post("/api/token-login", { email, password });
  return data; // { token, user }
}

export async function login(email, password, remember = false) {
  try {
    const { data } = await post("/login", { email, password, remember });
    return data;
  } catch (e) {
    const s = e?.response?.status;
    if (s === 419 || s === 401 || s === 400) {
      const { data } = await apiClient.post("/api/token-login", { email, password });
      return data; // { token, user }
    }
    throw e;
  }
}

export async function register(payload) {
  const { data } = await post("/register", payload);
  // Staff: 202 + not logged in
  if (payload?.account_type === "staff") return data;
  // If cookie session not established, get a token
  if (!data?.token) {
    const t = await apiClient.post("/api/token-login", {
      email: payload.email,
      password: payload.password,
    });
    return t.data; // { token, user }
  }
  return data;
}

export async function logout() {
  try { await post("/logout"); } catch { /* ignore */ }
}

/* ================== Admin (web route for session login) ================== */
export async function adminLogin(email, password) {
  const { data } = await post("/admin/login", { email, password });
  return data;
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
