// src/pages/admin/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import apiClient, { updateOrderStatus } from "../../api/api";

const STATUSES = ["pending", "accepted", "ready", "picked_up", "completed", "cancelled"];

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await apiClient.get("/api/admin/orders").then((r) => r.data);
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      setRows(arr);
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const view = useMemo(() => {
    let v = rows;
    if (status) v = v.filter((r) => String(r.status || "").toLowerCase() === status);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      v = v.filter(
        (r) =>
          String(r.id).includes(s) ||
          String(r.user?.name || r.customer_name || "").toLowerCase().includes(s)
      );
    }
    return v;
  }, [rows, q, status]);

  const doUpdate = async (id, s) => {
    try {
      await updateOrderStatus(id, s);
      setRows((xs) => xs.map((x) => (x.id === id ? { ...x, status: s } : x)));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Update failed");
    }
  };

  const statusBadge = (s) => {
    const k = String(s || "").toLowerCase();
    const color =
      k === "completed" ? "#16a34a" :
      k === "cancelled" ? "#dc2626" :
      k === "ready" || k === "accepted" ? "#0284c7" : "#1f2937";
    return (
      <span style={{
        display:"inline-flex",alignItems:"center",gap:8,
        padding:"4px 10px",borderRadius:999,
        border:"1px solid rgba(255,255,255,.18)", color:"#fff",
        background:"rgba(255,255,255,.08)"
      }}>
        <span style={{width:6,height:6,borderRadius:999,background:color,opacity:.8}} />
        {String(s || "pending")}
      </span>
    );
  };

  return (
    <AdminLayout title="Orders">
      <style>{`
        .bar{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
        .inp,.sel{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;border-radius:10px}
        .tbl{width:100%;border-collapse:separate;border-spacing:0 10px}
        .tr{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
        .td,.th{padding:10px 12px}
        .th{opacity:.8;text-align:left}
        .btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
        .btn:hover{background:rgba(255,255,255,.12)}
        .err{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:10px;border-radius:10px;margin-bottom:12px}
      `}</style>

      {msg ? <div className="err">{msg}</div> : null}

      <div className="bar">
        <input className="inp" placeholder="Search #id or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="sel" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <div className="tr adm-skel" style={{ height: 64, borderRadius: 12 }} />
      ) : view.length === 0 ? (
        <div className="tr" style={{ padding: 12, borderRadius: 12, textAlign: "center" }}>No orders.</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th className="th">Order</th>
              <th className="th">Customer</th>
              <th className="th">Status</th>
              <th className="th">Total</th>
              <th className="th" style={{textAlign:"right"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {view.map((o) => (
              <tr key={o.id} className="tr" style={{ borderRadius: 12 }}>
                <td className="td">#{o.id}</td>
                <td className="td">{o.user?.name ?? o.customer_name ?? "—"}</td>
                <td className="td">{statusBadge(o.status)}</td>
                <td className="td">{o.total ? `$${Number(o.total).toFixed(2)}` : "—"}</td>
                <td className="td" style={{ textAlign: "right" }}>
                  {["accepted", "ready", "completed", "cancelled"].map((s) => (
                    <button key={s} className="btn" style={{ marginLeft: 6 }} onClick={() => doUpdate(o.id, s)}>{s}</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
