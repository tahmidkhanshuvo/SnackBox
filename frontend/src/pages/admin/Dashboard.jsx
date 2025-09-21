// src/pages/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import {
  getPendingUsers,
  adminLogin, // (keeps tree-shakable; not used here, but harmless)
  listMenuItems,
} from "../../api/api";
import apiClient, { updateOrderStatus } from "../../api/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cards, setCards] = useState({
    menuCount: 0,
    pendingUsers: 0,
    ordersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingPreview, setPendingPreview] = useState([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        // Pull everything we can from the admin endpoints
        const [pending, menu, orders] = await Promise.all([
          getPendingUsers().catch(() => []),
          listMenuItems().catch(() => ({ items: [] })),
          apiClient.get("/api/admin/orders").then((r) => r.data).catch(() => []),
        ]);

        if (!alive) return;

        const items = Array.isArray(menu?.items) ? menu.items : (menu || []);
        const ord = Array.isArray(orders) ? orders : (orders?.data || []);
        const last5 = ord.slice(0, 5);

        setCards({
          menuCount: items.length,
          pendingUsers: Array.isArray(pending) ? pending.length : 0,
          ordersCount: ord.length,
        });
        setRecentOrders(last5);
        setPendingPreview(Array.isArray(pending) ? pending.slice(0, 5) : []);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load data");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const statusColor = (s) => {
    const k = String(s || "").toLowerCase();
    if (k === "completed" || k === "ready" || k === "accepted") return "#16a34a";
    if (k === "cancelled") return "#dc2626";
    return "#1f2937";
  };

  const quickActions = useMemo(
    () => ["accepted", "ready", "completed", "cancelled"],
    []
  );

  const doStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setRecentOrders((rows) =>
        rows.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to update status");
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <style>{`
        .adm-grid{display:grid;gap:14px}
        @media(min-width:900px){.adm-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        .adm-kpi{border-radius:16px;padding:16px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.14)}
        .adm-kpi h4{margin:0 0 6px;font-weight:900;opacity:.9}
        .adm-kpi .v{font-size:26px;font-weight:900}
        .adm-col{display:grid;gap:14px;margin-top:16px}
        .row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
        .pill{display:inline-flex;gap:8px;align-items:center;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);font-weight:800}
        .btns{display:flex;gap:6px;flex-wrap:wrap}
        .btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
        .btn:hover{background:rgba(255,255,255,.12)}
        .err{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:10px;border-radius:10px;margin-bottom:12px}
      `}</style>

      {err ? <div className="err">{err}</div> : null}

      <div className="adm-grid">
        <div className="adm-kpi">
          <h4>Total Menu Items</h4>
          <div className="v">{cards.menuCount}</div>
        </div>
        <div className="adm-kpi">
          <h4>Pending Approvals</h4>
          <div className="v">{cards.pendingUsers}</div>
        </div>
        <div className="adm-kpi">
          <h4>Total Orders</h4>
          <div className="v">{cards.ordersCount}</div>
        </div>
      </div>

      <div className="adm-col">
        <h3 className="adm-title" style={{ textTransform: "none" }}>Recent Orders</h3>
        {loading ? (
          <div className="row adm-skel" style={{ height: 64 }} />
        ) : recentOrders.length === 0 ? (
          <div className="row" style={{ justifyContent: "center", color: "#cbd5e1" }}>No orders yet.</div>
        ) : (
          recentOrders.map((o) => (
            <div key={o.id} className="row">
              <div style={{ fontWeight: 900 }}>#{o.id}</div>
              <div className="pill" style={{ borderColor: "transparent", background: "transparent", color: statusColor(o.status) }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor(o.status), opacity: .7 }} />
                {String(o.status || "pending").toUpperCase()}
              </div>
              <div style={{ flex: 1, textAlign: "right", opacity: .9 }}>
                {o.user?.name ?? o.customer_name ?? "—"}
              </div>
              <div className="btns">
                {quickActions.map((s) => (
                  <button key={s} className="btn" onClick={() => doStatus(o.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="adm-col">
        <h3 className="adm-title" style={{ textTransform: "none" }}>Pending Users</h3>
        {loading ? (
          <div className="row adm-skel" style={{ height: 56 }} />
        ) : pendingPreview.length === 0 ? (
          <div className="row" style={{ justifyContent: "center", color: "#cbd5e1" }}>None 🎉</div>
        ) : (
          pendingPreview.map((u) => (
            <div key={u.id} className="row">
              <div style={{ display: "grid" }}>
                <strong>{u.name}</strong>
                <span style={{ opacity: .8, fontSize: 13 }}>{u.email}</span>
              </div>
              <div className="pill">{u.role || "pending"}</div>
              <div style={{ flex: 1 }} />
              <a className="btn" href="/admin/users" onClick={(e) => { e.preventDefault(); window.history.replaceState({}, "", "/admin/users"); window.dispatchEvent(new PopStateEvent("popstate")); }}>Manage</a>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
