// src/components/AdminLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMe, logout } from "../api/api";

export default function AdminLayout({ title, children }) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // ---- use the same navigation primitive as App.jsx
  const goto = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const isActive = (p) => location.pathname === p;

  // Strict admin guard (Sanctum cookie session)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await getMe();
        if (!alive) return;

        const role = String(me?.role || "").toLowerCase();
        const isAdmin = role === "admin" || role === "superadmin";

        if (!me || !isAdmin) {
          goto("/admin/login");
          return;
        }
        setUser(me);
      } catch {
        goto("/admin/login");
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nav = useMemo(
    () => [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Users",     path: "/admin/users" },
      { label: "Menu",      path: "/admin/menu" },
      { label: "Orders",    path: "/admin/orders" },
    ],
    []
  );

  const handleLogout = async () => {
    try { await logout(); } finally { goto("/admin/login"); }
  };

  return (
    <>
      <style>{`
        :root {
          --admin-ink:#0f172a; --admin-muted:#6b7280; --admin-border:#e5e7eb; --admin-white:#fff;
          --grad-a:rgba(34,211,238,.35); --grad-b:rgba(99,102,241,.35);
          --glass-bg:rgba(255,255,255,.6); --glass-bg-2:rgba(255,255,255,.5); --shadow-1:0 10px 24px -18px rgba(2,6,23,.35);
        }
        .adm-root{min-height:100vh;background:#0b1220;color:var(--admin-white);position:relative}
        .adm-aurora{position:absolute;inset:0;pointer-events:none;z-index:0}
        .adm-aurora::before,.adm-aurora::after{content:"";position:absolute;border-radius:9999px;filter:blur(50px);opacity:.45}
        .adm-aurora::before{top:-80px;left:-80px;width:320px;height:320px;background:var(--grad-a)}
        .adm-aurora::after{right:-90px;bottom:-90px;width:360px;height:360px;background:var(--grad-b)}
        .adm-topbar{position:sticky;top:0;z-index:20;height:64px;display:flex;align-items:center;backdrop-filter:blur(10px);background:linear-gradient(180deg,rgba(2,6,23,.6),rgba(2,6,23,.4));border-bottom:1px solid rgba(255,255,255,.06)}
        .adm-topbar-inner{margin:0 auto;width:min(1280px,92vw);display:flex;align-items:center;justify-content:space-between;gap:12px}
        .adm-brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.02em}
        .adm-role{font-size:12px;padding:4px 10px;border-radius:9999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#d1fae5}
        .adm-user{display:flex;align-items:center;gap:10px;color:#e5e7eb;font-size:14px}
        .adm-logout{appearance:none;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fafafa;border-radius:10px;padding:8px 12px;font-size:14px;cursor:pointer;transition:all .2s ease}
        .adm-logout:hover{background:rgba(255,255,255,.12)}
        .adm-shell{position:relative;z-index:1;width:min(1280px,92vw);margin:18px auto 28px;display:grid;grid-template-columns:260px 1fr;gap:18px}
        @media (max-width:980px){.adm-shell{grid-template-columns:1fr}}
        .adm-aside{position:sticky;top:76px;align-self:start;border-radius:18px;background:linear-gradient(135deg,var(--glass-bg),var(--glass-bg-2));backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.18);box-shadow:var(--shadow-1);padding:14px 12px}
        .adm-aside h3{margin:4px 10px 10px;color:#f1f5f9;text-transform:uppercase;font-weight:900;letter-spacing:.1em;font-size:12px;opacity:.85}
        .adm-nav{display:flex;flex-direction:column;gap:6px}
        .adm-link{appearance:none;width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid transparent;background:transparent;color:#e5e7eb;font-weight:700;cursor:pointer;transition:all .2s ease;text-align:left}
        .adm-link:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);transform:translateX(5px)}
        .adm-link.active{background:linear-gradient(90deg,rgba(34,211,238,.15),rgba(99,102,241,.15));border-color:rgba(59,130,246,.25);color:#fafafa;position:relative}
        .adm-link.active::after{content:"";position:absolute;right:10px;width:6px;height:6px;background:#22d3ee;border-radius:9999px}
        .adm-main{min-width:0}
        .adm-title{margin:0 0 12px;color:#f8fafc;font-weight:900;letter-spacing:.02em;text-transform:uppercase;font-size:clamp(1.05rem,2vw,1.3rem)}
        .adm-card{background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:var(--shadow-1);padding:clamp(14px,2vw,18px);transition:transform .2s ease, box-shadow .2s ease}
        .adm-card:hover{transform:translateY(-2px);box-shadow:0 15px 30px -12px rgba(34,211,238,.18)}
        .adm-skel{overflow:hidden;position:relative}
        .adm-skel::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);transform:translateX(-100%);animation:shimmer 1.6s infinite}
        @keyframes shimmer{100%{transform:translateX(100%)}}
      `}</style>

      <div className="adm-root">
        <div className="adm-aurora" />

        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-inner">
            <div className="adm-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l3.09 6.26L22 10.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 15.17l-5-4.9 6.91-1.01L12 3z" stroke="#a5b4fc" strokeWidth="1.5"/>
              </svg>
              <span>Admin Panel</span>
              {user?.role && <span className="adm-role">{String(user.role).toUpperCase()}</span>}
            </div>

            <div className="adm-user">
              <span>{user?.name || "—"}</span>
              <button className="adm-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>

        <div className="adm-shell">
          {/* Aside */}
          <aside className="adm-aside" aria-label="Admin navigation">
            <h3>Navigation</h3>
            <nav className="adm-nav">
              {[
                { label: "Dashboard", path: "/admin/dashboard" },
                { label: "Users",     path: "/admin/users" },
                { label: "Menu",      path: "/admin/menu" },
                { label: "Orders",    path: "/admin/orders" },
              ].map((n) => (
                <button
                  key={n.path}
                  className={`adm-link ${isActive(n.path) ? "active" : ""}`}
                  onClick={() => goto(n.path)}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <section className="adm-main">
            {title ? <h2 className="adm-title">{title}</h2> : null}
            <div className="adm-card">
              {checking ? (
                <div className="space-y-3">
                  <div className="h-9 w-48 rounded-xl bg-white/10 adm-skel" />
                  <div className="h-16 w-full rounded-xl bg-white/10 adm-skel" />
                  <div className="h-16 w-full rounded-xl bg-white/10 adm-skel" />
                </div>
              ) : (
                children
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
