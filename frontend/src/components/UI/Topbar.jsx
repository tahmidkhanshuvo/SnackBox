// src/components/UI/Topbar.jsx
import React, { forwardRef } from "react";

const Topbar = forwardRef(function Topbar(
  { onLogout, right = null, onBrandClick },
  ref
) {
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
        /* Keep the original compact size, but make it easy to tweak */
        :root{
          --sb-topbar-y: 14px;      /* vertical padding (height driver) */
          --sb-topbar-badge: 34px;  /* logo square size */
        }

        .sb-topbar {
          /* CHANGED: sticky -> fixed so it never scrolls away */
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          backdrop-filter: saturate(1.2) blur(6px);
          background: rgba(255,255,255,0.85);
          border-bottom: 1px solid var(--sb-topbar-border, rgba(0,0,0,0.05));
        }
        .sb-topbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: var(--sb-topbar-y) var(--sb-pad);
        }
        .sb-brand {
          display: flex; align-items: center; gap: 10px;
          font-weight: 900; letter-spacing: .4px;
          color: var(--sb-accent); font-size: 1.15rem;
          outline: none; border: none; background: transparent;
          -webkit-tap-highlight-color: transparent;
        }
        .sb-brand.is-clickable { cursor: pointer; }
        .sb-brand:focus, .sb-brand:focus-visible { outline: none !important; box-shadow: none !important; border: none !important; }
        .sb-brand::-moz-focus-inner { border: 0; }

        .sb-brand-badge {
          width: var(--sb-topbar-badge); height: var(--sb-topbar-badge);
          border-radius: 10px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--sb-primary), var(--sb-primary-700));
          color: #fff; box-shadow: var(--sb-shadow-md);
        }

        .sb-actions { display: flex; align-items: center; gap: 10px; }
        .sb-pill {
          border: 1px solid rgba(0,0,0,0.08);
          background: #fff; color: var(--sb-accent);
          padding: 8px 12px; border-radius: 999px; font-weight: 700;
          cursor: pointer;
        }
        .sb-pill--primary { background: var(--sb-primary); color: #fff; border: none; }
      `}</style>

      <header ref={ref} className="sb-topbar">
        <div className="sb-topbar-inner sb-shell">
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
            {right ?? (
              <>
                <button className="sb-pill">Orders</button>
                <button className="sb-pill">Cart</button>
                <button className="sb-pill sb-pill--primary" onClick={onLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
});

export default Topbar;
