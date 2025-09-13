import React, { useEffect, useMemo, useState } from "react";
import { CustomerTheme } from "../../components/UI";
import { listOrders, getOrder, cancelOrder } from "../../api/api";

/* ---------------- utils ---------------- */
const fmtBD = (n) => `৳ ${Number(n || 0).toLocaleString()}`;
const isActive = (s) =>
  ["accepted", "confirmed", "preparing", "ready", "out_for_delivery", "enroute"]
    .includes(String(s || "").toLowerCase());
const isPending = (s) =>
  ["pending", "created"].includes(String(s || "").toLowerCase());
const isDone = (s) =>
  ["delivered", "completed", "cancelled", "canceled", "picked_up"]
    .includes(String(s || "").toLowerCase());

const parseDate = (d) => (d ? new Date(d) : null);
const etaTargetFrom = (o) => {
  const t = parseDate(o?.estimated_ready_at || o?.eta_target_at);
  if (t) return t;
  const ref =
    parseDate(o?.accepted_at) ||
    parseDate(o?.preparation_started_at) ||
    parseDate(o?.created_at) ||
    new Date();
  const mins = Number(o?.eta_minutes || o?.eta || 20);
  return new Date(ref.getTime() + mins * 60 * 1000);
};

const sec = 1000;
const pad2 = (n) => String(n).padStart(2, "0");

function useTicker(active) {
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
}

function extractItemsLike(o) {
  if (!o) return [];
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.order_items)) return o.order_items;
  if (Array.isArray(o.lines)) return o.lines;
  return [];
}

/* Canonical read helpers for different shapes coming from API */
function itemQty(it) { return it?.quantity ?? it?.qty ?? 1; }
function itemMenu(it) { return it?.menuItem ?? it?.menu_item ?? null; }
function itemName(it) {
  const m = itemMenu(it);
  return it?.name ?? it?.item_name ?? m?.name ?? m?.item_name ?? "Item";
}
function itemImage(it) {
  const m = itemMenu(it) || it;
  let p = m?.image_url ?? m?.image ?? m?.imagePath ?? m?.image_path ?? null;
  if (!p) return null;
  if (/^https?:\/\//.test(p) || p.startsWith("/")) return p;
  // storage relative path
  return `/storage/${p}`;
}

/* ---------------- Orders page ---------------- */
export default function Orders({ goHome }) {
  const [loading, setLoading]   = useState(true);
  const [orders, setOrders]     = useState([]);
  const [error, setError]       = useState("");
  const [detail, setDetail]     = useState(null);
  const [doing, setDoing]       = useState(null); // { type, id }
  const [itemsCache, setItemsCache] = useState({}); // id -> items[]

  const refresh = async () => {
    setError("");
    try {
      const { items } = await listOrders({ per_page: 50, with: "items" });
      setOrders(Array.isArray(items) ? items : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => { refresh(); }, []);

  // background refresh every 15s
  useEffect(() => {
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);

  // hydrate missing items in the background (lightweight)
  useEffect(() => {
    const missing = orders
      .filter(o => !extractItemsLike(o).length && !itemsCache[o.id])
      .slice(0, 8);
    if (!missing.length) return;

    (async () => {
      for (const o of missing) {
        try {
          const full = await getOrder(o.id);
          const its = extractItemsLike(full);
          if (its?.length) {
            setItemsCache(prev => ({ ...prev, [o.id]: its }));
          }
        } catch {}
      }
    })();
  }, [orders, itemsCache]);

  // derived buckets
  const pending   = useMemo(() => orders.filter(o => isPending(o?.status)).sort(sortDesc), [orders]);
  const activeList= useMemo(() => orders.filter(o => isActive(o?.status)).sort(sortDesc), [orders]);
  const history   = useMemo(() => orders.filter(o => isDone(o?.status)).sort(sortDesc), [orders]);
  const current   = activeList[0] || null;

  // live countdown for current order
  const target = useMemo(() => (current ? etaTargetFrom(current) : null), [current]);
  useTicker(!!current);
  const etaLeftMs = Math.max(0, (target?.getTime?.() || Date.now()) - Date.now());
  const mm = Math.floor(etaLeftMs / (60 * sec));
  const ss = Math.floor((etaLeftMs % (60 * sec)) / sec);

  const openDetail = async (o) => {
    try {
      const full = await getOrder(o?.id);
      setDetail(full || o);
    } catch {
      setDetail(o);
    }
  };

  const onCancelPending = async (o) => {
    if (!o?.id) return;
    const ok = window.confirm(`Cancel order #${o.id}?`);
    if (!ok) return;

    const reason = window.prompt("Please tell us why you’re cancelling (optional):");
    if (reason === null) return; // user hit "Cancel" on prompt

    setDoing({ type: "cancel", id: o.id });
    try {
      await cancelOrder(o.id, reason);
      await refresh();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Cancel failed.";
      alert(msg);
    } finally {
      setDoing(null);
    }
  };

  const skeletons = Array.from({ length: 3 });

  return (
    <div className="sb-page">
      <CustomerTheme />
      <main className="sb-shell">
        {/* HERO */}
        <section className="o-hero">
          <div className="o-pill">Orders</div>
          <h1 className="o-title">Track your <span className="grad">orders</span></h1>
          <p className="o-sub">See pending, live, and past orders — tap any card to view details.</p>
          <div className="o-ctrls">
            <button className="btn ghost" onClick={refresh} aria-label="Refresh">↻ Refresh</button>
            <button className="btn" onClick={() => go("/")} aria-label="Browse menu">Browse menu</button>
          </div>
        </section>

        {/* CURRENT */}
        <section className="o-section">
          <div className="o-head">
            <h3>Current</h3>
            {current ? <span className={`chip ${mapStatus(current?.status)}`}>{labelStatus(current?.status)}</span> : <span className="muted">No active order</span>}
          </div>

          {loading ? (
            <div className="o-grid">{skeletons.map((_, i) => <Skel key={`cur${i}`} />)}</div>
          ) : current ? (
            <article className="card current" onClick={() => openDetail(current)} role="button" tabIndex={0}>
              <div className="row top">
                <div className="id">#{current.id}</div>
                <div className={`chip ${mapStatus(current.status)}`}>{labelStatus(current.status)}</div>
              </div>

              <div className="summary">{summarize(current)}</div>

              <div className="eta">
                <div className="clock">
                  <span className="mm">{pad2(mm)}</span>
                  <span>:</span>
                  <span className="ss">{pad2(ss)}</span>
                </div>
                <div className="lbl">ETA</div>
              </div>

              <Progress status={current?.status} />

              <div className="row foot">
                <div className="amt">{fmtBD(current?.total || current?.grand_total || current?.amount)}</div>
                <div className="hint">Tap to view details</div>
              </div>
            </article>
          ) : (
            <div className="empty">No active order at the moment.</div>
          )}
        </section>

        {/* PENDING */}
        <section className="o-section">
          <div className="o-head">
            <h3>Pending</h3>
            <span className="muted">{pending.length} waiting for acceptance</span>
          </div>

          {loading ? (
            <div className="o-grid">{skeletons.map((_, i) => <Skel key={`p${i}`} />)}</div>
          ) : !pending.length ? (
            <div className="empty">No pending orders.</div>
          ) : (
            <div className="o-grid">
              {pending.map((o) => (
                <article key={o.id} className="card" onClick={() => openDetail(o)} role="button" tabIndex={0}>
                  <div className="row top">
                    <div className="id">#{o.id}</div>
                    <div className={`chip ${mapStatus(o.status)}`}>{labelStatus(o.status)}</div>
                  </div>
                  <div className="summary">{summarize(o)}</div>
                  <div className="row foot">
                    <div className="amt">{fmtBD(o?.total || o?.grand_total || o?.amount)}</div>
                    <div className="gap" />
                    <button
                      className="btn danger"
                      onClick={(e) => { e.stopPropagation(); onCancelPending(o); }}
                      disabled={doing?.type === "cancel" && doing?.id === o.id}
                    >
                      {doing?.type === "cancel" && doing?.id === o.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* HISTORY */}
        <section className="o-section">
          <div className="o-head">
            <h3>History</h3>
            <span className="muted">{history.length} orders</span>
          </div>

          {loading ? (
            <div className="o-grid">{skeletons.map((_, i) => <Skel key={`h${i}`} />)}</div>
          ) : !history.length ? (
            <div className="empty">No past orders yet.</div>
          ) : (
            <div className="o-grid">
              {history.map((o) => (
                <article key={o.id} className="card" onClick={() => openDetail(o)} role="button" tabIndex={0}>
                  <div className="row top">
                    <div className="id">#{o.id}</div>
                    <div className={`chip ${mapStatus(o.status)}`}>{labelStatus(o.status)}</div>
                  </div>
                  <div className="summary">{summarize(o)}</div>
                  <div className="row foot">
                    <div className="amt">{fmtBD(o?.total || o?.grand_total || o?.amount)}</div>
                    <div className="when">{fmtWhen(o)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* DETAIL SHEET */}
        {detail && <DetailSheet order={detail} onClose={() => setDetail(null)} />}
      </main>

      <style>{styles}</style>
    </div>
  );

  /* ------- helpers (component-scoped) ------- */
  function go(path) {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function summarize(o) {
    const inlined = extractItemsLike(o);
    const cached = itemsCache[o.id];
    const arr = inlined?.length ? inlined : (cached || []);
    if (!arr.length) return <span className="muted">Fetching items…</span>;
    const parts = arr.slice(0, 3).map(it => `${itemQty(it)}× ${itemName(it)}`);
    const more = arr.length > 3 ? ` + ${arr.length - 3} more` : "";
    return parts.join(", ") + more;
  }
}

/* -------------- small components -------------- */
function Skel() { return <div className="card skel" aria-hidden="true" />; }

function Progress({ status }) {
  const steps = ["accepted", "preparing", "ready", "out_for_delivery", "delivered"];
  const s = String(status || "").toLowerCase();

  // Map backend statuses to our progress steps
  const normalize = (x) => {
    switch (x) {
      case "confirmed": return "accepted";   // backend → UI
      case "completed": return "delivered";
      case "picked_up": return "delivered";
      default: return x;
    }
  };

  const idx = Math.max(0, steps.indexOf(normalize(s)));
  return (
    <div className="prog">
      {steps.map((k, i) => (
        <div key={k} className={`dot ${i <= idx ? "on" : ""}`} aria-label={k} />
      ))}
    </div>
  );
}

function staffFrom(order) {
  return (
    order?.accepted_by?.name ||
    order?.accepted_staff?.name ||
    order?.staff?.name ||
    order?.accepted_by_name ||
    order?.handled_by_name ||
    order?.assigned_to?.name ||
    order?.assigned_to ||
    null
  );
}

function DetailSheet({ order, onClose }) {
  const items = extractItemsLike(order);
  const staff = staffFrom(order);
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true">
      <div className="sheet">
        <div className="sheet-head">
          <div className="id">Order #{order?.id}</div>
          <div className={`chip ${mapStatus(order?.status)}`}>{labelStatus(order?.status)}</div>
        </div>

        <div className="meta">
          <div><span className="muted">Placed:</span> {fmtDate(order?.created_at)}</div>
          {order?.accepted_at && <div><span className="muted">Accepted:</span> {fmtDate(order?.accepted_at)}</div>}
          {order?.delivered_at && <div><span className="muted">Delivered:</span> {fmtDate(order?.delivered_at)}</div>}
          {staff && <div><span className="muted">Staff:</span> {staff}</div>}
          {order?.note && <div><span className="muted">Customer note:</span> {order.note}</div>}
          {String(order?.status).toLowerCase().startsWith("cancel") && order?.cancel_reason &&
            <div><span className="muted">Cancel reason:</span> {order.cancel_reason}</div>}
        </div>

        <div className="list">
          {items?.length ? items.map((it, i) => {
            const nm = itemName(it);
            const img = itemImage(it);
            return (
              <div className="row item" key={i}>
                <div className="left">
                  <div className="name">{nm}</div>
                  <div className="muted small">
                    ×{itemQty(it)}
                    {it?.selections ? ` • ${flatSel(it.selections)}` : ""}
                    {it?.addons ? ` • ${flatAdd(it.addons)}` : ""}
                    {it?.comment ? ` • “${it.comment}”` : ""}
                  </div>
                </div>
                <div className="right">
                  {img ? <img className="thumb" src={img} alt={nm} /> : null}
                  <div className="amt">{fmtBD(it?.unit_price || it?.price)}</div>
                </div>
              </div>
            );
          }) : <div className="muted">No line items</div>}
        </div>

        <div className="total">
          <div><span className="muted">Subtotal</span><b>{fmtBD(order?.subtotal ?? order?.total ?? 0)}</b></div>
          {Number(order?.fees) ? <div><span className="muted">Fees</span><b>{fmtBD(order.fees)}</b></div> : null}
          {Number(order?.tax) ? <div><span className="muted">Tax</span><b>{fmtBD(order.tax)}</b></div> : null}
          <div className="grand"><span>Total</span><b>{fmtBD(order?.grand_total ?? order?.total ?? order?.amount)}</b></div>
        </div>

        <div className="sheet-actions">
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="backdrop" onClick={onClose} />
    </div>
  );
}

/* -------------- pure helpers -------------- */
function sortDesc(a, b) {
  const da = new Date(a?.updated_at || a?.created_at || 0).getTime();
  const db = new Date(b?.updated_at || b?.created_at || 0).getTime();
  return db - da;
}
function labelStatus(s) {
  const k = String(s || "").toLowerCase();
  switch (k) {
    case "pending": case "created": return "Pending";
    case "accepted": return "Accepted";
    case "confirmed": return "Confirmed";
    case "preparing": return "Preparing";
    case "ready": return "Ready";
    case "out_for_delivery": case "enroute": return "On the way";
    case "picked_up": return "Picked up";
    case "delivered": case "completed": return "Delivered";
    case "cancelled": case "canceled": return "Cancelled";
    default: return "Unknown";
  }
}
function mapStatus(s) {
  const k = String(s || "").toLowerCase();
  if (["pending", "created"].includes(k)) return "st-pending";
  if (["accepted", "confirmed", "preparing", "ready", "out_for_delivery", "enroute"].includes(k)) return "st-active";
  if (["delivered", "completed", "picked_up"].includes(k)) return "st-done";
  if (["cancelled", "canceled"].includes(k)) return "st-cancel";
  return "";
}
function fmtWhen(o) {
  const d = new Date(o?.updated_at || o?.created_at || Date.now());
  return d.toLocaleString();
}
function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}
function flatSel(obj) {
  return Object.entries(obj || {}).map(([g, c]) => `${g}:${c}`).join(", ");
}
function flatAdd(obj) {
  return Object.entries(obj || {}).flatMap(([g, arr]) => (arr || []).map((a) => `${g}:${a}`)).join(", ");
}

/* -------------- styles -------------- */
const styles = `
  .grad{background:linear-gradient(90deg,var(--sb-primary),#fb923c);-webkit-background-clip:text;background-clip:text;color:transparent}
  .muted{color:var(--sb-muted);font-weight:700}

  .o-hero{display:grid;gap:10px;margin-bottom:16px}
  .o-pill{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:.8rem;padding:6px 10px;border-radius:999px;background:var(--sb-primary-50);color:var(--sb-primary);width:max-content}
  .o-title{margin:0;font-weight:900;font-size:clamp(1.4rem,3vw,2rem);color:var(--sb-accent)}
  .o-sub{margin:0;color:var(--sb-muted);font-weight:700}
  .o-ctrls{display:flex;gap:10px;flex-wrap:wrap}

  .btn{font-weight:900;border-radius:12px;padding:10px 14px;cursor:pointer;border:1px solid rgba(0,0,0,.1);background:#fff;color:var(--sb-accent);transition:transform .12s ease, box-shadow .18s ease, border-color .18s ease}
  .btn:hover{box-shadow:var(--sb-ring);border-color:var(--sb-primary);transform:translateY(-1px)}
  .btn.ghost{background:#fff}
  .btn.danger{background:#fee2e2;border-color:#fecaca;color:#991b1b}
  .btn.danger:hover{box-shadow:0 8px 18px rgba(239,68,68,.2);border-color:#ef4444}

  .o-section{display:grid;gap:10px;margin-top:16px}
  .o-head{display:flex;align-items:center;gap:10px}
  .o-head h3{margin:0;font-size:1.02rem;color:var(--sb-accent);font-weight:900}

  .o-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
  .empty{padding:14px;border-radius:14px;border:1px dashed rgba(0,0,0,.08);background:rgba(15,23,42,.02);color:var(--sb-muted);font-weight:700}

  .card{
    background:#fff;border-radius:18px;border:1px solid rgba(0,0,0,.06);
    box-shadow:0 10px 30px rgba(0,0,0,.06);padding:14px;display:grid;gap:8px;
    transition:transform .12s ease, box-shadow .18s ease, border-color .18s ease; cursor:pointer;
  }
  .card:hover{transform:translateY(-2px); box-shadow:0 14px 34px rgba(0,0,0,.08); border-color:rgba(0,0,0,.12)}
  .card.current{background:linear-gradient(180deg,rgba(255,255,255,.8),#fff);backdrop-filter:saturate(1.3) blur(6px)}
  .card.skel{height:120px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);background-size:200% 100%;animation:sh 1.2s linear infinite;}
  @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}

  .row{display:flex;align-items:center;gap:10px}
  .row.top{justify-content:space-between}
  .row.foot{justify-content:space-between}

  .id{font-weight:900;color:var(--sb-accent)}
  .summary{color:var(--sb-accent);font-weight:700;opacity:.9}
  .amt{font-weight:900;color:var(--sb-accent)}
  .hint{color:var(--sb-muted);font-weight:700}
  .when{color:var(--sb-muted);font-weight:700}
  .gap{flex:1}

  .chip{font-size:.75rem;font-weight:900;padding:6px 10px;border-radius:999px}
  .st-pending{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}
  .st-active{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}
  .st-done{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
  .st-cancel{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}

  .eta{display:flex;align-items:center;gap:10px}
  .eta .clock{display:flex;align-items:baseline;gap:2px;font-weight:900;color:var(--sb-accent);font-size:1.1rem}
  .eta .lbl{color:var(--sb-muted);font-weight:700}

  .prog{display:flex;gap:8px;margin-top:6px}
  .prog .dot{width:10px;height:10px;border-radius:999px;background:#e5e7eb;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
  .prog .dot.on{background:linear-gradient(90deg,var(--sb-primary),#fb923c)}

  /* detail sheet */
  .sheet-wrap{position:fixed;inset:0;display:grid;place-items:end center;z-index:60}
  .backdrop{position:absolute;inset:0;background:rgba(0,0,0,.2)} /* softened */
  .sheet{
    position:relative;background:#fff;border-radius:18px 18px 0 0;width:100%;max-width:860px;
    padding:14px;border:1px solid rgba(0,0,0,.06);box-shadow:0 -14px 40px rgba(0,0,0,.2);
    animation:slideUp .18s ease both;
  }
  @keyframes slideUp{from{transform:translateY(12px);opacity:.0}to{transform:translateY(0);opacity:1}}
  @media(min-width:980px){
    .sheet{border-radius:18px; margin-top:8vh;}
    .sheet-wrap{place-items:center}
  }
  .sheet-head{display:flex;align-items:center;gap:10px;justify-content:space-between}
  .meta{display:grid;gap:4px;margin-top:6px}
  .small{font-size:.92em}
  .list{display:grid;gap:10px;margin-top:10px}
  .row.item{justify-content:space-between}
  .name{font-weight:900;color:var(--sb-accent)}
  .right{display:flex;align-items:center;gap:10px}
  .thumb{width:56px;height:56px;object-fit:cover;border-radius:12px;border:1px solid rgba(0,0,0,.06)}
  .total{display:grid;gap:8px;margin-top:12px}
  .total > div{display:flex;justify-content:space-between;align-items:center}
  .total .grand span{font-weight:900;color:var(--sb-accent)}
  .sheet-actions{display:flex;justify-content:flex-end;margin-top:10px}
`;
