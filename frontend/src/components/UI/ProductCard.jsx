// src/components/UI/ProductCard.jsx
import React from "react";

export default function ProductCard({ item, onAdd, onDetails }) {
  if (!item) return null;
  const { img, title, badge, rating, time, price } = item;

  return (
    <>
      <style>{`
        .sb-pc { background: #fff; border-radius: var(--sb-card-radius); overflow: hidden; box-shadow: var(--sb-shadow-md); border: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; }
        .sb-pc-media { position: relative; height: 180px; overflow: hidden; background: #f3f4f6; }
        .sb-pc-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
        .sb-pc:hover .sb-pc-media img { transform: scale(1.06); }
        .sb-pc-badge { position: absolute; top: 10px; left: 10px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.9); font-weight: 800; font-size: .78rem; color: var(--sb-primary); box-shadow: var(--sb-shadow-md); }
        .sb-pc-body { padding: 14px; display: grid; gap: 8px; }
        .sb-pc-title { font-weight: 900; margin: 0; color: var(--sb-accent); }
        .sb-pc-meta { color: var(--sb-muted); font-size: .9rem; }
        .sb-pc-price { font-weight: 900; color: var(--sb-accent); }
        .sb-pc-actions { padding: 12px 14px 16px; display: flex; gap: 10px; }
        .sb-btn { border: 1px solid rgba(0,0,0,0.08); border-radius: var(--sb-btn-radius); padding: 10px 12px; font-weight: 800; background: #fff; color: var(--sb-accent); cursor: pointer; }
        .sb-btn--primary { background: var(--sb-primary); color: #fff; border: none; }
      `}</style>

      <article className="sb-pc">
        <div className="sb-pc-media">
          <img src={img} alt={title} loading="lazy" />
          {badge && <span className="sb-pc-badge">{badge}</span>}
        </div>
        <div className="sb-pc-body">
          <h4 className="sb-pc-title">{title}</h4>
          <div className="sb-pc-meta">⭐ {rating} · {time}</div>
          <div className="sb-pc-price">৳ {price}</div>
        </div>
        <div className="sb-pc-actions">
          <button className="sb-btn" onClick={() => onDetails?.(item)}>Details</button>
          <button className="sb-btn sb-btn--primary" onClick={() => onAdd?.(item)}>Add</button>
        </div>
      </article>
    </>
  );
}
