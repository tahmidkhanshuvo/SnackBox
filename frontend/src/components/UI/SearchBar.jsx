// src/components/UI/SearchBar.jsx
import React, { useEffect, useRef, useState } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Search dishes or restaurants…",
  delay = 400,          // debounce ms
  min = 0,              // min chars to trigger (0 = allow empty to reset)
  defaultValue = "",    // optional initial text
}) {
  const [q, setQ] = useState(defaultValue);
  const t = useRef(null);

  // Debounced search when typing
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      if (q.length >= min || q.length === 0) onSearch?.(q);
    }, delay);
    return () => t.current && clearTimeout(t.current);
  }, [q, delay, min, onSearch]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (t.current) clearTimeout(t.current);
    onSearch?.(q);
  };

  const clear = () => {
    if (t.current) clearTimeout(t.current);
    setQ("");
    onSearch?.("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      clear();
    }
  };

  return (
    <>
      <style>{`
        .sb-search {
          background: #fff; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 999px; padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: var(--sb-shadow-md); margin-bottom: 12px;
        }
        .sb-search form { display:flex; align-items:center; gap:10px; flex:1; }
        .sb-search .icon { flex:0 0 auto; color: var(--sb-accent); opacity:.8; }
        .sb-search input {
          border: none; outline: none; flex: 1; font-size: 0.98rem; color: var(--sb-accent);
          min-width: 0; /* prevent overflow in flex */
        }
        .sb-search input::placeholder { color: var(--sb-muted); }
        .sb-search .clear {
          border:none; background:transparent; color: var(--sb-muted);
          font-weight:900; cursor:pointer; padding:6px; line-height:1; border-radius:8px;
        }
        .sb-search .clear:hover { background: rgba(0,0,0,.04); }
        .sb-search button[type="submit"] {
          border: none; background: var(--sb-primary); color: #fff;
          border-radius: 999px; padding: 10px 14px; font-weight: 800; cursor: pointer;
          flex:0 0 auto;
        }
        .sb-search:focus-within { box-shadow: var(--sb-ring); }
      `}</style>

      <div className="sb-search" role="search">
        <form onSubmit={submit} style={{ width: "100%" }}>
          <span className="icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.53 20.47L17.75 16.7a8 8 0 10-1.06 1.06l3.78 3.77a.75.75 0 101.06-1.06zM4.75 10.5a5.75 5.75 0 1111.5 0a5.75 5.75 0 01-11.5 0z"/></svg>
          </span>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Search"
          />

          {q && (
            <button type="button" className="clear" onClick={clear} aria-label="Clear search">×</button>
          )}

          <button type="submit">Search</button>
        </form>
      </div>
    </>
  );
}
