import React, { useEffect, useMemo, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient from "../../api/api";

/* ---------- config ---------- */
const STATUSES = ["all","pending","confirmed","preparing","ready","picked_up","completed","cancelled"];
const NEXT_STATUS = { pending:"confirmed", confirmed:"preparing", preparing:"ready", ready:"picked_up", picked_up:"completed" };
const ADVANCE_LABEL = { pending:"Confirm", confirmed:"Start Prep", preparing:"Ready", ready:"Picked Up", picked_up:"Complete" };
const STATUS_STYLE = {
  pending:    {bg:"#f1f5f9", fg:"#111827", br:"#e5e7eb"},
  confirmed:  {bg:"#e0f2fe", fg:"#1e3a8a", br:"#bfdbfe"},
  preparing:  {bg:"#ffedd5", fg:"#9a3412", br:"#fed7aa"},
  ready:      {bg:"#dcfce7", fg:"#065f46", br:"#bbf7d0"},
  picked_up:  {bg:"#cffafe", fg:"#155e75", br:"#a5f3fc"},
  completed:  {bg:"#dcfce7", fg:"#14532d", br:"#bbf7d0"},
  cancelled:  {bg:"#ffe4e6", fg:"#9f1239", br:"#fecdd3"},
};
const currency = (n) => typeof n === "number" ? `৳${n.toFixed(2)}` : "—";

/* ---------- tiny atoms ---------- */
const Icon = {
  Search: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" /></svg>,
  Eye: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Next: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Prev: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="20 6 9 17 4 12" /></svg>,
};

function IconBtn({ kind="ghost", title, ariaLabel, onClick, disabled=false, children }) {
  const base = {
    width: 34, height: 34, minWidth: 34,
    borderRadius: 999, display: "grid", placeItems: "center",
    border: "1px solid transparent", cursor: "pointer", transition: "transform .12s ease",
  };
  const map = {
    primary: { ...base, background:"#22c55e", borderColor:"#22c55e", color:"#fff", boxShadow:"0 4px 12px -6px rgba(34,197,94,.7)" },
    danger:  { ...base, background:"#fee2e2", borderColor:"#fecaca", color:"#991b1b" },
    outline: { ...base, background:"#fff", borderColor:"#e5e7eb", color:"#065f46" },
    ghost:   { ...base, background:"#fff", borderColor:"#e5e7eb", color:"#0f172a" },
  };
  const style = { ...map[kind], opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return (
    <button
      style={style}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      onMouseDown={(e)=>{ e.currentTarget.style.transform="scale(.98)"; }}
      onMouseUp={(e)=>{ e.currentTarget.style.transform="scale(1)"; }}
    >
      {children}
    </button>
  );
}

function StatusPill({ s }) {
  const st = STATUS_STYLE[s] || STATUS_STYLE.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"4px 10px", borderRadius:999,
      background: st.bg, color: st.fg, border:`1px solid ${st.br}`,
      fontWeight:900, fontSize:12, textTransform:"capitalize", whiteSpace:"nowrap"
    }}>
      <span style={{width:6,height:6,borderRadius:999,background:st.fg,opacity:.5}} />
      {s.replace("_"," ")}
    </span>
  );
}

/* ---------- page ---------- */
export default function StaffOrders({ goto }) {
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(fetchOrders, 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, page, perPage]);

  async function fetchOrders() {
    setLoading(true); setError("");
    try {
      const params = { per_page: perPage, page, with: "items.menuItem" };
      if (status !== "all") params.status = status;
      if (q.trim()) params.q = q.trim();
      const { data } = await apiClient.get("/api/orders", { params });
      const { data: list, meta } = data || {};
      setRows(Array.isArray(list) ? list : []);
      setMeta(meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  const gotoDetails = (id) => /^\d+$/.test(String(id)) && goto(`/staff/orders/${id}`);
  const lineTotal = (it) => (Number(it?.unit_price)||0) * (Number(it?.quantity)||0);
  const calcTotal  = (row) => typeof row?.total === "number" ? row.total : (row?.items||[]).reduce((a,i)=>a+lineTotal(i),0);

  async function advanceOrder(row) {
    const next = NEXT_STATUS[row.status]; if (!next) return;
    try { await apiClient.patch(`/api/orders/${row.id}/status`, { status: next }); fetchOrders(); }
    catch (e) {
      const r = e?.response;
      if (r?.status === 422 && Array.isArray(r?.data?.items) && row.status === "pending" && next === "confirmed") {
        const lines = r.data.items.map(it => `• ${it.item_name ?? ("#" + it.menu_item_id)} (stock ${it.stock}, need ${it.required})`).join("\n");
        if (window.confirm(`Insufficient stock:\n${lines}\n\nForce confirm anyway (allow negative stock)?`)) {
          try { await apiClient.patch(`/api/orders/${row.id}/status`, { status: next, allow_negative: true }); fetchOrders(); }
          catch (e2) { alert(e2?.response?.data?.message || "Failed to confirm order."); }
        }
      } else { alert(r?.data?.message || "Failed to update status."); }
    }
  }
  async function cancelOrder(row) {
    const reason = window.prompt("Cancel reason (optional):") || null;
    if (!window.confirm(`Cancel order #${row.id}?`)) return;
    try { await apiClient.patch(`/api/orders/${row.id}/status`, { status: "cancelled", reason }); fetchOrders(); }
    catch (e) { alert(e?.response?.data?.message || "Failed to cancel order."); }
  }

  /* ----- toolbar (compact) ----- */
  const Toolbar = useMemo(() => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center", marginBottom:10 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {STATUSES.map(s => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              style={{
                padding:"6px 10px", borderRadius:999,
                border:`1px solid ${active ? "#bbf7d0" : "#e5e7eb"}`,
                background: active ? "#ecfdf5" : "#fff",
                color: active ? "#065f46" : "#0f172a",
                fontWeight: active ? 900 : 700, letterSpacing: ".02em",
                cursor:"pointer", fontSize:12
              }}
              title={`Show ${s}`}
            >
              {s.replace("_"," ")}
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"center", justifyContent:"flex-end" }}>
        <div style={{ position:"relative" }}>
          <input
            value={q}
            onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search by reference…"
            style={{
              padding:"8px 32px 8px 30px", minWidth:220,
              borderRadius:10, border:"1px solid #e5e7eb", outline:"none",
              fontWeight:700, fontSize:13
            }}
          />
          <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", opacity:.65 }}><Icon.Search/></span>
          {q.trim() && (
            <button onClick={()=>setQ("")} title="Clear" style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)",
              background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, padding:2, cursor:"pointer" }}>
              <Icon.X/>
            </button>
          )}
        </div>
        {/* icon-only refresh */}
        <IconBtn kind="outline" onClick={fetchOrders} title="Refresh">
          <Icon.Refresh/>
        </IconBtn>
      </div>
    </div>
  ), [status, q]);

  return (
    <StaffLayout title="Orders">
      {Toolbar}

      {/* table card (compact) */}
      <div style={{ border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"#f8fafc" }}>
          <strong style={{ fontSize:12, letterSpacing:".04em", textTransform:"uppercase", color:"#334155" }}>
            Order queue
          </strong>
          <span style={{ fontSize:12, color:"#64748b" }}>{meta?.total ?? 0} result{(meta?.total||0)===1?"":"s"}</span>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Order","Customer","Items","Total","Status","Placed",""].map(h=>(
                  <th key={h} style={{ padding:8, textAlign:"left", fontSize:12, color:"#6b7280", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (<>
                <Sk/><Sk/><Sk/>
              </>)}

              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} style={{ padding:18, textAlign:"center", color:"#64748b" }}>No orders found.</td></tr>
              )}

              {!loading && rows.map(row => {
                const total = calcTotal(row);
                const canAdvance = Boolean(NEXT_STATUS[row.status]);
                return (
                  <tr key={row.id} style={{ borderTop:"1px solid #eef2f7" }}>
                    <td style={{ padding:8 }}>
                      <div style={{ fontWeight:900, color:"#0f172a" }}>#{row.id}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{row.reference || "—"}</div>
                    </td>
                    <td style={{ padding:8 }}>{row?.user?.name || "—"}</td>
                    <td style={{ padding:8, textAlign:"center" }}>{row?.items_count ?? (row?.items?.length ?? 0)}</td>
                    <td style={{ padding:8, fontWeight:900 }}>{currency(total)}</td>
                    <td style={{ padding:8 }}><StatusPill s={row.status} /></td>
                    <td style={{ padding:8, fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                      {row?.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding:6, whiteSpace:"nowrap" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <IconBtn kind="ghost" onClick={()=>gotoDetails(row.id)} title="View order" ariaLabel={`View order #${row.id}`}>
                          <Icon.Eye/>
                        </IconBtn>
                        {canAdvance && (
                          <IconBtn kind="primary" onClick={()=>advanceOrder(row)} title={ADVANCE_LABEL[row.status]} ariaLabel={`${ADVANCE_LABEL[row.status]} #${row.id}`}>
                            <Icon.Check />
                          </IconBtn>
                        )}
                        {row.status !== "completed" && row.status !== "cancelled" && (
                          <IconBtn kind="danger" onClick={()=>cancelOrder(row)} title="Cancel order" ariaLabel={`Cancel order #${row.id}`}>
                            <Icon.Trash/>
                          </IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:12, color:"#6b7280" }}>
          Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <IconBtn kind="outline" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={(meta?.current_page ?? 1) <= 1 || loading} title="Previous page" ariaLabel="Previous page">
            <Icon.Prev/>
          </IconBtn>
          <IconBtn kind="outline" onClick={()=>setPage(p=>Math.min(meta?.last_page ?? p+1, (meta?.current_page ?? 1) + 1))} disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1) || loading} title="Next page" ariaLabel="Next page">
            <Icon.Next/>
          </IconBtn>
        </div>
      </div>

      {error && <div style={{ marginTop:10, padding:10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>{error}</div>}
    </StaffLayout>
  );
}

/* compact skeleton */
function Sk(){
  return (
    <tr>
      {Array.from({length:7}).map((_,i)=>(
        <td key={i} style={{ padding:8 }}>
          <div style={{ height:10, width: i===0?80:i===3?60:i===4?90:100, background:"#eef2f7", borderRadius:999 }} />
        </td>
      ))}
    </tr>
  );
}
