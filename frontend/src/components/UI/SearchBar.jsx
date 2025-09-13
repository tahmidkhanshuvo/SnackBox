// src/components/UI/SearchBar.jsx
import React, { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Search dishes or restaurants…" }) {
  const [q, setQ] = useState("");
  return (
    <>
      <style>{`
        .sb-search {
          background: #fff; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 999px; padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: var(--sb-shadow-md); margin-bottom: 12px;
        }
        .sb-search input { border: none; outline: none; flex: 1; font-size: 0.98rem; color: var(--sb-accent); }
        .sb-search input::placeholder { color: var(--sb-muted); }
        .sb-search button { border: none; background: var(--sb-primary); color: #fff; border-radius: 999px; padding: 10px 14px; font-weight: 800; cursor: pointer; }
        .sb-search:focus-within { box-shadow: var(--sb-ring); }
      `}</style>

      <div className="sb-search" role="search">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.53 20.47L17.75 16.7a8 8 0 10-1.06 1.06l3.78 3.77a.75.75 0 101.06-1.06zM4.75 10.5a5.75 5.75 0 1111.5 0a5.75 5.75 0 01-11.5 0z"/></svg>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={placeholder} />
        <button onClick={() => onSearch?.(q)}>Search</button>
      </div>
    </>
  );
}
