// src/pages/customer/Product.jsx
import React, { useEffect, useMemo, useState } from "react";
import { CustomerTheme } from "../../components/UI";
import { getMenuItem } from "../../api/api";
import { useCart } from "../../context/CartContext.jsx";

/**
 * Product detail page
 * - Fetches a single menu item via getMenuItem(id).
 * - Options (single-choice) and Add-ons (multi-choice) with price deltas.
 * - Special instructions.
 * - Live total = (base + options + addons) * qty.
 * - On "Add to cart" → useCart().addItem(...) then navigate to /cart.
 */
export default function Product({ productId }) {
  const derivedId = useMemo(() => {
    if (productId) return String(productId).trim();
    try {
      const qid = new URLSearchParams(window.location.search).get("id");
      if (qid) return String(qid);
      const segs = (window.location.pathname || "").split("/").filter(Boolean);
      return segs[segs.length - 1] || "";
    } catch {
      return "";
    }
  }, [productId]);

  const { addItem } = useCart();

  const [loading, setLoading]   = useState(true);
  const [item, setItem]         = useState(null);
  const [error, setError]       = useState("");

  // UI state
  const [qty, setQty]           = useState(1);
  const [single, setSingle]     = useState({});     // { groupKey: choiceKey }
  const [multi, setMulti]       = useState({});     // { groupKey: Set(choiceKey) }
  const [notes, setNotes]       = useState("");

  // Fetch product
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!derivedId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getMenuItem(derivedId);
        if (!alive) return;
        setItem(data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "Failed to load item.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [derivedId]);

  // Robust field mapping
  const name   = item?.title || item?.item_name || item?.name || "Menu item";
  const img    = item?.img
              || item?.image_url
              || (item?.image_path ? `/storage/${item.image_path}` : null)
              || "https://images.unsplash.com/photo-1551782450-17144c3a8f53?q=80&w=2000";
  const base   = Number(item?.price ?? 0);
  const rating = item?.rating ?? 4.6;
  const time   = item?.time ?? item?.preparation_time ?? "20–30 min";
  const desc   = item?.description || item?._raw?.description || "Freshly prepared with quality ingredients.";

  // Option groups
  const optionGroups = useMemo(() => {
    const apiOptions = item?._raw?.options;
    if (Array.isArray(apiOptions) && apiOptions.length) return apiOptions;
    return [
      {
        key: "size", title: "Choose size", type: "single", required: true,
        choices: [
          { key: "regular", label: "Regular",         price: 0  },
          { key: "large",   label: "Large (+60)",     price: 60 },
        ],
      },
      {
        key: "spice", title: "Spice level", type: "single", required: false,
        choices: [
          { key: "mild",    label: "Mild",            price: 0 },
          { key: "medium",  label: "Medium",          price: 0 },
          { key: "hot",     label: "Hot",             price: 0 },
        ],
      },
    ];
  }, [item]);

  const addonGroups = useMemo(() => {
    const apiAddons = item?._raw?.addons;
    if (Array.isArray(apiAddons) && apiAddons.length) return apiAddons;
    return [
      {
        key: "extras", title: "Add extras", type: "multi", max: 3,
        choices: [
          { key: "cheese",  label: "Cheese +40",      price: 40 },
          { key: "bacon",   label: "Bacon +80",       price: 80 },
          { key: "avocado", label: "Avocado +70",     price: 70 },
        ],
      },
      {
        key: "sauces", title: "Sauces (max 2)", type: "multi", max: 2,
        choices: [
          { key: "garlic",   label: "Garlic Mayo +20", price: 20 },
          { key: "chipotle", label: "Chipotle +25",    price: 25 },
          { key: "bbq",      label: "BBQ +20",         price: 20 },
        ],
      },
    ];
  }, [item]);

  // Preselect first choice for required single groups
  useEffect(() => {
    const next = { ...single };
    optionGroups.forEach(g => {
      if (g.type === "single" && g.required && !next[g.key] && g.choices?.length) {
        next[g.key] = g.choices[0].key;
      }
    });
    setSingle(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionGroups.length]);

  // Price math (keep your existing totals)
  const singleDelta = optionGroups.reduce((sum, g) => {
    if (g.type !== "single") return sum;
    const sel = single[g.key];
    const choice = g.choices?.find(c => c.key === sel);
    return sum + (choice?.price || 0);
  }, 0);

  const addonsDelta = addonGroups.reduce((sum, g) => {
    if (g.type !== "multi") return sum;
    const picked = Array.from(multi[g.key] || []);
    const groupTotal = picked.reduce((s, ck) => {
      const c = g.choices?.find(x => x.key === ck);
      return s + (c?.price || 0);
    }, 0);
    return sum + groupTotal;
  }, 0);

  // Build *priced* breakdown arrays for the cart UI
  const pricedSelections = useMemo(() => {
    return optionGroups.flatMap((g) => {
      if (g.type !== "single") return [];
      const selKey = single[g.key];
      const c = g.choices?.find((x) => x.key === selKey);
      return c ? [{
        groupKey: g.key, title: g.title,
        choiceKey: c.key, label: c.label, price: Number(c.price || 0),
      }] : [];
    });
  }, [optionGroups, single]);

  const pricedAddons = useMemo(() => {
    return addonGroups.flatMap((g) => {
      if (g.type !== "multi") return [];
      const picked = Array.from(multi[g.key] || []);
      return picked.map((ck) => {
        const c = g.choices?.find((x) => x.key === ck);
        return c ? {
          groupKey: g.key, title: g.title,
          choiceKey: c.key, label: c.label, price: Number(c.price || 0),
        } : null;
      }).filter(Boolean);
    });
  }, [addonGroups, multi]);

  const selDelta = pricedSelections.reduce((s, p) => s + p.price, 0);
  const addDelta = pricedAddons.reduce((s, p) => s + p.price, 0);

  const unitTotal = base + selDelta + addDelta;  // use priced arrays for exactness
  const grandTotal = unitTotal * qty;

  // Handlers
  const setSingleChoice = (groupKey, choiceKey) =>
    setSingle((s) => ({ ...s, [groupKey]: choiceKey }));

  const toggleMultiChoice = (groupKey, choiceKey, max) =>
    setMulti((m) => {
      const set = new Set(m[groupKey] || []);
      if (set.has(choiceKey)) set.delete(choiceKey);
      else if (!max || set.size < max) set.add(choiceKey);
      return { ...m, [groupKey]: set };
    });

  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));

  const goto = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const addToCart = () => {
    const addons = Object.fromEntries(
      Object.entries(multi).map(([k, v]) => [k, Array.from(v || [])])
    );

    // IMPORTANT: send both unitDelta *and* unitTotal to dodge the precedence bug in CartContext
    addItem({
      id: item?.id ?? derivedId,
      name,
      img,
      qty,
      price: base,
      unitDelta: selDelta + addDelta,
      unitTotal,                         // ensures correct delta if your context uses unitTotal - price
      selections: { ...single },
      addons,
      pricedSelections,                  // <— used by Cart to show amounts
      pricedAddons,                      // <— used by Cart to show amounts
      notes,
    });

    goto("/cart");
  };

  return (
    <div className="sb-page">
      <CustomerTheme />

      <main className="sb-shell">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : (
          <section className="sb-prod">
            {/* MEDIA */}
            <div className="sb-prod-media">
              <img src={img} alt={name} />
              <div className="sb-prod-badges">
                <span className="sb-chip">⭐ {rating}</span>
                <span className="sb-chip">{time}</span>
              </div>
            </div>

            {/* BODY */}
            <div className="sb-prod-body">
              <h1 className="sb-prod-title">{name}</h1>
              <p className="sb-prod-desc">{desc}</p>

              {/* Options */}
              {optionGroups.length > 0 && (
                <div className="sb-group">
                  <h3>Options</h3>
                  {optionGroups.map((g) => (
                    <div key={g.key} className="sb-field">
                      <div className="sb-field-head">
                        <span className="sb-field-title">{g.title}</span>
                        {g.required && <span className="sb-req">Required</span>}
                      </div>
                      <div className="sb-choices">
                        {g.choices?.map((c) => (
                          <label key={c.key} className={`sb-choice ${single[g.key] === c.key ? "is-active" : ""}`}>
                            <input
                              type="radio"
                              name={`single-${g.key}`}
                              checked={single[g.key] === c.key}
                              onChange={() => setSingleChoice(g.key, c.key)}
                            />
                            <span>{c.label}</span>
                            {c.price ? <em>+৳ {c.price}</em> : null}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add-ons */}
              {addonGroups.length > 0 && (
                <div className="sb-group">
                  <h3>Add-ons</h3>
                  {addonGroups.map((g) => {
                    const pickedCount = (multi[g.key]?.size || 0);
                    return (
                      <div key={g.key} className="sb-field">
                        <div className="sb-field-head">
                          <span className="sb-field-title">{g.title}</span>
                          {g.max ? <span className="sb-help">Max {g.max}</span> : null}
                        </div>
                        <div className="sb-choices">
                          {g.choices?.map((c) => {
                            const chosen = multi[g.key]?.has(c.key);
                            const disabled = !chosen && g.max && pickedCount >= g.max;
                            return (
                              <label key={c.key} className={`sb-choice ${chosen ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}>
                                <input
                                  type="checkbox"
                                  disabled={disabled}
                                  checked={!!chosen}
                                  onChange={() => toggleMultiChoice(g.key, c.key, g.max)}
                                />
                                <span>{c.label}</span>
                                {c.price ? <em>+৳ {c.price}</em> : null}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes */}
              <div className="sb-group">
                <h3>Special instructions</h3>
                <textarea
                  className="sb-notes"
                  rows={3}
                  placeholder="E.g., no onions, extra sauce…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Nutrition / Allergens (placeholders) */}
              <div className="sb-meta-grid">
                <div className="sb-card small">
                  <h4>Nutrition (per serving)</h4>
                  <ul className="sb-list">
                    <li>Energy: {item?._raw?.calories ?? 540} kcal</li>
                    <li>Protein: {item?._raw?.protein ?? 24} g</li>
                    <li>Carbs: {item?._raw?.carbs ?? 56} g</li>
                    <li>Fat: {item?._raw?.fat ?? 22} g</li>
                  </ul>
                </div>
                <div className="sb-card small">
                  <h4>Allergens</h4>
                  <div className="sb-tags">
                    {(item?._raw?.allergens ?? ["gluten", "dairy"]).map((a) => (
                      <span key={a} className="sb-tag">{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer controls */}
              <div className="sb-footer">
                <div className="sb-qty">
                  <button onClick={dec} aria-label="Decrease">−</button>
                  <div>{qty}</div>
                  <button onClick={inc} aria-label="Increase">＋</button>
                </div>
                <button className="sb-add" onClick={addToCart}>
                  Add to cart • ৳ {grandTotal.toLocaleString()}
                </button>
              </div>
            </div>

            <style>{`
              .sb-prod {
                display: grid;
                grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
                gap: 24px;
                align-items: start;
              }
              @media (max-width: 900px) {
                .sb-prod { grid-template-columns: 1fr; }
              }

              .sb-prod-media {
                position: relative;
                background: #fff; border-radius: var(--sb-card-radius);
                overflow: hidden; box-shadow: var(--sb-shadow-lg);
                border: 1px solid rgba(0,0,0,0.05);
              }
              .sb-prod-media img { width: 100%; height: clamp(260px, 40vw, 560px); object-fit: cover; display:block; }
              .sb-prod-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 8px; }
              .sb-chip {
                background: rgba(255,255,255,0.92); color: var(--sb-accent);
                font-weight: 800; font-size: .8rem; padding: 6px 10px;
                border-radius: 999px; box-shadow: var(--sb-shadow-md);
              }

              .sb-prod-body {
                background: #fff; border-radius: var(--sb-card-radius);
                box-shadow: var(--sb-shadow-md);
                border: 1px solid rgba(0,0,0,0.05);
                padding: 18px;
                display: grid; gap: 16px;
              }
              .sb-prod-title { margin: 0; font-size: clamp(1.25rem, 2.4vw, 2rem); font-weight: 900; color: var(--sb-accent); }
              .sb-prod-desc { color: var(--sb-accent); line-height: 1.55; margin-top: 4px; }

              .sb-group h3 { margin: 0 0 8px; font-size: 1rem; color: var(--sb-accent); }
              .sb-field { display: grid; gap: 8px; margin-bottom: 10px; }
              .sb-field-head { display: flex; gap: 10px; align-items: center; }
              .sb-field-title { font-weight: 800; }
              .sb-req { color: var(--sb-primary); font-weight: 800; }
              .sb-help { color: var(--sb-muted); font-weight: 700; }

              .sb-choices { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
              .sb-choice {
                display: flex; align-items: center; gap: 10px;
                border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
                padding: 10px; background: #fff; cursor: pointer;
              }
              .sb-choice input { accent-color: var(--sb-primary); }
              .sb-choice.is-active { outline: none; border-color: var(--sb-primary); box-shadow: var(--sb-ring); }
              .sb-choice.is-disabled { opacity: .55; pointer-events: none; }

              .sb-notes {
                width: 100%; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
                padding: 10px; font-family: inherit; resize: vertical;
              }

              .sb-meta-grid {
                display: grid; gap: 12px;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              }
              .sb-card.small { padding: 12px; }
              .sb-card.small h4 { margin: 0 0 8px; color: var(--sb-accent); font-size: .98rem; }
              .sb-list { list-style: none; padding: 0; margin: 0; color: var(--sb-muted); display: grid; gap: 4px; }
              .sb-tags { display: flex; flex-wrap: wrap; gap: 8px; }
              .sb-tag { background: var(--sb-primary-50); color: var(--sb-primary); padding: 6px 10px; border-radius: 999px; font-weight: 800; }

              .sb-footer {
                display: grid; grid-template-columns: max-content 1fr; gap: 12px; align-items: center;
                position: sticky; bottom: 0; background: #fff; padding-top: 8px;
              }
              .sb-qty { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(0,0,0,0.1); border-radius: 999px; padding: 6px; background: #fff; }
              .sb-qty button { border: none; background: var(--sb-primary-50); color: var(--sb-primary); width: 36px; height: 36px; border-radius: 999px; font-weight: 900; cursor: pointer; }
              .sb-qty div { width: 36px; text-align: center; font-weight: 800; }
              .sb-add { border: none; background: var(--sb-primary); color: #fff; border-radius: 12px; padding: 12px 16px; font-weight: 900; cursor: pointer; width: 100%; }
            `}</style>
          </section>
        )}
      </main>
    </div>
  );
}

/* Skeleton + error blocks */
function Skeleton() {
  return (
    <section className="sb-skel">
      <div className="img" />
      <div className="box" />
      <style>{`
        .sb-skel { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .sb-skel { grid-template-columns: 1fr; } }
        .img, .box { background: linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6); background-size: 200% 100%; animation: sh 1.2s linear infinite; border-radius: var(--sb-card-radius); height: clamp(260px, 40vw, 560px); }
        .box { height: 240px; }
        @keyframes sh { 0% {background-position: 200% 0;} 100% {background-position: -200% 0;} }
      `}</style>
    </section>
  );
}
function ErrorBlock({ message }) {
  return (
    <div className="sb-card" style={{ padding: 16 }}>
      <h3 style={{ margin: 0, color: 'var(--sb-accent)' }}>Couldn’t load item</h3>
      <p style={{ color: 'var(--sb-muted)' }}>{message}</p>
    </div>
  );
}
