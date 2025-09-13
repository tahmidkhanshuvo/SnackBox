// src/pages/customer/Profile.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/api";
import { CustomerTheme, Topbar } from "../../components/UI";

export default function Profile({ onLogout, goHome, onUserUpdated, seedUser }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [ok, setOk]           = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact_no: "",
    password: "",
    password_confirmation: "",
  });

  // load current user (prefer fresh fetch; fallback to seedUser)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get("/api/auth/me");
        if (!alive) return;
        setForm((f) => ({
          ...f,
          name: data?.name ?? "",
          email: data?.email ?? "",
          contact_no: data?.contact_no ?? "",
          password: "",
          password_confirmation: "",
        }));
      } catch {
        if (seedUser) {
          setForm((f) => ({
            ...f,
            name: seedUser.name ?? "",
            email: seedUser.email ?? "",
            contact_no: seedUser.contact_no ?? "",
            password: "",
            password_confirmation: "",
          }));
        } else {
          setError("Unable to load your profile.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [seedUser]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setOk(""); setSaving(true);
    try {
      // Only send password fields if filled
      const payload = {
        name: form.name,
        email: form.email,
        contact_no: form.contact_no,
      };
      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }
      const { data } = await apiClient.patch("/api/auth/me", payload);
      setOk("Profile updated.");
      setForm((f) => ({ ...f, password: "", password_confirmation: "" }));
      onUserUpdated?.(data?.user ?? data); // update app state if provided
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed.";
      const v   = err?.response?.data?.errors;
      setError(v ? Object.values(v).flat().join(" ") : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sb-page">
      <CustomerTheme />
      <Topbar onLogout={onLogout} onBrandClick={goHome} onProfileClick={() => {}} />

      <main className="sb-shell">
        <section className="sb-prof">
          <h1>My Profile</h1>

          {loading ? (
            <div className="sb-card" style={{ height: 200, animation: "sh 1.2s linear infinite", background: "linear-gradient(90deg,#f3f4f6, #e5e7eb, #f3f4f6)", backgroundSize: "200% 100%" }} />
          ) : (
            <form className="sb-card" onSubmit={onSubmit}>
              {error && <div className="sb-alert error">{error}</div>}
              {ok && <div className="sb-alert ok">{ok}</div>}

              <div className="grid">
                <div className="field">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={onChange} required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} required />
                </div>
                <div className="field">
                  <label>Contact number</label>
                  <input name="contact_no" value={form.contact_no} onChange={onChange} placeholder="Optional" />
                </div>
              </div>

              <h3>Change password</h3>
              <div className="grid">
                <div className="field">
                  <label>New password</label>
                  <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep current" />
                </div>
                <div className="field">
                  <label>Confirm new password</label>
                  <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={onChange} />
                </div>
              </div>

              <div className="actions">
                <button className="sb-pill" type="button" onClick={goHome}>Cancel</button>
                <button className="sb-pill sb-pill--primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          )}

          <style>{`
            .sb-prof h1 { margin: 6px 0 12px; color: var(--sb-accent); }
            .sb-card { background:#fff; border-radius: var(--sb-card-radius); padding: 16px; box-shadow: var(--sb-shadow-md); border: 1px solid rgba(0,0,0,0.05); }
            .grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-bottom: 14px; }
            .field { display:grid; gap:6px; }
            label { font-weight: 800; color: var(--sb-accent); }
            input, textarea {
              border:1px solid rgba(0,0,0,0.1); border-radius:12px; padding:10px;
              font: inherit; background:#fff; outline:none;
            }
            input:focus, textarea:focus { box-shadow: var(--sb-ring); border-color: var(--sb-primary); }
            .actions { display:flex; gap:10px; justify-content:flex-end; }
            .sb-alert { padding:10px 12px; border-radius:10px; font-weight:700; margin-bottom:10px; }
            .sb-alert.ok { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
            .sb-alert.error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
            @keyframes sh { 0% {background-position: 200% 0;} 100% {background-position: -200% 0;} }
          `}</style>
        </section>
      </main>
    </div>
  );
}
