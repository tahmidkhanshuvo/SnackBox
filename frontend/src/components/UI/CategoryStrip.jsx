// src/components/UI/CategoryStrip.jsx
import React from "react";

export default function CategoryStrip({ categories = [], onPick }) {
  if (!categories.length) return null;
  return (
    <>
      <style>{`
        .sb-cats { display: grid; grid-auto-flow: column; grid-auto-columns: max-content; gap: 14px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }
        .sb-cat { min-width: 90px; display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 12px; box-shadow: var(--sb-shadow-md); cursor: pointer; transition: transform .12s ease; }
        .sb-cat:hover { transform: translateY(-2px); }
        .sb-cat-icon { width: 56px; height: 56px; border-radius: 999px; display: grid; place-items: center; background: var(--sb-primary-50); color: var(--sb-primary); font-size: 24px; font-weight: 900; }
        .sb-cat-name { font-weight: 800; font-size: .9rem; color: var(--sb-accent); }
      `}</style>

      <div className="sb-cats" aria-label="Food categories">
        {categories.map((c) => (
          <button className="sb-cat" key={c.key} onClick={() => onPick?.(c.key)}>
            <div className="sb-cat-icon">{c.icon}</div>
            <div className="sb-cat-name">{c.name}</div>
          </button>
        ))}
      </div>
    </>
  );
}
