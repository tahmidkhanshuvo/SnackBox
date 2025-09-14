// src/components/UI/GlobalFooter.jsx
import React from "react";

/**
 * GlobalFooter (overlap-proof)
 * - Now supports `theme`: "default" | "staff" | "admin" (staff = green)
 * - Uses CSS variables; theme overrides them locally on the footer element
 */
export default function GlobalFooter({
  position = "static",
  className = "",
  theme = "default", // <— NEW
  brand = {
    name: "SnackBox",
    logo: <span style={{ fontSize: 18 }}>🍽</span>,
    tagline: "Fresh. Fast. Friendly.",
  },
  columns = [
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Blog", href: "/blog" }] },
    { title: "Support", links: [{ label: "Help Center", href: "/help" }, { label: "Contact", href: "/contact" }, { label: "Refunds", href: "/refunds" }] },
    // { title: "Legal",   links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookies", href: "/cookies" }] },
  ],
  socials = [
    { label: "X", href: "https://x.com", icon: "𝕏" },
    { label: "Instagram", href: "https://instagram.com", icon: "📸" },
    { label: "Facebook", href: "https://facebook.com", icon: "👍" },
  ],
  newsletter = {
    placeholder: "Your email",
    cta: "Subscribe",
    onSubmit: (email) => alert(`Subscribed: ${email}`),
  },
}) {
  const go = (href, handler) => (e) => {
    e.preventDefault();
    if (typeof handler === "function") return handler();
    if (!href) return;
    if (window.location.pathname !== href) {
      window.history.replaceState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const submitNewsletter = (e) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.email?.value || "").trim();
    if (!email) return;
    try { newsletter?.onSubmit?.(email); } catch {}
    e.currentTarget.reset();
  };

  const areaKey = (t) => {
    const k = String(t || "").toLowerCase().replace(/\s+/g, "");
    return ["company", "support", "legal"].includes(k) ? k : "";
  };

  return (
    <>
      <style>{`
        :root{
          /* Default (brand = red/orange) */
          --sb-primary:#ef4444;        /* main */
          --sb-primary-700:#dc2626;    /* dark */
          --sb-primary-50:#fee2e2;     /* pale */
          --sb-primary-2:#fb923c;      /* gradient partner */
          --sb-accent:#0f172a; --sb-muted:#6b7280; --sb-pad:18px;
          --sb-card-radius:18px; --sb-ring:0 0 0 3px rgba(239,68,68,.25);
          --sx-max:1200px; --sx-news-max:460px; --sx-nudge:14px;
        }

        /* ===== Theme overrides (scoped to footer subtree) ===== */
        .sx-footer[data-theme="staff"]{
          /* Green staff palette */
          --sb-primary:#22c55e;       /* emerald-500 */
          --sb-primary-700:#16a34a;   /* emerald-600 */
          --sb-primary-50:#dcfce7;    /* emerald-50  */
          --sb-primary-2:#34d399;     /* emerald-400 for gradients */
          --sb-ring:0 0 0 3px rgba(34,197,94,.25);
        }
        .sx-footer[data-theme="admin"]{
          /* Optional violet admin palette */
          --sb-primary:#4f46e5;       /* indigo-600 */
          --sb-primary-700:#4338ca;   /* indigo-700 */
          --sb-primary-50:#e0e7ff;    /* indigo-50 */
          --sb-primary-2:#60a5fa;     /* sky-400 */
          --sb-ring:0 0 0 3px rgba(79,70,229,.25);
        }

        .sx-footer{
          width:100%; color:var(--sb-accent);
          background: linear-gradient(180deg, rgba(15,23,42,.02), rgba(15,23,42,0)), #fff;
          border-top:1px solid rgba(15,23,42,.06);
        }
        .sx-footer.is-sticky{ position:sticky; bottom:0; z-index:10; }
        .sx-footer.is-fixed { position:fixed;  bottom:0; left:0; right:0; z-index:20; }

        /* Uses themed variables for the accent gradient */
        .sx-accent{ height:3px; background:linear-gradient(90deg, var(--sb-primary), var(--sb-primary-2)); opacity:.9; }

        .sx-inner{ max-width:var(--sx-max); margin:0 auto; padding:28px var(--sb-pad); display:grid; gap:28px; }
        @media (min-width:1024px){ .sx-inner{ grid-template-columns:1.2fr 2fr; align-items:start; } }

        /* Brand */
        .sx-brand{ display:grid; gap:8px; }
        .sx-brand-row{ display:flex; align-items:center; gap:12px; }
        .sx-badge{
          width:40px; height:40px; border-radius:12px; display:grid; place-items:center;
          background:linear-gradient(135deg, var(--sb-primary), var(--sb-primary-700)); color:#fff;
          box-shadow:0 10px 24px color-mix(in oklab, var(--sb-primary), transparent 70%);
        }
        .sx-brand-name{ font-weight:900; letter-spacing:.3px; font-size:1.15rem; }
        .sx-tag{ color:var(--sb-muted); font-weight:700; }

        .sx-socials{ display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .sx-social{
          display:inline-grid; place-items:center; height:36px; min-width:36px; padding:0 12px;
          border-radius:999px; background:#fff; color:var(--sb-accent);
          border:1px solid rgba(15,23,42,.08); text-decoration:none; font-weight:800;
          transition:transform .15s, box-shadow .15s, border-color .15s;
        }
        .sx-social:hover{ transform:translateY(-1px); box-shadow:0 8px 20px rgba(15,23,42,.08); border-color:var(--sb-primary); }

        /* Columns + newsletter grid */
        .sx-grid{
          display:grid; column-gap:24px; row-gap:28px; align-items:start;
        }
        @media (min-width:640px){  .sx-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (min-width:1024px){ .sx-grid{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (min-width:1280px){ .sx-grid{ grid-template-columns: repeat(4, minmax(0,1fr)); } }

        /* Explicit placement */
        @media (min-width:1024px) and (max-width:1279.98px){
          .sx-grid{ grid-template-areas:
            "company support legal"
            "news    news    news"; }
          .sx-col.company { grid-area: company; }
          .sx-col.support { grid-area: support; }
          .sx-col.legal   { grid-area: legal; }
          .sx-col.news    { grid-area: news; }
        }
        @media (min-width:1280px){
          .sx-grid{ grid-template-areas: "company support legal news"; }
          .sx-col.company { grid-area: company; }
          .sx-col.support { grid-area: support; }
          .sx-col.legal   { grid-area: legal; padding-right: var(--sx-nudge); }
          .sx-col.news    { grid-area: news; justify-self:end; }
        }

        .sx-grid > .sx-col{ min-width:0; position:relative; }

        .sx-col h4{
          margin:0 0 10px; font-size:.85rem; text-transform:uppercase; letter-spacing:.08em; color:var(--sb-accent); opacity:.9;
        }
        .sx-list{ list-style:none; margin:0; padding:0; display:grid; gap:8px; }
        .sx-link{
          color:var(--sb-accent); text-decoration:none; font-weight:700; border-radius:10px; padding:4px 0; position:relative;
        }
        .sx-link::after{
          content:""; position:absolute; left:0; right:0; bottom:0; height:2px;
          background:linear-gradient(90deg, var(--sb-primary), var(--sb-primary-2));
          transform:scaleX(0); transform-origin:left; transition:transform .2s ease; opacity:.85; border-radius:999px;
        }
        .sx-link:hover::after{ transform:scaleX(1); }

        /* Newsletter */
        .sx-letter{
          position:relative; isolation:isolate;
          background:#fff; border:1px solid rgba(15,23,42,.08); border-radius:16px; padding:12px;
          display:grid; gap:10px; box-shadow:0 10px 24px rgba(15,23,42,.06); width:100%;
          overflow:hidden;
        }
        .sx-letter p{ margin:0; color:var(--sb-muted); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .sx-field{ display:grid; grid-template-columns: minmax(220px, 1fr) auto; gap:8px; align-items:center; }
        .sx-input{
          border:1px solid rgba(15,23,42,.12); border-radius:12px; padding:10px 12px;
          font:inherit; outline:none; background:#fff; min-width:0;
        }
        .sx-input:focus{ box-shadow:var(--sb-ring); border-color:var(--sb-primary); }
        .sx-cta{
          border:none; background:linear-gradient(90deg, var(--sb-primary), var(--sb-primary-2)); color:#fff; font-weight:900;
          border-radius:12px; padding:10px 14px; cursor:pointer; box-shadow:0 10px 24px color-mix(in oklab, var(--sb-primary), transparent 70%);
          min-width:132px; transition:transform .12s, box-shadow .12s;
        }
        .sx-cta:hover{ transform:translateY(-1px); box-shadow:0 14px 28px color-mix(in oklab, var(--sb-primary), transparent 65%); }

        @media (min-width:1280px){ .sx-col.news .sx-letter { max-width: var(--sx-news-max); } }
        @media (max-width:520px){ .sx-field{ grid-template-columns:1fr; } .sx-cta{ width:100%; } }

        .sx-footer { margin-top: clamp(20px, 3vw, 40px); }
        .sx-bottom{
          border-top:1px solid rgba(15,23,42,.06);
          display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; align-items:center;
          padding:12px var(--sb-pad) 22px; color:var(--sb-muted); font-weight:700;
        }
        .sx-chips{ display:flex; flex-wrap:wrap; gap:8px; }
        .sx-chip{ background:var(--sb-primary-50); color:var(--sb-primary); padding:6px 10px; border-radius:999px; font-weight:800; }
      `}</style>

      <footer
        data-theme={theme}               // <— NEW: theme hook (e.g., "staff")
        className={[
          "sx-footer",
          position === "sticky" ? "is-sticky" : "",
          position === "fixed" ? "is-fixed" : "",
          className,
        ].join(" ")}
      >
        <div className="sx-accent" />

        <div className="sx-inner">
          {/* Brand + socials */}
          <div className="sx-brand">
            <div className="sx-brand-row">
              <div className="sx-badge">{brand.logo}</div>
              <div className="sx-brand-name">{brand.name}</div>
            </div>
            {brand.tagline ? <div className="sx-tag">{brand.tagline}</div> : null}
            {socials?.length ? (
              <div className="sx-socials" aria-label="Social links">
                {socials.map((s) => (
                  <a key={s.label} className="sx-social" href={s.href} target="_blank" rel="noreferrer" title={s.label}>
                    {s.icon ?? s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Columns + Newsletter */}
          <div className="sx-grid">
            {columns.map((col) => {
              const key = areaKey(col.title);
              return (
                <div key={col.title} className={`sx-col ${key || ""} ${/legal/i.test(col.title) ? "legal" : ""}`}>
                  <h4>{col.title}</h4>
                  <ul className="sx-list">
                    {col.links?.map((l) => (
                      <li key={l.label}>
                        <a className="sx-link" href={l.href || "#"} onClick={go(l.href, l.onClick)}>
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="sx-col news">
              <h4>Newsletter</h4>
              <form className="sx-letter" onSubmit={submitNewsletter}>
                <p>Get product updates and offers.</p>
                <div className="sx-field">
                  <input className="sx-input" type="email" name="email" placeholder={newsletter.placeholder || "Your email"} required />
                  <button className="sx-cta" type="submit">{newsletter.cta || "Subscribe"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="sx-bottom">
          <div>© {new Date().getFullYear()} {brand.name}. All rights reserved.</div>
          <div className="sx-chips">
            <span className="sx-chip">Secure checkout</span>
            <span className="sx-chip">Fast delivery</span>
            <span className="sx-chip">Fresh food</span>
          </div>
        </div>
      </footer>
    </>
  );
}
