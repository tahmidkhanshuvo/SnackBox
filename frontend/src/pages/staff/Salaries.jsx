import React, { useState, useEffect } from 'react';
import StaffLayout from './StaffLayout.jsx';

function StatusPill({ status }) {
  const stMap = {
    pending: { label: "Pending", bg: "#ffedd5", fg: "#9a3412", br: "#fed7aa" },
    paid: { label: "Paid", bg: "#dcfce7", fg: "#065f46", br: "#bbf7d0" },
    failed: { label: "Failed", bg: "#ffe4e6", fg: "#9f1239", br: "#fecdd3" },
  };
  const st = stMap[status] || stMap.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: st.bg, color: st.fg, border: `1px solid ${st.br}`,
      fontWeight: 900, fontSize: 12, textTransform: "capitalize", whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: st.fg, opacity: .5 }} />
      {st.label}
    </span>
  );
}

function IconBtn({ kind = "ghost", title, ariaLabel, onClick, disabled = false, children }) {
  const base = {
    width: 34, height: 34, minWidth: 34,
    borderRadius: 999, display: "grid", placeItems: "center",
    border: "1px solid transparent", cursor: "pointer", transition: "transform .12s ease",
  };
  const map = {
    primary: { ...base, background: "var(--sb-green-500)", borderColor: "var(--sb-green-500)", color: "#fff", boxShadow: "0 4px 12px -6px rgba(34,197,94,.7)" },
    outline: { ...base, background: "var(--sb-surface)", borderColor: "var(--sb-border)", color: "var(--sb-green-600)" },
    ghost: { ...base, background: "var(--sb-surface)", borderColor: "var(--sb-border)", color: "#0f172a" },
  };
  const style = { ...map[kind], opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return (
    <button
      style={style}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

const Icon = {
  Refresh: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" /></svg>,
  Calendar: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

export default function Salaries({ goto }) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: '',
    status: '',
  });
  const [error, setError] = useState(null);

  const fetchSalaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/me');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      const staffId = userData.staff?.id || userData.id;

      const query = new URLSearchParams({ ...filters, staff_id: staffId }).toString();
      const salaryResponse = await fetch(`/api/salaries?${query}`);
      if (!salaryResponse.ok) throw new Error('Failed to fetch salaries');
      const data = await salaryResponse.json();
      setSalaries(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <StaffLayout title="My Salaries" goto={goto}><div style={{ display: "flex", justifyContent: "center", margin: 20 }}><div style={{ height: 20, width: 20, border: "3px solid var(--sb-green-600)", borderTop: "3px solid transparent", borderRadius: 999, animation: "spin 1s linear infinite" }} /></div></StaffLayout>;
  if (error) return <StaffLayout title="My Salaries" goto={goto}><div style={{ margin: 20, padding: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", borderRadius: 12 }}>{error}</div></StaffLayout>;

  return (
    <StaffLayout title="My Salaries" goto={goto}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h2 className="stf-title">My Salary History</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="text"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            placeholder="Month (YYYY-MM)"
            style={{ padding: '8px 12px', border: '1px solid var(--sb-border)', borderRadius: 8, fontSize: 14, width: 140 }}
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            style={{ padding: '8px 12px', border: '1px solid var(--sb-border)', borderRadius: 8, fontSize: 14 }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <IconBtn kind="outline" onClick={fetchSalaries} title="Refresh" ariaLabel="Refresh Data">
            <Icon.Refresh />
          </IconBtn>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {salaries.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--sb-muted)", padding: 20 }}>No salary records found.</div>
        ) : (
          salaries.map((salary) => (
            <div key={salary.id} style={{
              padding: 12, borderRadius: 12, border: '1px solid var(--sb-border)', background: 'var(--sb-surface)',
              boxShadow: 'var(--sb-shadow)', display: 'flex', flexDirection: 'column', gap: 6, transition: 'all .2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {new Date(salary.for_month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <StatusPill status={salary.status} />
              </div>
              <div style={{ color: 'var(--sb-muted)', fontSize: 13 }}>
                Amount: <strong>${salary.amount}</strong>
              </div>
              <div style={{ color: 'var(--sb-muted)', fontSize: 13 }}>
                Paid on: {salary.paid_at ? new Date(salary.paid_at).toLocaleDateString() : 'N/A'}
              </div>
              {salary.note && <div style={{ color: 'var(--sb-muted)', fontSize: 12, fontStyle: 'italic' }}>Note: {salary.note}</div>}
              <div style={{ color: 'var(--sb-muted)', fontSize: 12 }}>ID: {salary.id}</div>
            </div>
          ))
        )}
      </div>
    </StaffLayout>
  );
}