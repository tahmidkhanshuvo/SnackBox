// src/pages/admin/Users.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { getPendingUsers, approveUser } from "../../api/api";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await getPendingUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        String(r.name || "").toLowerCase().includes(s) ||
        String(r.email || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const onApprove = async (id) => {
    try {
      await approveUser(id);
      setRows((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Approve failed");
    }
  };

  return (
    <AdminLayout title="Users">
      <style>{`
        .bar{display:flex;gap:8px;align-items:center;margin-bottom:12px}
        .inp{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;border-radius:10px;min-width:260px}
        .card{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
        .btn{border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.15);color:#d1fae5;border-radius:10px;padding:8px 12px;font-weight:900;cursor:pointer}
        .btn:hover{background:rgba(34,197,94,.25)}
        .muted{opacity:.8}
        .err{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:10px;border-radius:10px;margin-bottom:12px}
      `}</style>

      {msg ? <div className="err">{msg}</div> : null}

      <div className="bar">
        <input className="inp" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <div className="card adm-skel" style={{ height: 64 }} />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ justifyContent: "center" }}>No pending users.</div>
      ) : (
        filtered.map((u) => (
          <div key={u.id} className="card">
            <div style={{ display: "grid" }}>
              <strong>{u.name}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{u.email}</span>
            </div>
            <div className="muted">{u.staff?.is_active ? "STAFF" : (u.role || "pending").toUpperCase()}</div>
            <button className="btn" onClick={() => onApprove(u.id)}>Approve</button>
          </div>
        ))
      )}
    </AdminLayout>
  );
}
