// src/pages/customer/Product.jsx
import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/api";
import { CustomerTheme, Topbar } from "../../components/UI";

export default function Product({ productId, onLogout, goHome }) {
  const id = useMemo(() => String(productId || "").trim(), [productId]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await apiClient.get(`/api/menu-items/${id}`);
        if (!alive) return;
        setItem(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load item.");
      } finally {
        alive = false ? null : setLoading(false);
      }
    };
    if (id) run();
    return () => { alive = false; };
  }, [id]);

  const name  = item?.name || item?.title || "Menu item";
  const img   = item?.image_url || item?.image || item?.image_path || "https://images.unsplash.com/photo-1551782450-17144c3a8f53?q=80&w=2000";
  const price = item?.price ?? 0;
  const rating = item?.rating ?? 4.6;
  const time   = item?.preparation_time || "20–30 min";
  const desc   = item?.description || "Tasty and freshly prepared with quality ingredients.";

  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const addToCart = () => {
    // hook to your cart state later
    console.log("ADD_TO_CART", { id, qty, price });
    alert("Added to cart! (stub)");
  };

  return (
    <div className="sb-page">
      <CustomerTheme />
      <Topbar onLogout={onLogout} />

      <main className="sb-shell">
        <div style={{ marginTop: 14, marginBottom: 6 }}>
          <button className="sb-pill" onClick={() => window.history.back()}>← Back</button>
          <button className="sb-pill" style={{ marginLeft: 10 }} onClick={goHome}>Home</button>
        </div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : (
          <section className="sb-prod">
            <div className="sb-prod-media">
              <img src={img} alt={name} />
            </div>

            <div className="sb-prod-body">
              <h1 className="sb-prod-title">{name}</h1>
              <div className="sb-prod-meta">⭐ {rating} · {time}</div>
              <p className="sb-prod-desc">{desc}</p>

              <div className="sb-prod-price">৳ {price}</div>

              <div className="sb-qty">
                <button onClick={dec} aria-label="Decrease">−</button>
                <div>{qty}</div>
                <button onClick={inc} aria-label="Increase">＋</button>
              </div>

              <button className="sb-add" onClick={addToCart}>Add to cart</button>
            </div>

            <style>{`
              .sb-prod {
                display: grid;
                grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
                gap: 24px;
                align-items: start;
              }
              @media (max-width: 900px) {
                .sb-prod { grid-template-columns: 1fr; }
              }
              .sb-prod-media {
                background: #fff; border-radius: var(--sb-card-radius);
                overflow: hidden; box-shadow: var(--sb-shadow-lg);
                border: 1px solid rgba(0,0,0,0.05);
              }
              .sb-prod-media img { width: 100%; height: clamp(260px, 40vw, 560px); object-fit: cover; display:block; }
              .sb-prod-body {
                background: #fff; border-radius: var(--sb-card-radius);
                box-shadow: var(--sb-shadow-md);
                border: 1px solid rgba(0,0,0,0.05);
                padding: 18px;
                display: grid; gap: 12px;
              }
              .sb-prod-title { margin: 0; font-size: clamp(1.25rem, 2.4vw, 2rem); font-weight: 900; color: var(--sb-accent); }
              .sb-prod-meta { color: var(--sb-muted); font-weight: 600; }
              .sb-prod-desc { color: var(--sb-accent); line-height: 1.55; margin: 4px 0 10px; }
              .sb-prod-price { font-size: 1.4rem; font-weight: 900; color: var(--sb-accent); }

              .sb-qty { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(0,0,0,0.1); border-radius: 999px; padding: 6px; background: #fff; }
              .sb-qty button { border: none; background: var(--sb-primary-50); color: var(--sb-primary); width: 36px; height: 36px; border-radius: 999px; font-weight: 900; cursor: pointer; }
              .sb-qty div { width: 36px; text-align: center; font-weight: 800; }

              .sb-add { border: none; background: var(--sb-primary); color: #fff; border-radius: 12px; padding: 12px 16px; font-weight: 900; cursor: pointer; width: 100%; }
            `}</style>
          </section>
        )}
      </main>
    </div>
  );
}

function Skeleton() {
  return (
    <section className="sb-skel">
      <div className="img" />
      <div className="box" />
      <style>{`
        .sb-skel { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .sb-skel { grid-template-columns: 1fr; } }
        .img, .box { background: linear-gradient(90deg,#f3f4f6, #e5e7eb, #f3f4f6); background-size: 200% 100%; animation: sh 1.2s linear infinite; border-radius: var(--sb-card-radius); height: clamp(260px, 40vw, 560px); }
        .box { height: 240px; }
        @keyframes sh { 0% {background-position: 200% 0;} 100% {background-position: -200% 0;} }
      `}</style>
    </section>
  );
}

function ErrorBlock({ message }) {
  return (
    <div className="sb-card" style={{ padding: 16 }}>
      <h3 style={{ margin: 0, color: 'var(--sb-accent)' }}>Couldn’t load item</h3>
      <p style={{ color: 'var(--sb-muted)' }}>{message}</p>
    </div>
  );
}
