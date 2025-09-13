import React, { useEffect, useState } from "react";

export default function StaffLayout({ title, goto, children }) {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const pop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  const items = [
    { to: "/staff/dashboard", label: "Dashboard" },
    { to: "/staff/orders",    label: "Orders" },
    { to: "/staff/inventory", label: "Inventory" },
    { to: "/staff/menu",      label: "Menu Items" },
    { to: "/staff/complaints",label: "Complaints" },
  ];

  const Link = ({ to, label }) => {
    const active = path === to;
    return (
      <a
        href={to}
        onClick={(e) => { e.preventDefault(); goto(to); }}
        style={{
          display: "block",
          padding: "11px 14px",
          borderRadius: 12,
          textDecoration: "none",
          color: active ? "#065f46" : "#111827",
          background: active ? "#ecfdf5" : "transparent", // green-50
          fontWeight: active ? 800 : 500,
          boxShadow: active ? "inset 0 0 0 1px #bbf7d0" : "none", // green-200
          border: active ? "1px solid #bbf7d0" : "1px solid transparent",
        }}
      >
        {label}
      </a>
    );
  };

  return (
    <div className="page-container" style={{ padding: 16 }}>
      <div
        style={{
          width: "min(1280px, 100%)",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 20,
        }}
      >
        {/* Sidebar (green/white theme) */}
        <aside
          style={{
            background: "#ffffff",
            padding: 16,
            borderRadius: 18,
            boxShadow: "0 6px 16px rgba(0,0,0,.08)",
            height: "fit-content",
          }}
        >
          <h3 style={{ margin: "6px 0 12px", fontSize: 18, color: "#065f46" }}>Staff</h3>
          <nav style={{ display: "grid", gap: 6 }}>
            {items.map((it) => <Link key={it.to} {...it} />)}
          </nav>
        </aside>

        {/* Content card */}
        <main
          className="dashboard-container"
          style={{
            textAlign: "left",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
}
