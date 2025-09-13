// frontend/src/pages/customer/Cart.jsx
import React, { useMemo, useState } from "react";
import { CustomerTheme } from "../../components/UI";
import { useCart } from "../../context/CartContext.jsx";

/** Helpers */
const clamp = (n, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(Number(n || 0))));
const bd = (n) => `৳ ${Number(n || 0).toLocaleString()}`;
const unit = (l) => Number(l.price || 0) + Number(l.unitDelta || 0);

function summarize(line) {
  const sels = Object.entries(line?.selections || {});
  const adds = Object.entries(line?.addons || {}).flatMap(([k, arr]) => arr?.map((a) => `${k}:${a}`) || []);
  const parts = [];
  if (sels.length) parts.push(...sels.map(([g, c]) => `${g}: ${c}`));
  if (adds.length) parts.push(...adds.map((x) => `+ ${x}`));
  return parts.join(" • ");
}

export default function Cart({ goHome, onContinueShopping, onProfile }) {
  const { lines, totals, updateQty, removeItem, clear, checkout } = useCart();
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const empty = !lines?.length;

  const placeOrder = async () => {
    setError(""); setOk(""); setPlacing(true);
    try {
      const data = await checkout({ order_note: note });
      setOk("Order placed successfully!");
      clear();
      // Navigate home after a brief visual confirmation
      setTimeout(() => { goHome?.(); }, 600);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to place order.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="sb-page">
      <CustomerTheme />

      <main className="sb-shell">
        {/* HERO */}
        <section className="c-hero">
          <div className="c-badge">Cart</div>
          <h1 className="c-title">Review & <span className="grad">checkout</span></h1>
          <p className="c-sub">Edit quantities, add a note, and place your order securely.</p>
        </section>

        {/* EMPTY STATE */}
        {empty ? (
          <section className="c-empty">
            <div className="c-card center">
              <div className="c-empty-icon">🧺</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven’t added anything yet.</p>
              <div className="row">
                <button className="btn primary" onClick={() => onContinueShopping?.() || goHome?.()}>Browse menu</button>
                <button className="btn ghost" onClick={onProfile}>Go to profile</button>
              </div>
            </div>
          </section>
        ) : (
          <section className="c-grid">
            {/* LEFT: LINE ITEMS */}
            <div className="c-col">
              {lines.map((l) => {
                const u = unit(l);
                const lineTotal = u * clamp(l.qty);
                return (
                  <article key={l.lineId} className="c-line">
                    <div className="media">
                      <div className="thumb">
                        {l.img ? (
                          <img src={l.img} alt={l.name} />
                        ) : (
                          <div className="ph">🍽</div>
                        )}
                      </div>

                      <div className="body">
                        <div className="row head">
                          <h4 className="name" title={l.name}>{l.name}</h4>
                          <div className="price">{bd(u)}</div>
                        </div>

                        <div className="meta" title={summarize(l)}>
                          {summarize(l) || <span className="muted">No options</span>}
                        </div>

                        <div className="row foot">
                          <div className="qty">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQty(l.lineId, clamp(l.qty - 1))}
                            >−</button>
                            <div className="val" aria-live="polite">{l.qty}</div>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQty(l.lineId, clamp(l.qty + 1))}
                            >＋</button>
                          </div>

                          <div className="line-total">{bd(lineTotal)}</div>

                          <button className="remove" onClick={() => removeItem(l.lineId)} aria-label="Remove from cart">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* RIGHT: SUMMARY */}
            <aside className="c-col side">
              <div className="c-card">
                <h3 className="card-title">Order summary</h3>

                <div className="sum-row">
                  <span>Items ({totals.count})</span>
                  <b>{bd(totals.subtotal)}</b>
                </div>
                <div className="sum-row">
                  <span>Taxes & fees</span>
                  <b>{bd((totals.taxes || 0) + (totals.fees || 0))}</b>
                </div>
                <div className="sum-row total">
                  <span>Total</span>
                  <b>{bd(totals.total)}</b>
                </div>

                <div className="note">
                  <label>Note for the kitchen / rider</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., ring the doorbell, extra napkins…"
                  />
                </div>

                {error && <div className="alert err">{error}</div>}
                {ok && <div className="alert ok">{ok}</div>}

                <div className="actions">
                  <button className="btn ghost" onClick={() => onContinueShopping?.() || goHome?.()}>Continue shopping</button>
                  <button className="btn primary" disabled={placing || !totals.count} onClick={placeOrder}>
                    {placing ? "Placing…" : `Place order • ${bd(totals.total)}`}
                  </button>
                </div>
              </div>

              <div className="perk-row">
                <span className="chip">🔐 Secure checkout</span>
                <span className="chip">⚡ Fast prep</span>
                <span className="chip">🧊 Fresh food</span>
              </div>
            </aside>

            {/* MOBILE STICKY BAR */}
            <div className="mobile-bar">
              <div className="mb-total">
                <div className="label">Total</div>
                <div className="value">{bd(totals.total)}</div>
              </div>
              <button className="mb-cta" disabled={placing || !totals.count} onClick={placeOrder}>
                {placing ? "Placing…" : "Place order"}
              </button>
            </div>
          </section>
        )}

        <style>{`
          .grad{background:linear-gradient(90deg,var(--sb-primary),#fb923c);-webkit-background-clip:text;background-clip:text;color:transparent}

          .c-hero{display:grid;gap:10px;margin-bottom:16px}
          .c-badge{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:.8rem;padding:6px 10px;border-radius:999px;background:var(--sb-primary-50);color:var(--sb-primary);width:max-content}
          .c-title{margin:0;font-weight:900;font-size:clamp(1.4rem,3vw,2rem);color:var(--sb-accent)}
          .c-sub{margin:0;color:var(--sb-muted);font-weight:700}

          .c-grid{display:grid;gap:16px;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);align-items:start;padding-bottom:70px}
          @media (max-width: 940px){ .c-grid{grid-template-columns:1fr} }

          .c-col{display:grid;gap:12px}
          .c-col.side{position:relative}

          .c-card{background:#fff;border-radius:18px;border:1px solid rgba(0,0,0,.06);box-shadow:0 10px 30px rgba(0,0,0,.06);padding:14px}
          .c-card.center{display:grid;place-items:center;text-align:center;padding:26px}
          .card-title{margin:0 0 10px;font-size:1.02rem;font-weight:900;color:var(--sb-accent)}

          .c-empty-icon{font-size:44px;line-height:1;margin-bottom:2px}
          .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}

          .c-line{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,.06);overflow:hidden;animation:pop .18s ease both}
          @keyframes pop{from{transform:translateY(6px);opacity:.0}to{transform:translateY(0);opacity:1}}

          .media{display:grid;grid-template-columns:100px 1fr;gap:12px;align-items:center;padding:10px}
          @media (max-width:560px){ .media{grid-template-columns:86px 1fr} }

          .thumb{width:100px;height:100px;border-radius:14px;overflow:hidden;background:#f3f4f6;border:1px solid rgba(0,0,0,.05)}
          .thumb img{width:100%;height:100%;object-fit:cover;display:block}
          .ph{width:100%;height:100%;display:grid;place-items:center;font-size:24px;color:var(--sb-muted)}

          .body{display:grid;gap:8px}
          .row.head{display:flex;justify-content:space-between;gap:10px}
          .name{margin:0;font-weight:900;color:var(--sb-accent);font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .price{font-weight:900;color:var(--sb-accent)}

          .meta{color:var(--sb-muted);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

          .row.foot{display:flex;align-items:center;gap:10px;justify-content:space-between}
          .qty{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(0,0,0,.1);border-radius:999px;padding:6px;background:#fff}
          .qty button{border:none;background:var(--sb-primary-50);color:var(--sb-primary);width:34px;height:34px;border-radius:999px;font-weight:900;cursor:pointer}
          .qty .val{width:34px;text-align:center;font-weight:800}
          .line-total{font-weight:900;color:var(--sb-accent)}
          .remove{border:none;background:#fff;color:var(--sb-accent);border:1px solid rgba(0,0,0,.1);border-radius:10px;padding:8px 10px;cursor:pointer}
          .remove:hover{box-shadow:var(--sb-ring);border-color:var(--sb-primary)}

          .sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed rgba(0,0,0,.08)}
          .sum-row:last-of-type{border-bottom:none}
          .sum-row.total{padding-top:12px}
          .note{display:grid;gap:6px;margin-top:10px}
          .note label{font-weight:800;color:var(--sb-accent)}
          .note textarea{border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:10px;font:inherit;resize:vertical}
          .note textarea:focus{box-shadow:var(--sb-ring);border-color:var(--sb-primary)}

          .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
          .btn{font-weight:900;border-radius:12px;padding:10px 14px;cursor:pointer;border:1px solid rgba(0,0,0,.1);background:#fff;color:var(--sb-accent)}
          .btn.primary{background:linear-gradient(90deg,var(--sb-primary),#fb923c);border:none;color:#fff;box-shadow:0 8px 20px rgba(251,146,60,.35)}
          .btn.ghost{background:#fff}
          .btn:disabled{opacity:.6;cursor:not-allowed}

          .alert{padding:10px 12px;border-radius:12px;font-weight:700;margin-top:8px}
          .alert.ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
          .alert.err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}

          .perk-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
          .chip{background:var(--sb-primary-50);color:var(--sb-primary);padding:6px 10px;border-radius:999px;font-weight:800}

          /* Mobile sticky checkout bar */
          .mobile-bar{
            position:sticky;bottom:0;left:0;right:0;display:none;gap:10px;align-items:center;
            background:linear-gradient(180deg,rgba(255,255,255,.7),#fff);backdrop-filter:saturate(1.5) blur(8px);
            border-top:1px solid rgba(0,0,0,.06);padding:10px;z-index:5;border-bottom-left-radius:18px;border-bottom-right-radius:18px
          }
          .mb-total{display:grid;gap:2px}
          .mb-total .label{color:var(--sb-muted);font-weight:700}
          .mb-total .value{font-weight:900;color:var(--sb-accent)}
          .mb-cta{margin-left:auto;border:none;background:linear-gradient(90deg,var(--sb-primary),#fb923c);color:#fff;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer}
          @media (max-width: 940px){ .mobile-bar{display:flex} }
        `}</style>
      </main>
    </div>
  );
}
