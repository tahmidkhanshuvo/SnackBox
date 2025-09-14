import React, { forwardRef } from "react";
import { useCart } from "../../context/CartContext.jsx";

const Topbar = forwardRef(function Topbar(
  { onLogout, right = null, onBrandClick, showCartIcon = false },
  ref
) {
  const { totals } = useCart();
  const count = totals?.count || 0;

  const go = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const isClickable = typeof onBrandClick === "function";
  const onBrandKey = (e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBrandClick();
    }
  };

  return (
    <>
      <style>{`
        :root{
          --sb-topbar-y: 14px;
          --sb-topbar-badge: 34px;
          --sb-pad: clamp(14px, 4vw, 28px);
          --sb-primary: var(--sb-primary, #22c55e);
          --sb-primary-700: var(--sb-primary-700, #15803d);
          --sb-accent: var(--sb-accent, #065f46);
          --sb-ring: var(--sb-ring, 0 0 0 2px rgba(34,197,94,.30));
        }
        .sb-topbar{
          position: fixed; top:0; left:0; right:0; z-index:50;
          backdrop-filter: saturate(1.2) blur(6px);
          background: rgba(255,255,255,0.85);
          border-bottom: 1px solid var(--sb-topbar-border, rgba(0,0,0,0.05));
        }
        .sb-topbar-inner{
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; padding: var(--sb-topbar-y) var(--sb-pad);
        }
        .sb-brand{
          display:flex; align-items:center; gap:10px;
          font-weight:900; letter-spacing:.4px; color:var(--sb-accent);
          font-size:1.15rem; background:transparent; border:none; outline:none;
          -webkit-tap-highlight-color: transparent;
        }
        .sb-brand.is-clickable{ cursor:pointer; }
        .sb-brand-badge{
          width: var(--sb-topbar-badge); height: var(--sb-topbar-badge);
          border-radius:10px; display:grid; place-items:center;
          background: linear-gradient(135deg, var(--sb-primary), var(--sb-primary-700));
          color:#fff; box-shadow: 0 6px 16px rgba(0,0,0,.12);
        }

        .sb-actions{ display:flex; align-items:center; gap:10px; }

        .sb-iconbtn{
          position:relative; width:40px; height:40px;
          display:grid; place-items:center;
          background:#fff; color:var(--sb-accent);
          border:1px solid rgba(0,0,0,0.08);
          border-radius:999px; cursor:pointer;
          transition: box-shadow .18s ease, transform .12s ease, border-color .18s ease, background .18s ease;
        }
        .sb-iconbtn:hover{
          box-shadow: var(--sb-ring);
          border-color: var(--sb-primary);
          transform: translateY(-1px) scale(1.03);
          background: #fff;
        }
        .sb-iconbtn:active{ transform: translateY(0); }
        .sb-iconbtn svg{ width:20px; height:20px; display:inline-block; }

        .sb-badge{
          position:absolute; top:-6px; right:-6px;
          min-width:18px; height:18px; padding:0 5px;
          background:var(--sb-primary); color:#fff; border-radius:999px;
          font-size:.72rem; font-weight:900; display:grid; place-items:center;
          box-shadow: 0 6px 16px rgba(0,0,0,.12); line-height:1;
        }
      `}</style>

      <header ref={ref} className="sb-topbar">
        <div className="sb-topbar-inner">
          <button
            className={`sb-brand ${isClickable ? "is-clickable" : ""}`}
            onClick={isClickable ? onBrandClick : undefined}
            onKeyDown={onBrandKey}
            aria-label="SnackBox Home"
            tabIndex={0}
          >
            <div className="sb-brand-badge">🍽</div>
            SnackBox
          </button>

          <div className="sb-actions">
            {/* Cart icon with live count — customers only */}
            {showCartIcon && (
              <button
                className="sb-iconbtn"
                onClick={() => go("/cart")}
                aria-label={`Open cart${count ? `, ${count} item${count>1?'s':''}` : ''}`}
                title="Cart"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 10 19h9v-2h-9l1.1-2h6.55c.76 0 1.44-.43 1.79-1.11L22 9H7.42l-.75-1.5L7 4Z"/>
                </svg>
                {count > 0 && <span className="sb-badge" aria-live="polite">{count}</span>}
              </button>
            )}

            {/* Role-based actions from Layout */}
            {right ?? (
              <button className="sb-iconbtn" onClick={onLogout} aria-label="Logout" title="Logout">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 17l1.41-1.41L14.83 13H21v-2h-6.17l2.58-2.59L16 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
});

export default Topbar;
