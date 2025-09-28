// src/pages/admin/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminLogin, getMe, ensureCsrf } from "../../api/api";

/* ----------------------- ACETERNITY-THEMED STYLES ----------------------- */
const AdminStyles = () => (
  <style>{`
    :root{
      --bg:#0b1220; --fg:#e5e7eb; --muted:#9aa0a6; --card:rgba(255,255,255,0.06);
      --card-b:#1f2937; --card-br:rgba(255,255,255,0.12); --ring:0 0 0 4px rgba(34,211,238,0.18);
      --c1:#22d3ee; --c2:#6366f1; --shadow:0 16px 40px rgba(0,0,0,.35);
    }
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;overflow:hidden}
    body{
      color:var(--fg);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;
      background:
        radial-gradient(950px 600px at 85% 10%, rgba(34,211,238,.18) 0%, transparent 60%),
        radial-gradient(800px 500px at 10% 90%, rgba(99,102,241,.18) 0%, transparent 60%),
        var(--bg);
    }

    .page{display:flex;height:100vh;width:100vw}
    .form-panel{width:44%;min-width:360px;display:flex;align-items:center;justify-content:center;padding:32px;overflow:auto}
    .slider-panel{width:56%;position:relative;overflow:hidden}

    .ring{padding:1px;border-radius:20px;background:conic-gradient(from 0deg,var(--c1),var(--c2),var(--c1));}
    .card{border-radius:18px;background:var(--card);border:1px solid var(--card-br);backdrop-filter:blur(10px);box-shadow:var(--shadow)}

    .wrapper{width:100%;max-width:480px;margin:auto}
    .pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--card-br);background:rgba(255,255,255,.06);
      color:#c7d2fe;padding:6px 10px;border-radius:9999px;font-size:12px}

    .title{margin:10px 0 4px;font-size:2rem;font-weight:800;letter-spacing:.2px}
    .sub{margin:0;font-size:.95rem;color:#cbd5e1}

    .form{display:flex;flex-direction:column;gap:14px;padding:26px}

    .label{font-size:13px;color:#d1d5db;margin-bottom:6px;font-weight:600}
    .row{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .muted{font-size:13px;color:#cbd5e1}

    .inputWrap{display:flex;align-items:center;height:52px;border:1px solid var(--card-br);border-radius:12px;padding:0 12px;background:var(--card-b);transition:.18s}
    .inputWrap:focus-within{border-color:rgba(34,211,238,.55);box-shadow:var(--ring)}
    .inputWrap svg{color:var(--muted)}
    .input{flex:1;border:0;background:transparent;color:#fff;font-size:1rem;margin-left:10px;height:100%;outline:none}
    .input::placeholder{color:#94a3b8}
    .eye{background:transparent;border:0;color:var(--muted);cursor:pointer;margin-left:8px}

    .btn{height:50px;width:100%;border:0;border-radius:12px;color:#fff;font-weight:800;letter-spacing:.2px;
      background-image:linear-gradient(to right,var(--c1),var(--c2));
      transition:filter .2s, transform .05s; cursor:pointer}
    .btn:hover{filter:brightness(1.06)}
    .btn:active{transform:translateY(1px)}
    .btn:disabled{opacity:.7;cursor:not-allowed}
    .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:9999px;animation:spin .8s linear infinite;margin-right:8px}
    @keyframes spin{to{transform:rotate(360deg)}}

    .error{color:#fecaca;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);border-radius:12px;padding:10px 14px;font-size:14px}

    .hero{height:100%;display:flex;flex-direction:column;justify-content:center;gap:1rem}
    .heroHead{max-width:42rem;margin:0 auto;text-align:center;position:relative;z-index:1;
      padding:16px 20px;background:rgba(2,6,23,.55);border:1px solid rgba(255,255,255,.08);border-radius:16px;backdrop-filter:blur(8px)}
    .heroTitle{margin:0;font-weight:800;color:#fff;font-size:2rem}
    .heroSub{margin:.4rem auto 0;max-width:32rem;color:#e5e7eb}
    .rowCards{display:flex;gap:1rem;width:max-content;will-change:transform;transition:transform .4s}
    .cardImg{width:19rem;height:19rem;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.35)}
    .cardImg img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
    .cardImg:hover img{transform:scale(1.06)}

    @media (max-width:1024px){
      .form-panel{width:100%;height:64%}
      .slider-panel{width:100%;height:36%}
      .heroHead{display:none}
      .cardImg{width:15rem;height:15rem}
    }
    @media (max-width:768px){
      html,body{overflow:auto}
      .form-panel{height:100%}
      .slider-panel{display:none}
    }
  `}</style>
);

/* ----------------------- SIMPLE HERO PARALLAX ----------------------- */
const slides = [
  { title: "Orders Dashboard",  thumbnail: "https://images.unsplash.com/photo-1551281044-8d8d3d7f2a61?q=80&w=1960" },
  { title: "Inventory Control", thumbnail: "https://images.unsplash.com/photo-1581093588401-16fbddb89c3d?q=80&w=1974" },
  { title: "Team Scheduling",   thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1974" },
  { title: "Insights & KPIs",   thumbnail: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1974" },
  { title: "Secure Access",     thumbnail: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=1974" },
];

function HeroParallax() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(p => (p > 50 ? -50 : p + 0.5)), 100);
    return () => clearInterval(id);
  }, []);
  const dup = [...slides, ...slides];
  return (
    <div className="hero">
      <div className="heroHead">
        <h2 className="heroTitle">Admin Console</h2>
        <p className="heroSub">Manage staff, menu, and orders with speed and clarity.</p>
      </div>
      <div className="rowCards" style={{ transform: `translateX(-${t * 2}px)` }}>
        {dup.map((s, i) => (
          <div className="cardImg" key={`${s.title}-${i}`}>
            <img loading="lazy" src={s.thumbnail} alt={s.title} />
          </div>
        ))}
      </div>
      <div className="rowCards" style={{ transform: `translateX(${t}px)` }}>
        {dup.map((s, i) => (
          <div className="cardImg" key={`${s.title}-${i}-b`}>
            <img loading="lazy" src={s.thumbnail} alt={s.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- FORM ----------------------- */
function AdminLoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); // optional; backend ignores for admin
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-warm CSRF & auto-enter if already authenticated as admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureCsrf();
        const me = await getMe();
        const role = String(me?.role || "").toLowerCase();
        if (mounted && (role === "admin" || role === "superadmin")) {
          onLoginSuccess?.(me);
        }
      } catch {
        // ignore; normal flow will handle CSRF on submit
      }
    })();
    return () => { mounted = false; };
  }, [onLoginSuccess]);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMsg("");
    setLoading(true);
    try {
      await adminLogin(email, password); // CSRF handled in api helper
      const meResp = await getMe();
      const user = meResp?.user ?? meResp ?? null;
      if (!user) throw new Error("Could not verify session after login.");
      const role = String(user.role || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        throw new Error("Only admins can access the admin panel.");
      }
      onLoginSuccess?.(user); // App.jsx will route & toast
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && Object.values(err.response.data.errors).flat().join(" ")) ||
        err?.message;
      setMsg(serverMsg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper ring">
      <div className="card">
        <form className="form" onSubmit={submit} noValidate>
          <div>
            <span className="pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l3.09 6.26L22 10.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 15.17l-5-4.9 6.91-1.01L12 3z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Admin Area
            </span>
            <h1 className="title">Sign in</h1>
            <p className="sub">Use credentials stored in the backend <code>.env</code>.</p>
          </div>

          {msg && <div className="error" role="alert">{msg}</div>}

          {/* Email */}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="inputWrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                id="email" className="input" type="email" required
                autoComplete="username" placeholder="admin@example.com"
                value={email} onChange={(e)=>{ setEmail(e.target.value); if (msg) setMsg(""); }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="inputWrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <input
                id="password" className="input" required
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password} onChange={(e)=>{ setPassword(e.target.value); if (msg) setMsg(""); }}
              />
              <button type="button" className="eye" onClick={()=>setShowPw(s=>!s)} aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.585 10.585A2 2 0 0012 14a2 2 0 001.414-3.414" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7a17.2 17.2 0 01-3.2 3.8M6.2 16.2A17.2 17.2 0 012 12" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="row">
            <label className="muted" style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
              Remember me
            </label>
            <a className="muted" href="/forgot-password" style={{color:"var(--c1)",fontWeight:700,textDecoration:"none"}}>Forgot password?</a>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div style={{textAlign:"center",fontSize:13,color:"#cbd5e1",marginTop:10}}>
            Not an admin?{" "}
            <Link to="/" style={{ color:"var(--c1)", fontWeight:700, textDecoration:"none" }}>
              Return to site
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------- PAGE ----------------------- */
export default function AdminLogin({ onLoginSuccess }) {
  return (
    <>
      <AdminStyles />
      <div className="page">
        <div className="form-panel">
          <AdminLoginForm onLoginSuccess={onLoginSuccess} />
        </div>
        <div className="slider-panel">
          <HeroParallax />
        </div>
      </div>
    </>
  );
}
