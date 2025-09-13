import React, { useEffect, useMemo, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient from "../../api/api";

const NEXT_STATUS = { pending:"confirmed", confirmed:"preparing", preparing:"ready", ready:"picked_up", picked_up:"completed" };
const ADVANCE_LABEL = { pending:"Confirm", confirmed:"Start Prep", preparing:"Mark Ready", ready:"Picked Up", picked_up:"Complete" };
const STATUS_COLORS = {
  pending:{bg:"#f3f4f6",fg:"#111827",br:"#e5e7eb"},
  confirmed:{bg:"#eff6ff",fg:"#1e3a8a",br:"#bfdbfe"},
  preparing:{bg:"#fff7ed",fg:"#9a3412",br:"#fed7aa"},
  ready:{bg:"#ecfdf5",fg:"#065f46",br:"#bbf7d0"},
  picked_up:{bg:"#ecfeff",fg:"#155e75",br:"#a5f3fc"},
  completed:{bg:"#f0fdf4",fg:"#14532d",br:"#bbf7d0"},
  cancelled:{bg:"#fff1f2",fg:"#9f1239",br:"#fecdd3"},
};

function Pill({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ padding:"4px 10px", borderRadius:999, background:s.bg, color:s.fg, border:`1px solid ${s.br}`, fontWeight:800, fontSize:12, textTransform:"capitalize" }}>
    {String(status||"").replace("_"," ")}
  </span>;
}
const currency = (n) => typeof n === "number" ? `৳${n.toFixed(2)}` : "—";

export default function OrderDetails({ orderId, goto }) {
  const validId = /^\d+$/.test(String(orderId || ""));
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const fetchOne = async () => {
    if (!validId) return;
    setLoading(true); setErr("");
    try {
      const { data } = await apiClient.get(`/api/orders/${orderId}`);
      setOrder(data);
    } catch (e) { setErr(e?.response?.data?.message || "Failed to load order."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOne(); /* eslint-disable-next-line */ }, [orderId]);

  const lineTotal = (it) => (Number(it?.unit_price)||0) * (Number(it?.quantity)||0);
  const totals = useMemo(() => {
    if (!order) return { subtotal:0, tax:0, discount:0, total:0 };
    if (typeof order.total === "number") return {
      subtotal: order.subtotal ?? 0, tax: order.tax ?? 0, discount: order.discount ?? 0, total: order.total ?? 0
    };
    const subtotal = (order?.items||[]).reduce((a,i)=>a+lineTotal(i),0);
    return { subtotal, tax:0, discount:0, total: subtotal };
  }, [order]);

  const back = () => goto("/staff/orders");

  const advance = async () => {
    if (!order) return;
    const next = NEXT_STATUS[order.status]; if (!next) return;
    try {
      await apiClient.patch(`/api/orders/${order.id}/status`, { status: next });
      await fetchOne();
    } catch (e) {
      const r = e?.response;
      if (r?.status === 422 && Array.isArray(r?.data?.items) && order.status === "pending" && next === "confirmed") {
        const lines = r.data.items.map(it => `• ${it.item_name ?? ("#" + it.menu_item_id)} (stock ${it.stock}, need ${it.required})`).join("\n");
        if (window.confirm(`Insufficient stock:\n${lines}\n\nForce confirm anyway (allow negative stock)?`)) {
          try {
            await apiClient.patch(`/api/orders/${order.id}/status`, { status: next, allow_negative: true });
            await fetchOne(); return;
          } catch (e2) { alert(e2?.response?.data?.message || "Failed to confirm order."); }
        }
      } else {
        alert(r?.data?.message || "Failed to update status.");
      }
    }
  };

  const cancel = async () => {
    if (!order) return;
    const reason = window.prompt("Cancel reason (optional):") || null;
    if (!window.confirm(`Cancel order #${order.id}?`)) return;
    try {
      await apiClient.patch(`/api/orders/${order.id}/status`, { status: "cancelled", reason });
      await fetchOne();
    } catch (e) { alert(e?.response?.data?.message || "Failed to cancel order."); }
  };

  const canAdvance = order && Boolean(NEXT_STATUS[order.status]);
  const canCancel  = order && order.status !== "completed" && order.status !== "cancelled";

  if (!validId) {
    return (
      <StaffLayout title="Order" goto={goto}>
        <div style={{ padding: 12, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>
          Invalid order ID.
        </div>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => goto('/staff/orders')} style={{ padding:"8px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" }}>
            ← Back to Orders
          </button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title={`Order #${orderId}`} goto={goto}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={back} style={btn("outline")}>← Back</button>
        {order && <Pill status={order.status} />}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {canAdvance && <button onClick={advance} style={btn("primary")}>{ADVANCE_LABEL[order.status]}</button>}
          {canCancel && <button onClick={cancel} style={btn("danger")}>Cancel</button>}
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {err && !loading && <div style={{ padding: 10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>{err}</div>}

      {!loading && order && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Reference</div>
              <div style={{ fontWeight: 800 }}>{order.reference || "—"}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Customer</div>
              <div style={{ fontWeight: 800 }}>{order?.user?.name || "—"}</div>
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  {["Item","Qty","Unit","Line"].map((h) => (
                    <th key={h} style={{ padding: 12, fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em", color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items?.map((it) => (
                  <tr key={it.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{it?.menu_item?.item_name || `#${it.menu_item_id}`}</div>
                      {it?.note && <div style={{ fontSize: 12, color: "#6b7280" }}>{it.note}</div>}
                    </td>
                    <td style={{ padding: 12 }}>{it.quantity}</td>
                    <td style={{ padding: 12 }}>{currency(Number(it.unit_price)||0)}</td>
                    <td style={{ padding: 12, fontWeight: 800 }}>{currency(lineTotal(it))}</td>
                  </tr>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <tr><td colSpan={4} style={{ padding: 16, textAlign: "center" }}>No items.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginLeft: "auto", minWidth: 280, background: "#f8fafc", borderRadius: 12, padding: 12 }}>
            <Row label="Subtotal" value={currency(totals.subtotal)} />
            <Row label="Tax" value={currency(totals.tax)} />
            <Row label="Discount" value={currency(totals.discount)} />
            <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />
            <Row label="Total" value={currency(totals.total)} strong />
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
      <div style={{ color: "#6b7280" }}>{label}</div>
      <div style={{ fontWeight: strong ? 900 : 700 }}>{value}</div>
    </div>
  );
}

function btn(kind) {
  if (kind === "primary") return { padding:"8px 12px", borderRadius:10, border:"1px solid #22c55e", background:"#22c55e", color:"#fff", fontWeight:900, cursor:"pointer" };
  if (kind === "danger")  return { padding:"8px 12px", borderRadius:10, border:"1px solid #fecaca", background:"#fee2e2", color:"#991b1b", fontWeight:900, cursor:"pointer" };
  return { padding:"8px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", color:"#065f46", fontWeight:900, cursor:"pointer" };
}
