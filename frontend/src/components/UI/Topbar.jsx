// src/components/UI/Topbar.jsx
import React from "react";

export default function Topbar({ onLogout, right = null }) {
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
        .sb-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: .4px; color: var(--sb-accent); font-size: 1.15rem; }
        .sb-brand-badge {
          width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--sb-primary), var(--sb-primary-700));
          color: #fff; box-shadow: var(--sb-shadow-md);
        }
        .sb-actions { display: flex; align-items: center; gap: 10px; }
      `}</style>

      <header className="sb-topbar">
        <div className="sb-topbar-inner sb-shell">
          <div className="sb-brand">
            <div className="sb-brand-badge">🍽</div>
            SnackBox
          </div>
          <div className="sb-actions">
            {right ?? (
              <>
                <button className="sb-pill">Orders</button>
                <button className="sb-pill">Cart</button>
                <button className="sb-pill sb-pill--primary" onClick={onLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
