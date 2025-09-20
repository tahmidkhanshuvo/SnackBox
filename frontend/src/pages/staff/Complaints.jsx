import React, { useEffect, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient, { patch } from "../../api/api.js";

/* ---------- Config & Helpers ---------- */
const STATUS_FILTERS = ["all", "Pending", "Assigned", "Resolved"];
const STATUS_STYLE = {
  Pending:    {bg:"#ffedd5", fg:"#9a3412", br:"#fed7aa"},
  Assigned:   {bg:"#e0f2fe", fg:"#1e3a8a", br:"#bfdbfe"},
  Resolved:   {bg:"#dcfce7", fg:"#14532d", br:"#bbf7d0"},
};

/* ---------- Icons ---------- */
const Icon = {
  Check: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12" /></svg>,
  Assign: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

/* ---------- UI Atoms ---------- */
function IconBtn({ kind="ghost", title, onClick, disabled=false, children }) {
  const base = { width: 34, height: 34, minWidth: 34, borderRadius: 999, display: "grid", placeItems: "center", border: "1px solid transparent", cursor: "pointer" };
  const map = { primary: { ...base, background:"#22c55e", borderColor:"#22c55e", color:"#fff" }, danger: { ...base, background:"#fee2e2", borderColor:"#fecaca", color:"#991b1b" }, outline: { ...base, background:"#fff", borderColor:"#e5e7eb", color:"#065f46" }, ghost: { ...base, background:"#f1f5f9", borderColor:"#e2e8f0", color:"#0f172a" } };
  const style = { ...map[kind], opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return ( <button style={style} onClick={onClick} title={title} disabled={disabled}>{children}</button> );
}

function StatusPill({ status }) {
  const s = status || "Pending";
  const st = STATUS_STYLE[s] || STATUS_STYLE.Pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:999, background: st.bg, color: st.fg, border:`1px solid ${st.br}`, fontWeight:900, fontSize:12, textTransform:"capitalize" }}>
      <span style={{width:6,height:6,borderRadius:999,background:st.fg,opacity:.5}} />{s}
    </span>
  );
}

/* ---------- Page Component ---------- */
export default function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  async function fetchComplaints() {
    setLoading(true);
    setError("");
    try {
      const params = { per_page: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await apiClient.get("/api/complaints", { params });
      setComplaints(data?.data ?? []);
      setMeta(data?.meta ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }
  
  const handleResolve = async (id) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    try {
      await patch(`/api/complaints/${id}/resolve`);
      fetchComplaints(); // Refresh list
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to resolve complaint.");
    }
  }

  return (
    <StaffLayout title="Customer Complaints">
      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding:"6px 12px", borderRadius:999, border:`1px solid ${statusFilter === s ? "#bbf7d0" : "#e5e7eb"}`, background: statusFilter === s ? "#ecfdf5" : "#fff", color: statusFilter === s ? "#065f46" : "#0f172a", fontWeight: statusFilter === s ? 900 : 700, cursor:"pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div style={{ display:"grid", gap:12 }}>
        {loading && <p>Loading complaints...</p>}
        {!loading && complaints.length === 0 && <div style={{padding:24, textAlign:"center", background:"#f8fafc", borderRadius:12}}>No complaints found for this filter.</div>}
        {!loading && complaints.map(c => (
          <div key={c.id} style={{ border:"1px solid #e5e7eb", borderRadius:12, background:"#fff", padding:16, display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:8}}>
                <StatusPill status={c.status} />
                <div style={{fontWeight:800}}>{c.user?.name || "Anonymous"}</div>
                <div style={{fontSize:14, color:"#6b7280"}}>Order #{c.order_id}</div>
              </div>
              <p style={{margin:0, color:"#334155"}}>{c.complaint_text}</p>
              <div style={{fontSize:12, color:"#6b7280", marginTop:8}}>
                  Logged: {new Date(c.created_at).toLocaleString()}
                  {c.assigned_to && ` | Assigned to: ${c.assigned_to.name}`}
                </div>
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              {c.status !== 'Resolved' && (
                  <IconBtn kind="primary" onClick={() => handleResolve(c.id)} title="Mark as Resolved"><Icon.Check/></IconBtn>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ marginTop:10, padding:10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>{error}</div>}
    </StaffLayout>
  );
}