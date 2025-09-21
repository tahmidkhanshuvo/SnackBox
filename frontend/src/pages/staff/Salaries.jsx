// src/pages/staff/Salaries.jsx
import React, { useEffect, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient, { getMe } from "../../api/api";

function StatusPill({ status }) {
  const stMap = {
    pending: { label: "Pending", bg: "#ffedd5", fg: "#9a3412", br: "#fed7aa" },
    paid:    { label: "Paid",    bg: "#dcfce7", fg: "#065f46", br: "#bbf7d0" },
    failed:  { label: "Failed",  bg: "#ffe4e6", fg: "#9f1239", br: "#fecdd3" },
  };
  const st = stMap[String(status || "pending").toLowerCase()] || stMap.pending;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",
      borderRadius:999,background:st.bg,color:st.fg,border:`1px solid ${st.br}`,
      fontWeight:900,fontSize:12,textTransform:"capitalize",whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:999,background:st.fg,opacity:.5}}/>
      {st.label}
    </span>
  );
}

const IconBtn = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{width:34,height:34,minWidth:34,borderRadius:999,display:"grid",placeItems:"center",
      border:"1px solid var(--sb-border)",background:"var(--sb-surface)",cursor:"pointer"}}
  >
    {children}
  </button>
);
const Icon = {
  Refresh: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.5 9a9 9 0 0114.1-3.4L23 10M1 14l5.4 4.4A9 9 0 0020.5 15" />
    </svg>
  ),
};

export default function Salaries({ goto }) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ month: "", status: "" });
  const [error, setError] = useState("");

  async function fetchSalaries() {
    setLoading(true);
    setError("");
    try {
      // ✅ canonical user call (cookie-based)
      const user = await getMe();
      if (!user?.staff) throw new Error("This account is not a staff account.");
      const staffId = user.staff.id;

      // ✅ use apiClient so cookies/CSRF are consistent
      const { data } = await apiClient.get("/api/salaries", {
        params: { ...filters, staff_id: staffId },
        withCredentials: true,
      });

      const rows = Array.isArray(data?.data) ? data.data
                 : Array.isArray(data?.salaries) ? data.salaries
                 : Array.isArray(data) ? data : [];
      setSalaries(rows);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load salaries");
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSalaries(); /* eslint-disable-next-line */ }, [filters]);

  const onFilter = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <StaffLayout title="My Salaries" goto={goto}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center", marginBottom:12 }}>
        <h2 className="stf-title">My Salary History</h2>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <input
            type="text" name="month" value={filters.month} onChange={onFilter}
            placeholder="Month (YYYY-MM)"
            style={{ padding:"8px 12px", border:"1px solid var(--sb-border)", borderRadius:8, fontSize:14, width:140 }}
          />
          <select
            name="status" value={filters.status} onChange={onFilter}
            style={{ padding:"8px 12px", border:"1px solid var(--sb-border)", borderRadius:8, fontSize:14 }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <IconBtn title="Refresh" onClick={fetchSalaries}><Icon.Refresh /></IconBtn>
        </div>
      </div>

      {loading && <div style={{ padding:20 }}>Loading…</div>}
      {!loading && error && (
        <div style={{ margin:20, padding:10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:12 }}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {salaries.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--sb-muted)", padding:20 }}>
              No salary records found.
            </div>
          ) : salaries.map((s) => (
            <div key={s.id} style={{
              padding:12,borderRadius:12,border:"1px solid var(--sb-border)",
              background:"var(--sb-surface)", boxShadow:"var(--sb-shadow)", display:"flex", flexDirection:"column", gap:6
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>
                  {s.for_month ? new Date(s.for_month).toLocaleString("default", { month:"long", year:"numeric" }) : "-"}
                </div>
                <StatusPill status={s.status} />
              </div>
              <div style={{ color:"var(--sb-muted)", fontSize:13 }}>
                Amount: <strong>${Number(s.amount ?? 0).toFixed(2)}</strong>
              </div>
              <div style={{ color:"var(--sb-muted)", fontSize:13 }}>
                Paid on: {s.paid_at ? new Date(s.paid_at).toLocaleDateString() : "N/A"}
              </div>
              {s.note && <div style={{ color:"var(--sb-muted)", fontSize:12, fontStyle:"italic" }}>Note: {s.note}</div>}
              <div style={{ color:"var(--sb-muted)", fontSize:12 }}>ID: {s.id}</div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
