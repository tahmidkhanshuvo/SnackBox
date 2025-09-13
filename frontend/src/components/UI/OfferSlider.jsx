// src/components/UI/OfferSlider.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * OfferSlider (no visible arrows; click edges / keyboard / swipe work)
 */
export default function OfferSlider({
  slides = [],
  intervalMs = 4500,
  onCta,
  enableHotzones = true,
  enableKeyboard = true,
  enableSwipe = true,
  hotzoneWidth = "14%", // narrower so edges are clearly "edge" only
}) {
  const [i, setI] = useState(0);
  const intervalRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0, t: 0 });

  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  // autoplay
  useEffect(() => {
    if (!slides.length) return;
    intervalRef.current = setInterval(next, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [slides, intervalMs]);

  // keyboard arrows
  useEffect(() => {
    if (!enableKeyboard) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableKeyboard]);

  // swipe support
  const onTouchStart = (e) => {
    if (!enableSwipe) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    if (!enableSwipe) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    const H = Math.abs(dx) > Math.abs(dy);
    if (H && dt < 800 && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
  };

  if (!slides.length) return null;

  return (
    <>
      <style>{`
        .sb-offer { position: relative; width: 100%; margin-bottom: 16px; }
        .sb-offer-box {
          border-radius: var(--sb-card-radius);
          overflow: hidden;
          box-shadow: var(--sb-shadow-lg);
          background: #fff;
          width: 100%;
        }
        .sb-rail {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 100%;
          transition: transform .5s ease;
          will-change: transform;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .sb-slide {
          position: relative; width: 100%;
          height: clamp(260px, 40vw, 320px);
          background: #f3f4f6;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .sb-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .sb-overlay {
          position: absolute; inset: 0;
          background: linear-gradient( to right, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 70%);
          display: flex; align-items: center; padding: 22px;
        }
        .sb-copy { color: #fff; max-width: 520px; }
        .sb-title { font-size: clamp(1.2rem, 2.4vw, 2rem); font-weight: 900; margin: 0 0 6px; }
        .sb-sub { opacity: .95; margin: 0 0 12px; line-height: 1.45; }
        .sb-cta { background: #fff; color: var(--sb-primary); border: none; border-radius: 999px; padding: 10px 16px; font-weight: 800; cursor: pointer; }

        /* Dots */
        .sb-dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
        .sb-dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.6); }
        .sb-dot.active { background: #fff; }

        /* Invisible hotzones — remove *all* focus rings/UA highlights */
        .sb-hotzone {
          position: absolute; top: 0; bottom: 0;
          width: ${hotzoneWidth};
          background: transparent !important;
          border: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent;
          appearance: none; -webkit-appearance: none;
          cursor: pointer; pointer-events: auto; z-index: 2;
        }
        .sb-hotzone--left { left: 0; }
        .sb-hotzone--right { right: 0; }
        .sb-hotzone:focus,
        .sb-hotzone:focus-visible,
        .sb-hotzone::-moz-focus-inner { border: 0; outline: none; box-shadow: none; }
        .sb-hotzone:active { background: transparent; }
      `}</style>

      <section
        className="sb-offer"
        role="region"
        aria-label="Promotions"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="sb-offer-box">
          {/* translate3d prevents sub-pixel seam */}
          <div className="sb-rail" style={{ transform: `translate3d(-${i * 100}%,0,0)` }}>
            {slides.map((s, idx) => (
              <div className="sb-slide" key={idx}>
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="sb-overlay">
                  <div className="sb-copy">
                    <h3 className="sb-title">{s.title}</h3>
                    <p className="sb-sub">{s.sub}</p>
                    {s.cta && <button className="sb-cta" onClick={() => onCta?.(s)}>{s.cta}</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invisible edge click zones (no visible arrows) */}
        {enableHotzones && (
          <>
            <button className="sb-hotzone sb-hotzone--left" aria-label="Previous slide" onClick={prev} />
            <button className="sb-hotzone sb-hotzone--right" aria-label="Next slide" onClick={next} />
          </>
        )}

        <div className="sb-dots">
          {slides.map((_, d) => <div key={d} className={`sb-dot ${d === i ? 'active' : ''}`} />)}
        </div>
      </section>
    </>
  );
}
