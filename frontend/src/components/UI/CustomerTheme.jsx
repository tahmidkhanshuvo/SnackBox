// src/components/UI/CustomerTheme.jsx
import React from "react";

export default function CustomerTheme() {
  return (
    <style>{`
      :root {
        /* brand tokens */
        --sb-bg: #ffffff;
        --sb-muted: #6b7280;
        --sb-text: #0f172a;
        --sb-primary: #ff2b4d;
        --sb-primary-700: #e02443;
        --sb-primary-50: #fff1f3;
        --sb-accent: #111827;

        --sb-card-radius: 18px;
        --sb-btn-radius: 12px;
        --sb-shadow-md: 0 10px 25px rgba(0,0,0,0.10);
        --sb-shadow-lg: 0 16px 40px rgba(0,0,0,0.15);
        --sb-ring: 0 0 0 4px rgba(255,43,77,0.15);

        /* layout */
        --sb-pad: 24px;
        --sb-max: clamp(1200px, 96vw, 1680px);
      }
      @media (max-width: 640px) { :root { --sb-pad: 16px; } }

      /* HARD resets so the page truly fills the window */
      * { box-sizing: border-box; }
      html, body, #root {
        width: 100%;
        height: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        background: var(--sb-bg);
        overflow-x: hidden;
      }

      .sb-page {
        min-height: 100dvh;
        width: 100%;
        display: flex;
        flex-direction: column;
        color: var(--sb-text);
        background:
          radial-gradient(900px 500px at 100% 0%, #ffe3e8 0%, transparent 50%),
          radial-gradient(800px 500px at 0% 80%, #fff7f8 0%, transparent 50%),
          var(--sb-bg);
      }

      .sb-shell { max-width: 1200px; margin: 0 auto; padding-inline: var(--sb-pad); }

      /* shared pieces */
      .sb-btn { border: 1px solid rgba(0,0,0,0.08); border-radius: var(--sb-btn-radius); padding: 10px 12px; font-weight: 800; background: #fff; color: var(--sb-accent); cursor: pointer; }
      .sb-btn--primary { background: var(--sb-primary); color: #fff; border: none; }
      .sb-pill { border: 1px solid rgba(0,0,0,0.08); background: #fff; color: var(--sb-accent); padding: 8px 12px; border-radius: 999px; font-weight: 700; cursor: pointer; }
      .sb-pill--primary { background: var(--sb-primary); color: #fff; border: none; }
      .sb-card { background: #fff; border-radius: var(--sb-card-radius); overflow: hidden; box-shadow: var(--sb-shadow-md); border: 1px solid rgba(0,0,0,0.05); }
    `}</style>
  );
}
