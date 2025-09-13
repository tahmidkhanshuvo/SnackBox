// frontend/src/api/api.js
import axios from "axios";

/**
 * Axios client configured for Laravel Sanctum SPA auth
 * - VITE_API_BASE should be your Laravel base URL, e.g. http://localhost:8000
 *   If you're proxying in Vite, set it to "" and use the dev proxy for /api & /sanctum.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// --- CSRF helper (for state-changing requests) ---
let csrfPromise = null;
export async function ensureCsrf() {
  if (!csrfPromise) csrfPromise = apiClient.get("/sanctum/csrf-cookie");
  try {
    await csrfPromise;
  } finally {
    csrfPromise = null;
  }
}

// Retry once on 419 (expired CSRF)
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    if (response?.status === 419 && !config?.__retried) {
      try {
        await ensureCsrf();
        return apiClient.request({ ...config, __retried: true });
      } catch {
        /* fall through */
      }
    }
    return Promise.reject(error);
  }
);

// Convenience wrappers that auto-ensure CSRF for mutating calls
export async function post(url, data, cfg) { await ensureCsrf(); return apiClient.post(url, data, cfg); }
export async function put (url, data, cfg) { await ensureCsrf(); return apiClient.put (url, data, cfg); }
export async function patch(url, data, cfg){ await ensureCsrf(); return apiClient.patch(url, data, cfg); }
export async function del(url, cfg)        { await ensureCsrf(); return apiClient.delete(url, cfg); }

export default apiClient;

/* ===========================
   Customer-facing endpoints
   =========================== */

/** Normalize a menu item into the shape your ProductCard expects */
export function normalizeMenuItem(row = {}) {
  // Try common field names and fall back safely
  const id    = row.id ?? row.menu_item_id ?? row.item_id;
  const name  = row.name ?? row.title ?? "Untitled";
  const price = Number(row.price ?? row.unit_price ?? 0);
  const img   = row.image_url ?? row.image ?? row.photo_url ?? row.thumbnail_url ?? "";
  const rating =
    Number(row.rating ?? row.avg_rating ?? row.rating_avg ?? row.stars ?? 0) || undefined;

  // prep_time can be minutes; ProductCard shows a range string like "25–35 min"
  const prepMin = Number(row.prep_time ?? row.prep_time_minutes ?? 0);
  const time =
    prepMin > 0 ? `${prepMin}–${prepMin + 10} min` : row.time ?? "20–30 min";

  // simple badge derivation
  const badge =
    row.badge ??
    (row.is_bestseller ? "Bestseller" : row.discount_percent ? `-${row.discount_percent}%` : undefined);

  return {
    id,
    title: name,
    price,
    rating,
    time,
    img,
    badge,
    // keep original in case a page needs extra fields later
    _raw: row,
  };
}

/** GET /api/menu-items?page=&q=&category= */
export async function getMenuItems(params = {}) {
  const query = new URLSearchParams();
  if (params.page)     query.set("page", String(params.page));
  if (params.q)        query.set("q", String(params.q));
  if (params.category) query.set("category", String(params.category));

  const url = `/api/menu-items${query.toString() ? `?${query.toString()}` : ""}`;
  const { data } = await apiClient.get(url);

  // Support both Laravel Resource pagination { data, meta } or plain arrays
  const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const items = rows.map(normalizeMenuItem);

  const meta = data?.meta ?? {
    current_page: Number(params.page ?? 1),
    per_page: items.length,
    total: items.length,
  };

  return { items, meta, raw: data };
}

/** GET /api/menu-items/{id} */
export async function getMenuItem(id) {
  const { data } = await apiClient.get(`/api/menu-items/${id}`);
  // Support { data: {...} } or plain object
  const row = data?.data ?? data ?? {};
  return normalizeMenuItem(row);
}

/** GET /api/me */
export async function getMe() {
  const { data } = await apiClient.get("/api/me");
  return data;
}
