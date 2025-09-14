// src/components/UI/CategoryStrip.jsx
import React from "react";

export default function CategoryStrip({ categories = [], onPick, activeKey = "" }) {
  if (!categories.length) return null;

  const handlePick = (key) => onPick?.(key);

  return (
    <>
      <style>{`
        .sb-cats {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: max-content;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
        }
        .sb-cat {
          min-width: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 12px;
          box-shadow: var(--sb-shadow-md);
          cursor: pointer;
          transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease, background .12s ease;
          outline: none;
        }
        .sb-cat:hover { transform: translateY(-2px); }
        .sb-cat:focus-visible { box-shadow: var(--sb-ring); border-color: var(--sb-primary); }

        .sb-cat.is-active {
          border-color: var(--sb-primary);
          background: linear-gradient(180deg, rgba(239,68,68,0.06), #fff);
          box-shadow: 0 8px 22px rgba(239,68,68,0.12);
        }

        .sb-cat-icon {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--sb-primary-50);
          color: var(--sb-primary);
          font-size: 24px;
          font-weight: 900;
        }
        .sb-cat-name {
          font-weight: 800;
          font-size: .9rem;
          color: var(--sb-accent);
          white-space: nowrap;
        }

        /* When active, give the icon a subtle emphasis too */
        .sb-cat.is-active .sb-cat-icon {
          outline: 2px solid rgba(239,68,68,.25);
          outline-offset: 2px;
        }
      `}</style>

      <div className="sb-cats" aria-label="Food categories">
        {categories.map((c) => {
          const active = c.key === activeKey;
          return (
            <button
              key={c.key}
              type="button"
              className={`sb-cat ${active ? "is-active" : ""}`}
              onClick={() => handlePick(c.key)}
              aria-pressed={active}
              aria-label={`Category: ${c.name}${active ? " (selected)" : ""}`}
            >
              <div className="sb-cat-icon">{c.icon}</div>
              <div className="sb-cat-name">{c.name}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
