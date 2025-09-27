// src/components/Layout.jsx
import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import Topbar from "./UI/Topbar.jsx";
import GlobalFooter from "./UI/GlobalFooter.jsx";

export default function Layout({ children, user: userProp, onLogout }) {
  const user = userProp ?? null;
  const isAuthed = !!user;

  // ---- Role precedence: admin > staff > customer/guest ----
  const role = useMemo(() => {
    const rawRole = String(user?.role || "").toLowerCase();
    const isAdmin = user?.is_admin || rawRole === "admin";
    if (isAdmin) return "admin";
    if (user?.staff) return "staff";
    if (user) return rawRole || "customer";
    return "guest";
  }, [user]);

  // Theme name follows role
  const themeName = role === "admin" ? "admin" : role === "staff" ? "staff" : "default";

  // THEME vars injected around Topbar so it picks up the palette
  const roleThemeVars = useMemo(() => {
    switch (themeName) {
      case "admin":
        return {
          ["--sb-topbar-border"]: "rgba(202, 138, 4, 0.5)", // amber-700 tint
          ["--sb-primary"]: "#facc15",         // yellow-400
          ["--sb-primary-700"]: "#ca8a04",     // amber-700
          ["--sb-accent"]: "#713f12",          // amber-900 for headings
          ["--sb-ring"]: "0 0 0 3px rgba(250, 204, 21, 0.25)",
        };
      case "staff":
        return {
          ["--sb-topbar-border"]: "rgba(16, 185, 129, 0.45)",
          ["--sb-primary"]: "#22c55e",
          ["--sb-primary-700"]: "#16a34a",
          ["--sb-accent"]: "#065f46",
          ["--sb-ring"]: "0 0 0 3px rgba(34, 197, 94, 0.25)",
        };
      default:
        return { ["--sb-topbar-border"]: "rgba(16, 185, 129, 0.35)" };
    }
  }, [themeName]);

  const go = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const rightByRole = {
    admin: (
      <>
        <button className="sb-iconbtn" onClick={() => go("/admin/dashboard")} aria-label="Dashboard" title="Dashboard">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/admin/users")} aria-label="Users" title="Users">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.54.58-2.94 1.53-4.03C10.49 12.57 9.3 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.92 1.97 3.45V19h6v-2c0-3.3-6.7-5-10-5z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/admin/menu")} aria-label="Menu" title="Menu">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/admin/orders")} aria-label="Orders" title="Orders">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7zM7 9h14v2H7zM7 13h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 9h2v2H3zM3 13h2v2H3zM3 17h2v2H3z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={onLogout} aria-label="Logout" title="Logout">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 17l1.41-1.41L14.83 13H21v-2h-6.17l2.58-2.59L16 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        </button>
      </>
    ),
    staff: (
      <>
        <button className="sb-iconbtn" onClick={() => go("/staff/shifts")} aria-label="My Shifts" title="My Shifts">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3v2M17 3v2M3 8h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/staff/salaries")} aria-label="My Salaries" title="My Salaries">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h14a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H3V7zm14 5h3"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/staff/profile")} aria-label="My Profile" title="My Profile">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 3-9 6v1h18v-1c0-3-4-6-9-6z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={onLogout} aria-label="Logout" title="Logout">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 17l1.41-1.41L14.83 13H21v-2h-6.17l2.58-2.59L16 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        </button>
      </>
    ),
    customer: (
      <>
        <button className="sb-iconbtn" onClick={() => go("/orders")} aria-label="Orders" title="Orders">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7zM7 9h14v2H7zM7 13h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 9h2v2H3zM3 13h2v2H3zM3 17h2v2H3z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/profile")} aria-label="Profile" title="Profile">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={onLogout} aria-label="Logout" title="Logout">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 17l1.41-1.41L14.83 13H21v-2h-6.17l2.58-2.59L16 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        </button>
      </>
    ),
  };

  const topRef = useRef(null);
  const [topPad, setTopPad] = useState(72);

  useLayoutEffect(() => {
    const measure = () => {
      const h = topRef.current?.getBoundingClientRect().height || 0;
      setTopPad(isAuthed ? h + 8 : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (topRef.current) ro.observe(topRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isAuthed]);

  const onBrandClick = () => go(role === "staff" ? "/staff" : role === "admin" ? "/admin" : "/");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: topPad }}>
      {isAuthed && (
        <div style={roleThemeVars}>
          <Topbar
            ref={topRef}
            onLogout={onLogout}
            onBrandClick={onBrandClick}
            showCartIcon={role === "customer"}
            right={rightByRole[role]}
            theme={themeName}
          />
        </div>
      )}

      <main style={{ flex: "1 0 auto", paddingBottom: "clamp(28px, 4vw, 72px)" }}>{children}</main>

      <div style={{ marginTop: "clamp(20px, 3vw, 40px)" }}>
        <GlobalFooter position="static" theme={themeName} />
      </div>
    </div>
  );
}
