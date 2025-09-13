// src/components/Layout.jsx
import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import Topbar from "./UI/Topbar.jsx";
import GlobalFooter from "./UI/GlobalFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children, user: userProp, onLogout }) {
  // Prefer context; fall back to prop
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

  // Optional role tint for Topbar border
  const roleThemeVars = useMemo(() => {
    switch (role) {
      case "admin":    return { ["--sb-topbar-border"]: "rgba(24,24,27,.45)" };
      case "staff":    return { ["--sb-topbar-border"]: "rgba(79,70,229,.50)" };
      case "customer": return { ["--sb-topbar-border"]: "rgba(16,185,129,.55)" };
      default:         return {};
    }
  }, [role]);

  const go = (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const rightByRole = {
    admin: (
      <>
        <button className="sb-pill" onClick={() => go("/admin")}>Dashboard</button>
        <button className="sb-pill" onClick={() => go("/admin/users")}>Users</button>
        <button className="sb-pill" onClick={() => go("/admin/settings")}>Settings</button>
        <button className="sb-pill sb-pill--primary" onClick={onLogout}>Logout</button>
      </>
    ),
    staff: (
      <>
        <button className="sb-pill" onClick={() => go("/staff")}>Queue</button>
        <button className="sb-pill" onClick={() => go("/staff/orders")}>Orders</button>
        <button className="sb-pill" onClick={() => go("/staff/inventory")}>Inventory</button>
        <button className="sb-pill sb-pill--primary" onClick={onLogout}>Logout</button>
      </>
    ),
    customer: (
      <>
        <button className="sb-pill" onClick={() => go("/orders")}>Orders</button>
        <button className="sb-pill" onClick={() => go("/cart")}>Cart</button>
        <button
          type="button"
          className="sb-prof-btn"
          title="Profile"
          aria-label="Profile"
          onClick={() => go("/profile")}
        >
          👤
        </button>
        <button className="sb-pill sb-pill--primary" onClick={onLogout}>Logout</button>
      </>
    ),
  };

  // Measure Topbar so content never hides behind it
  const topRef = useRef(null);
  const [topPad, setTopPad] = useState(72);

  useLayoutEffect(() => {
    const measure = () => {
      const h = topRef.current?.getBoundingClientRect().height || 0;
      setTopPad(isAuthed ? h + 8 : 0); // a little breathing room
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
        minHeight: "100vh",            // no global classes; no surprises
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
            onProfileClick={() => go("/profile")}
            right={rightByRole[role]}
          />
        </div>
      )}

      {/* Main content grows; bottom padding keeps distance from footer */}
      <main style={{ flex: "1 0 auto", paddingBottom: "clamp(28px, 4vw, 72px)" }}>
        {children}
      </main>

      {/* A gentle gap before the footer */}
      <div style={{ marginTop: "clamp(20px, 3vw, 40px)" }}>
        <GlobalFooter position="static" />
      </div>
    </div>
  );
}
