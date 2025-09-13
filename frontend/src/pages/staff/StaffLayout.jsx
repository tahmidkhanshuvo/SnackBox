import React, { useMemo } from "react";

/**
 * StaffLayout
 * - Left sidebar (sticky) + right content panel
 * - Uses green/white staff theme
 * - Call with: <StaffLayout title="Orders" goto={goto}>...</StaffLayout>
 */
export default function StaffLayout({ title, children, goto }) {
  const nav = useMemo(
    () => [
      { label: "Dashboard", path: "/staff/dashboard" },
      { label: "Orders",    path: "/staff/orders" },
      { label: "Inventory", path: "/staff/inventory" },
      { label: "Menu Items",path: "/staff/menu" },
      { label: "Complaints",path: "/staff/complaints" },
    ],
    []
  );

  const current = (typeof window !== "undefined" && window.location.pathname) || "";
  const isActive = (p) => current === p;

  const go = (p) => {
    if (!p || window.location.pathname === p) return;
    window.history.replaceState({}, "", p);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <>
      <style>{`
        :root{
          --sb-green: #16a34a;
          --sb-green-600: #16a34a;
          --sb-green-500: #22c55e;
          --sb-green-100: #dcfce7;
          --sb-surface: #ffffff;
          --sb-muted: #6b7280;
          --sb-border: #e5e7eb;
          --sb-shadow: 0 10px 24px -18px rgba(2,6,23,.35);
        }
        .stf-shell{
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(12px, 2vw, 20px);
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: clamp(12px, 2vw, 20px);
        }
        @media (max-width: 980px){
          .stf-shell{ grid-template-columns: 1fr; }
          .stf-aside{ position: static; top:auto; }
        }

        .stf-aside{
          position: sticky;
          top: 12px;           /* below the fixed topbar (Layout already adds pad) */
          align-self: start;
          z-index: 2;
          background: var(--sb-surface);
          border: 1px solid var(--sb-border);
          border-radius: 18px;
          box-shadow: var(--sb-shadow);
          padding: 14px 12px;
        }
        .stf-aside h3{
          margin: 4px 10px 12px;
          color: #065f46;
          font-weight: 900;
        }
        .stf-nav{
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .stf-link{
          appearance: none;
          display: flex; align-items: center;
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: #0f172a;
          font-weight: 800;
          cursor: pointer;
        }
        .stf-link:hover{
          background: #f8fafc;
          border-color: var(--sb-border);
        }
        .stf-link.active{
          background: #ecfdf5;
          border-color: #bbf7d0;
          color: #065f46;
        }

        .stf-main{
          min-width: 0;
        }
        .stf-card{
          background: var(--sb-surface);
          border: 1px solid var(--sb-border);
          border-radius: 18px;
          box-shadow: var(--sb-shadow);
          padding: clamp(14px, 2vw, 18px);
        }
        .stf-title{
          margin: 0 0 12px 0;
          color: #0f172a;
          font-weight: 900;
          letter-spacing: .02em;
        }
      `}</style>

      <div className="stf-shell">
        {/* Sidebar */}
        <aside className="stf-aside" aria-label="Staff navigation">
          <h3>Staff</h3>
          <nav className="stf-nav">
            {nav.map((n) => (
              <button
                key={n.path}
                className={`stf-link ${isActive(n.path) ? "active" : ""}`}
                onClick={() => go(n.path)}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="stf-main">
          {title ? <h2 className="stf-title">{title}</h2> : null}
          <div className="stf-card">{children}</div>
        </section>
      </div>
    </>
  );
}
