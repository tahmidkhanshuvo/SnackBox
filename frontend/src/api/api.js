import axios from "axios";

/** ---------- base URL & cookie settings ---------- */
const isLocal =
  typeof window !== "undefined" &&
  /localhost|127\.0\.0\.1/.test(window.location.hostname);

const FORCE_REMOTE = (import.meta.env.VITE_FORCE_REMOTE ?? "false") === "true";
const BASE_URL = isLocal
  ? (FORCE_REMOTE ? import.meta.env.VITE_API_URL : "")
  : (import.meta.env.VITE_API_URL || "");

const WITH_CREDENTIALS =
  (import.meta.env.VITE_WITH_CREDENTIALS ?? "true") === "true";

/** ---------- axios instance ---------- */
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

/** ---------- token header helpers (for stateless fallback) ---------- */
function setAuthToken(token) {
  if (!token) return;
  try { localStorage.setItem("token", token); } catch {}
  apiClient.defaults.headers.Authorization = `Bearer ${token}`;
}
function clearAuthToken() {
  try { localStorage.removeItem("token"); } catch {}
  delete apiClient.defaults.headers.Authorization;
}
// attach saved bearer on boot
try {
  const saved = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (saved) setAuthToken(saved);
} catch {}

/** ---------- CSRF warmup ---------- */
let csrfPromise = null;

// Helper to extract CSRF token from cookie and set it explicitly on axios
// This works around axios not automatically setting the header in some environments
function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const xsrfCookie = cookies.find((row) => row.startsWith("XSRF-TOKEN="));
  if (!xsrfCookie) return null;
  return decodeURIComponent(xsrfCookie.split("=")[1]);
}

export async function ensureCsrf() {
  if (!WITH_CREDENTIALS) return; // not needed when not using cookies
  if (!csrfPromise) csrfPromise = apiClient.get("/sanctum/csrf-cookie");
  try {
    await csrfPromise;
    // Explicitly set the CSRF token header after fetching the cookie
    const token = getCsrfToken();
    if (token) {
      apiClient.defaults.headers["X-XSRF-TOKEN"] = token;
    }
  } finally {
    csrfPromise = null;
  }
}

/** ---------- auto-retry once on 419 ---------- */
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

/** ---------- convenience wrappers (mutations auto-CSRF) ---------- */
export async function post(url, data, cfg)  { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg)  { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg) { await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)         { await ensureCsrf(); return apiClient.delete(url, cfg); }

/* ================== Auth ================== */
export async function getMe() {
  try {
    const { data } = await apiClient.get("/api/auth/me");
    return data?.user ?? data?.data ?? data ?? null;
  } catch (e) {
    if (e?.response?.status === 401) return null;
    throw e;
  }
}

/** Stateless token login (no cookies) */
export async function tokenLogin(email, password) {
  const { data } = await apiClient.post("/api/token-login", { email, password });
  if (data?.token) setAuthToken(data.token);
  return data; // { token, user }
}

/** Cookie login (preferred). On success, refresh CSRF because session was regenerated. */
export async function login(email, password, remember = false) {
  try {
    await ensureCsrf(); // for submitting the login
    const { data } = await post("/login", { email, password, remember });
    await ensureCsrf(); // IMPORTANT: new XSRF cookie bound to the *new* session
    return data;
  } catch (e) {
    const s = e?.response?.status;
    if ([419, 401, 400].includes(s)) {
      // fallback to stateless token auth
      return await tokenLogin(email, password);
    }
    throw e;
  }
}

/** Cookie register (preferred). Refresh CSRF afterwards if a session was created. */
export async function register(payload) {
  try {
    await ensureCsrf(); // for submitting register
    const { data } = await post("/register", payload);
    // Customers auto-login → session regen → need a *fresh* XSRF cookie
    if (payload?.account_type !== "staff") await ensureCsrf();
    return data;
  } catch (e) {
    const s = e?.response?.status;
    if ([419, 401, 400].includes(s)) {
      // stateless registration (no cookies/CSRF)
      const { data } = await apiClient.post("/api/token-register", payload);
      if (payload?.account_type !== "staff" && data?.token) setAuthToken(data.token);
      return data; // staff => 202 + message; customer => { token, user }
    }
    throw e;
  }
}

export async function logout() {
  // cookie session logout (best-effort)
  try { await post("/logout"); } catch {}
  // token logout (best-effort)
  try { await apiClient.post("/api/token-logout"); } catch {}
  clearAuthToken();
}

/* ================== Admin (cookie session) ================== */
export async function adminLogin(email, password) {
  await ensureCsrf();
  const { data } = await post("/admin/login", { email, password });
  await ensureCsrf(); // new admin session → refresh CSRF
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

/* ================== Menu / Orders ================== */
export async function listMenuItems(params = {}) {
  const { data } = await apiClient.get("/api/menu-items", { params });
  const items = Array.isArray(data) ? data : (data?.data ?? []);
  return { items, meta: data?.meta ?? null, links: data?.links ?? null };
}
export async function getMenuItem(id) {
  const { data } = await apiClient.get(`/api/menu-items/${id}`);
  return data?.data ?? data;
}

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
