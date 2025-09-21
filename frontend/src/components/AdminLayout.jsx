// src/components/AdminLayout.jsx
import React, { useMemo } from "react";

export default function AdminLayout({ title, children, goto }) {
  const nav = useMemo(
    () => [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Users", path: "/admin/users" },
      { label: "Menu", path: "/admin/menu" },
      { label: "Orders", path: "/admin/orders" },
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
        :root {
          --admin-yellow: #facc15;
          --admin-yellow-600: #facc15;
          --admin-yellow-500: #fde047;
          --admin-yellow-100: #fefcbf;
          --admin-white: #ffffff;
          --admin-muted: #6b7280;
          --admin-border: #e5e7eb;
          --admin-shadow: 0 10px 24px -18px rgba(2, 6, 23, 0.35);
        }
        .adm-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(12px, 2vw, 20px);
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: clamp(12px, 2vw, 20px);
        }
        @media (max-width: 980px) {
          .adm-shell { grid-template-columns: 1fr; }
          .adm-aside { position: static; top: auto; }
        }

        .adm-aside {
          position: sticky;
          top: 72px; /* Account for Topbar height */
          align-self: start;
          z-index: 2;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          backdrop-filter: blur(10px);
          border: 1px solid var(--admin-border);
          border-radius: 18px;
          box-shadow: var(--admin-shadow);
          padding: 14px 12px;
          transition: transform 0.2s ease;
        }
        .adm-aside h3 {
          margin: 4px 10px 12px;
          color: #713f12;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .adm-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .adm-link {
          appearance: none;
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: #0f172a;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .adm-link:hover {
          background: rgba(254, 252, 191, 0.5);
          border-color: rgba(253, 230, 138, 0.5);
          transform: translateX(5px);
        }
        .adm-link.active {
          background: linear-gradient(90deg, #fefcbf, #fde047);
          border-color: #fde68a;
          color: #713f12;
          position: relative;
        }
        .adm-link.active::after {
          content: "";
          position: absolute;
          right: 10px;
          width: 6px;
          height: 6px;
          background: #ca8a04;
          border-radius: 50%;
        }

        .adm-main {
          min-width: 0;
        }
        .adm-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95));
          backdrop-filter: blur(8px);
          border: 1px solid var(--admin-border);
          border-radius: 18px;
          box-shadow: var(--admin-shadow);
          padding: clamp(14px, 2vw, 18px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .adm-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -12px rgba(202, 138, 4, 0.3);
        }
        .adm-title {
          margin: 0 0 12px 0;
          color: #713f12;
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: clamp(1.2rem, 2vw, 1.5rem);
        }
      `}</style>

      <div className="adm-shell">
        <aside className="adm-aside" aria-label="Admin navigation">
          <h3>Admin</h3>
          <nav className="adm-nav">
            {nav.map((n) => (
              <button
                key={n.path}
                className={`adm-link ${isActive(n.path) ? "active" : ""}`}
                onClick={() => go(n.path)}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="adm-main">
          {title ? <h2 className="adm-title">{title}</h2> : null}
          <div className="adm-card">{children}</div>
        </section>
      </div>
    </>
  );
}