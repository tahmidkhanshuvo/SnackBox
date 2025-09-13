// src/components/UI/Topbar.jsx
import React from "react";

export default function Topbar({ onLogout, right = null, onBrandClick, onProfileClick }) {
  const isBrandClickable = typeof onBrandClick === "function";
  const brandKey = (e) => {
    if (!isBrandClickable) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBrandClick(); }
  };

  return (
    <>
      <style>{`
        .sb-topbar {
          position: sticky; top: 0; z-index: 20;
          backdrop-filter: saturate(1.2) blur(6px);
          background: rgba(255,255,255,0.85);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .sb-topbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 14px var(--sb-pad);
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
          width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--sb-primary), var(--sb-primary-700));
          color: #fff; box-shadow: var(--sb-shadow-md);
        }

        .sb-actions { display: flex; align-items: center; gap: 10px; }
        .sb-pill {
          border: 1px solid rgba(0,0,0,0.08);
          background: #fff; color: var(--sb-accent);
          padding: 8px 12px; border-radius: 999px; font-weight: 700; cursor: pointer;
        }
        .sb-pill--primary { background: var(--sb-primary); color: #fff; border: none; }

        .sb-prof-btn {
          width: 36px; height: 36px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.08);
          background: #fff; display: grid; place-items: center; cursor: pointer;
          -webkit-tap-highlight-color: transparent; outline: none;
        }
        .sb-prof-btn:focus, .sb-prof-btn:focus-visible { outline: none; box-shadow: none; }
      `}</style>

      <header className="sb-topbar">
        <div className="sb-topbar-inner sb-shell">
          <button
            className={`sb-brand ${isBrandClickable ? "is-clickable" : ""}`}
            onClick={isBrandClickable ? onBrandClick : undefined}
            onKeyDown={brandKey}
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
                <button
                  type="button"
                  className="sb-prof-btn"
                  title="Profile"
                  aria-label="Profile"
                  onClick={onProfileClick}
                >
                  👤
                </button>
                <button className="sb-pill sb-pill--primary" onClick={onLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
