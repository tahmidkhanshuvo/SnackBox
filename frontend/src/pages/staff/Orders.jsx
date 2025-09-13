import React, { useEffect, useMemo, useRef, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient from "../../api/api";

const STATUSES = ["all","pending","confirmed","preparing","ready","picked_up","completed","cancelled"];
const STATUS_COLORS = {
  pending:{bg:"#f3f4f6",fg:"#111827",br:"#e5e7eb"},
  confirmed:{bg:"#eff6ff",fg:"#1e3a8a",br:"#bfdbfe"},
  preparing:{bg:"#fff7ed",fg:"#9a3412",br:"#fed7aa"},
  ready:{bg:"#ecfdf5",fg:"#065f46",br:"#bbf7d0"},
  picked_up:{bg:"#ecfeff",fg:"#155e75",br:"#a5f3fc"},
  completed:{bg:"#f0fdf4",fg:"#14532d",br:"#bbf7d0"},
  cancelled:{bg:"#fff1f2",fg:"#9f1239",br:"#fecdd3"},
};
const NEXT_STATUS = { pending:"confirmed", confirmed:"preparing", preparing:"ready", ready:"picked_up", picked_up:"completed" };
const ADVANCE_LABEL = { pending:"Confirm", confirmed:"Start Prep", preparing:"Mark Ready", ready:"Picked Up", picked_up:"Complete" };

function StatusPill({ status }) {
  if (!status || status === "all") return null;
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{display:"inline-block",padding:"4px 10px",borderRadius:999,background:s.bg,color:s.fg,border:`1px solid ${s.br}`,fontWeight:700,fontSize:12}}>
    {status.replace("_"," ")}
  </span>;
}
const currency = (n) => typeof n === "number" ? `৳${n.toFixed(2)}` : "—";

export default function StaffOrders({ goto }) {
  const [status, setStatus]   = useState("pending");
  const [q, setQ]             = useState("");
  const [debouncedQ, setDQ]   = useState("");
  const [page, setPage]       = useState(1);
  const [perPage]             = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows]       = useState([]);
  const [meta, setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 });
  const [error, setError]     = useState("");

  useEffect(() => { const t = setTimeout(()=>setDQ(q.trim()),300); return ()=>clearTimeout(t); }, [q]);

  const fetchOrders = async () => {
    setLoading(true); setError("");
    try {
      const params = { per_page: perPage, page, with: "items.menuItem" };
      if (status && status !== "all") params.status = status;
      if (debouncedQ) params.q = debouncedQ;
      const { data } = await apiClient.get("/api/orders", { params });
      const { data: list, meta } = data || {};
      setRows(Array.isArray(list) ? list : []);
      setMeta(meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load orders.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, [status, debouncedQ, page, perPage]);

  const refresh = () => fetchOrders();

  const gotoDetails = (id) => {
    const clean = String(id ?? "").trim();
    if (!/^\d+$/.test(clean)) return; // guard
    goto(`/staff/orders/${clean}`);
  };

  const lineTotal = (it) => (Number(it?.unit_price)||0) * (Number(it?.quantity)||0);
  const calcTotal = (row) => typeof row?.total === "number" ? row.total : (row?.items||[]).reduce((a,i)=>a+lineTotal(i),0);

  const advanceOrder = async (row) => {
    const next = NEXT_STATUS[row.status]; if (!next) return;
    try {
      await apiClient.patch(`/api/orders/${row.id}/status`, { status: next });
      await fetchOrders();
    } catch (e) {
      const r = e?.response;
      if (r?.status === 422 && Array.isArray(r?.data?.items) && row.status === "pending" && next === "confirmed") {
        const lines = r.data.items.map(it => `• ${it.item_name ?? ("#" + it.menu_item_id)} (stock ${it.stock}, need ${it.required})`).join("\n");
        if (window.confirm(`Insufficient stock:\n${lines}\n\nForce confirm anyway (allow negative stock)?`)) {
          try {
            await apiClient.patch(`/api/orders/${row.id}/status`, { status: next, allow_negative: true });
            await fetchOrders(); return;
          } catch (e2) { alert(e2?.response?.data?.message || "Failed to confirm order."); }
        }
      } else {
        alert(r?.data?.message || "Failed to update status.");
      }
    }
  };

  const cancelOrder = async (row) => {
    const reason = window.prompt("Cancel reason (optional):") || null;
    if (!window.confirm(`Cancel order #${row.id}?`)) return;
    try {
      await apiClient.patch(`/api/orders/${row.id}/status`, { status: "cancelled", reason });
      await fetchOrders();
    } catch (e) { alert(e?.response?.data?.message || "Failed to cancel order."); }
  };

  const TableRow = ({ row }) => {
    const total = calcTotal(row);
    const canAdvance = Boolean(NEXT_STATUS[row.status]);
    return (
      <tr style={{ borderBottom: "1px solid #eee" }}>
        <td style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>#{row.id}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{row.reference || "—"}</div>
        </td>
        <td style={{ padding: 12 }}>{row?.user?.name || "—"}</td>
        <td style={{ padding: 12, textAlign: "center" }}>{row?.items_count ?? (row?.items?.length ?? 0)}</td>
        <td style={{ padding: 12, fontWeight: 700 }}>{currency(total)}</td>
        <td style={{ padding: 12 }}><StatusPill status={row.status} /></td>
        <td style={{ padding: 12, fontSize: 12, color: "#6b7280" }}>
          {row?.created_at ? new Date(row.created_at).toLocaleString() : "—"}
        </td>
        <td style={{ padding: 12, whiteSpace: "nowrap", display: "flex", gap: 8 }}>
          <button onClick={() => gotoDetails(row.id)} style={btn("ghost")} title="View">View</button>
          {canAdvance && <button onClick={() => advanceOrder(row)} style={btn("primary")} title="Advance">{ADVANCE_LABEL[row.status]}</button>}
          {row.status !== "completed" && row.status !== "cancelled" && (
            <button onClick={() => cancelOrder(row)} style={btn("danger")} title="Cancel">Cancel</button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <StaffLayout title="Orders" goto={goto}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => {
            const active = status === s;
            return (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                style={{
                  padding: "8px 12px", borderRadius: 999,
                  border: `1px solid ${active ? "#bbf7d0" : "#e5e7eb"}`,
                  background: active ? "#ecfdf5" : "#fff",
                  color: active ? "#065f46" : "#111827",
                  fontWeight: active ? 800 : 600, cursor: "pointer",
                }}>
                {s.replace("_"," ")}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input placeholder="Search by reference..." value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 220, outline: "none" }} />
          <button onClick={refresh} style={btn("outline")}>Refresh</button>
        </div>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["Order","Customer","Items","Total","Status","Placed","Actions"].map((h) => (
                <th key={h} style={{ padding: 12, fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em", color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center" }}>Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center" }}>No orders found.</td></tr>}
            {!loading && rows.map((row) => <TableRow key={row.id} row={row} />)}
          </tbody>
        </table>
      </div>

      {error && <div style={{ marginTop: 10, padding: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", borderRadius: 10 }}>{error}</div>}

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={(meta?.current_page ?? 1) <= 1 || loading} style={btn("outline")}>Prev</button>
          <button onClick={() => setPage((p) => Math.min(meta?.last_page ?? p + 1, (meta?.current_page ?? 1) + 1))} disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1) || loading} style={btn("outline")}>Next</button>
        </div>
      </div>
    </StaffLayout>
  );
}

function btn(kind) {
  if (kind === "primary") return { padding:"8px 12px", borderRadius:10, border:"1px solid #22c55e", background:"#22c55e", color:"#fff", fontWeight:800, cursor:"pointer" };
  if (kind === "danger")  return { padding:"8px 12px", borderRadius:10, border:"1px solid #fecaca", background:"#fee2e2", color:"#991b1b", fontWeight:800, cursor:"pointer" };
  if (kind === "outline") return { padding:"8px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", color:"#065f46", fontWeight:800, cursor:"pointer" };
  return { padding:"8px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"#ffffff", color:"#111827", fontWeight:700, cursor:"pointer" };
}
