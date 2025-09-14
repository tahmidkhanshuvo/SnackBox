import React from "react";

export default function ProductCard({ item, onAdd, onDetails }) {
  if (!item) return null;

  const {
    id,
    img,
    title,
    badge,
    rating,
    time,
    price,
  } = item;

  // Safe fallbacks
  const displayImg =
    img ||
    "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop";
  const displayTitle = title || "Menu item";
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "—";
  const displayTime = time || "20–30 min";
  const displayPrice =
    typeof price === "number"
      ? `৳ ${Number(price).toLocaleString()}`
      : "৳ —";

  const openDetails = () => onDetails?.(item);
  const add = () => onAdd?.(item);
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  };

  return (
    <>
      <style>{`
        .sb-pc {
          background: #fff;
          border-radius: var(--sb-card-radius);
          overflow: hidden;
          box-shadow: var(--sb-shadow-md);
          border: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
        .sb-pc-media {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #f3f4f6;
          cursor: pointer;
        }
        .sb-pc-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .35s ease;
        }
        .sb-pc:hover .sb-pc-media img { transform: scale(1.05); }

        .sb-pc-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
          font-weight: 800;
          font-size: .78rem;
          color: var(--sb-primary);
          box-shadow: var(--sb-shadow-md);
        }

        .sb-pc-body {
          padding: 14px;
          display: grid;
          gap: 8px;
          cursor: pointer;
        }
        .sb-pc-title {
          font-weight: 900;
          margin: 0;
          color: var(--sb-accent);
        }
        .sb-pc-meta {
          color: var(--sb-muted);
          font-size: .9rem;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sb-pc-price {
          font-weight: 900;
          color: var(--sb-accent);
        }
        .sb-pc-actions {
          padding: 12px 14px 16px;
          display: flex;
          gap: 10px;
        }
        .sb-btn {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: var(--sb-btn-radius);
          padding: 10px 12px;
          font-weight: 800;
          background: #fff;
          color: var(--sb-accent);
          cursor: pointer;
        }
        .sb-btn--primary {
          background: var(--sb-primary);
          color: #fff;
          border: none;
        }
      `}</style>

      <article className="sb-pc">
        {/* Clickable media for details */}
        <div
          className="sb-pc-media"
          role="button"
          tabIndex={0}
          onClick={openDetails}
          onKeyDown={onKey}
          aria-label={`View details for ${displayTitle}`}
        >
          <img src={displayImg} alt={displayTitle} loading="lazy" />
          {badge && <span className="sb-pc-badge">{badge}</span>}
        </div>

        {/* Clickable body title/meta for details */}
        <div
          className="sb-pc-body"
          role="button"
          tabIndex={0}
          onClick={openDetails}
          onKeyDown={onKey}
          aria-label={`View details for ${displayTitle}`}
        >
          <h4 className="sb-pc-title">{displayTitle}</h4>
          <div className="sb-pc-meta">
            <span>⭐ {displayRating}</span>
            <span>{displayTime}</span>
          </div>
          <div className="sb-pc-price">{displayPrice}</div>
        </div>

        <div className="sb-pc-actions">
          <button className="sb-btn" onClick={openDetails}>Details</button>
          <button className="sb-btn sb-btn--primary" onClick={add}>Add</button>
        </div>
      </article>
    </>
  );
}
