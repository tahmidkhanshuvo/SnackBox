import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import Topbar from "./UI/Topbar.jsx";
import GlobalFooter from "./UI/GlobalFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children, user: userProp, onLogout }) {
  let ctxUser = null;
  try { ctxUser = typeof useAuth === "function" ? useAuth()?.user : null; } catch {}
  const user = userProp ?? ctxUser ?? null;
  const isAuthed = !!user;

  const role = useMemo(() => {
    const r =
      user?.role ??
      (user?.is_admin ? "admin" : user?.staff ? "staff" : user ? "customer" : "guest");
    return String(r || "guest").toLowerCase();
  }, [user]);

  // THEME: staff = green/white
  const roleThemeVars = useMemo(() => {
    switch (role) {
      case "admin":
        return { ["--sb-topbar-border"]: "rgba(24,24,27,.45)" };
      case "staff":
        return {
          ["--sb-topbar-border"]: "rgba(22,163,74,.35)", // green tint under topbar
          ["--sb-primary"]: "#22c55e",          // green-500
          ["--sb-primary-700"]: "#15803d",      // green-700
          ["--sb-accent"]: "#065f46",           // teal/green heading text
          ["--sb-ring"]: "0 0 0 2px rgba(34,197,94,.30)", // hover/focus glow
        };
      case "customer":
        return { ["--sb-topbar-border"]: "rgba(16,185,129,.55)" };
      default:
        return {};
    }
  }, [role]);

  const go = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  /* ===== right-side icon actions per role ===== */
  const rightByRole = {
    admin: (
      <>
        <button className="sb-iconbtn" onClick={() => go("/admin")} aria-label="Dashboard" title="Dashboard">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/admin/users")} aria-label="Users" title="Users">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.54.58-2.94 1.53-4.03C10.49 12.57 9.3 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.92 1.97 3.45V19h6v-2c0-2.66-5.33-4-8-4z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={() => go("/admin/settings")} aria-label="Settings" title="Settings">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94a7.14,7.14,0,0,0,.05-1l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1a7,7,0,0,0-1.73-1l-.38-2.65A.5.5,0,0,0,13.75,3h-3.5a.5.5,0,0,0-.49.41L9.38,6.06a7,7,0,0,0-1.73,1l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.64L4.9,12a7.14,7.14,0,0,0,0,2l-2.17,1.7a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7,7,0,0,0,1.73,1l.38,2.65a.5.5,0,0,0,.49.41h3.5a.5.5,0,0,0,.49-.41l.38-2.65a7,7,0,0,0,1.73-1l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.64ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
        </button>
        <button className="sb-iconbtn" onClick={onLogout} aria-label="Logout" title="Logout">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 17l1.41-1.41L14.83 13H21v-2h-6.17l2.58-2.59L16 7l-5 5 5 5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        </button>
      </>
    ),
    // STAFF quick actions in Topbar: Shifts, Salaries, Profile, Logout
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

  // Measure Topbar so content never hides behind it
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

  const onBrandClick = () =>
    go(role === "staff" ? "/staff" : role === "admin" ? "/admin" : "/");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingTop: topPad,
      }}
    >
      {isAuthed && (
        <div style={roleThemeVars}>
          <Topbar
            ref={topRef}
            onLogout={onLogout}
            onBrandClick={onBrandClick}
            showCartIcon={role === "customer"} // cart icon+count only for customers
            right={rightByRole[role]}
          />
        </div>
      )}

      <main style={{ flex: "1 0 auto", paddingBottom: "clamp(28px, 4vw, 72px)" }}>
        {children}
      </main>

      <div style={{ marginTop: "clamp(20px, 3vw, 40px)" }}>
        <GlobalFooter position="static" />
      </div>
    </div>
  );
}
