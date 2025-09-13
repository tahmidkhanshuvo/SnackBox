// src/pages/customer/Profile.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/api";
import { CustomerTheme } from "../../components/UI";

export default function Profile({ goHome, onUserUpdated, seedUser }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact_no: "",
    password: "",
    password_confirmation: "",
  });

  // avatar
  const [avatarUrl, setAvatarUrl] = useState(""); // from backend
  const [avatarPreview, setAvatarPreview] = useState(""); // local preview
  const [avatarFile, setAvatarFile] = useState(null); // File

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
        setAvatarUrl(data?.avatar_url || data?.photo_url || "");
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
          setAvatarUrl(seedUser?.avatar_url || seedUser?.photo_url || "");
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

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError("Image is larger than 2MB.");
      return;
    }
    setError("");
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const clearImage = () => {
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setAvatarFile(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setOk(""); setSaving(true);
    try {
      if (avatarFile) {
        // multipart when changing photo
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("contact_no", form.contact_no);
        fd.append("avatar", avatarFile); // backend: accept 'avatar' or adjust field name
        if (form.password) {
          fd.append("password", form.password);
          fd.append("password_confirmation", form.password_confirmation);
        }
        const { data } = await apiClient.patch("/api/auth/me", fd);
        setOk("Profile updated.");
        setForm((f) => ({ ...f, password: "", password_confirmation: "" }));
        setAvatarUrl(data?.user?.avatar_url || data?.avatar_url || avatarUrl);
        onUserUpdated?.(data?.user ?? data);
        clearImage();
      } else {
        // JSON when no photo change
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
        onUserUpdated?.(data?.user ?? data);
      }
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

      <main className="sb-shell">
        <section className="a-hero">
          <div className="a-hero-badge">Account</div>
          <h1 className="a-hero-title">
            Manage your <span className="grad">profile</span>
          </h1>
          <p className="a-hero-sub">
            Keep your info up-to-date. Change your picture, details, and password.
          </p>
        </section>

        {loading ? (
          <div className="a-skeleton-grid">
            <div className="a-skel a-skel-lg" />
            <div className="a-skel" />
            <div className="a-skel" />
          </div>
        ) : (
          <form className="a-grid" onSubmit={onSubmit}>
            {/* LEFT: avatar card */}
            <div className="a-card a-card-glass">
              <h3 className="a-card-title">Profile picture</h3>
              <div className="a-avatar-wrap">
                <div className="a-avatar-ring">
                  <img
                    src={avatarPreview || avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                    alt="Avatar"
                    className="a-avatar"
                  />
                </div>
              </div>

              <div className="a-upload">
                <label className="a-btn soft" htmlFor="avatar">
                  Upload new
                </label>
                <input id="avatar" type="file" accept="image/*" onChange={onPickImage} hidden />
                {avatarPreview && (
                  <button type="button" className="a-btn ghost" onClick={clearImage}>
                    Remove
                  </button>
                )}
              </div>

              <p className="a-hint">PNG/JPG up to 2MB.</p>
            </div>

            {/* RIGHT: basic info */}
            <div className="a-card">
              <h3 className="a-card-title">Basic information</h3>

              {error && <div className="a-alert error">{error}</div>}
              {ok && <div className="a-alert ok">{ok}</div>}

              <div className="a-form-grid">
                <div className="a-field">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={onChange} required />
                </div>
                <div className="a-field">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} required />
                </div>
                <div className="a-field">
                  <label>Contact number</label>
                  <input name="contact_no" value={form.contact_no} onChange={onChange} placeholder="Optional" />
                </div>
              </div>
            </div>

            {/* FULL-WIDTH: password */}
            <div className="a-card">
              <h3 className="a-card-title">Security</h3>
              <div className="a-form-grid">
                <div className="a-field">
                  <label>New password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div className="a-field">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="a-actions">
                <button className="a-btn ghost" type="button" onClick={goHome}>Cancel</button>
                <button className="a-btn primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        )}

        <style>{`
          /* Aceternity-inspired look (no external deps, Tailwind-like tokens via CSS vars) */
          .grad {
            background: linear-gradient(90deg, var(--sb-primary), #fb923c);
            -webkit-background-clip: text; background-clip: text; color: transparent;
          }
          .a-hero { display:grid; gap:10px; margin-bottom: 18px; }
          .a-hero-badge {
            display:inline-flex; align-items:center; gap:8px;
            font-weight:800; font-size:.8rem;
            padding:6px 10px; border-radius:999px;
            background: var(--sb-primary-50); color: var(--sb-primary);
            width:max-content;
          }
          .a-hero-title { margin:0; font-weight:900; font-size:clamp(1.4rem, 3vw, 2rem); color: var(--sb-accent); }
          .a-hero-sub { margin:0; color: var(--sb-muted); font-weight:700; }

          .a-grid {
            display:grid; gap:16px;
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          }
          @media (max-width: 900px){ .a-grid { grid-template-columns: 1fr; } }

          .a-card {
            background:#fff; border-radius: 20px; padding: 16px;
            border: 1px solid rgba(0,0,0,.06);
            box-shadow: 0 10px 30px rgba(0,0,0,.06);
          }
          .a-card-glass {
            background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.9));
            backdrop-filter: blur(6px) saturate(1.2);
          }
          .a-card-title { margin: 0 0 12px; font-size: 1.05rem; font-weight: 900; color: var(--sb-accent); }

          .a-avatar-wrap { display:grid; place-items:center; margin: 6px 0 12px; }
          .a-avatar-ring {
            padding:6px; border-radius:999px;
            background: conic-gradient(from 180deg, var(--sb-primary), #fb923c, var(--sb-primary));
            box-shadow: 0 10px 24px rgba(0,0,0,.10);
          }
          .a-avatar {
            display:block; width: 112px; height: 112px; object-fit: cover;
            border-radius: 999px; border: 4px solid #fff;
          }

          .a-upload { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
          .a-hint { text-align:center; color: var(--sb-muted); font-weight:700; margin:8px 0 0; }

          .a-form-grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
          .a-field { display:grid; gap:6px; }
          label { font-weight:800; color: var(--sb-accent); }
          input, textarea {
            border:1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 10px;
            background:#fff; font: inherit; outline:none;
          }
          input:focus, textarea:focus { box-shadow: var(--sb-ring); border-color: var(--sb-primary); }

          .a-actions { display:flex; gap:10px; justify-content:flex-end; margin-top: 12px; }

          .a-btn {
            font-weight:900; border-radius:12px; padding:10px 14px; cursor:pointer; border:none;
          }
          .a-btn.primary {
            background: linear-gradient(90deg, var(--sb-primary), #fb923c);
            color:#fff; box-shadow: 0 8px 20px rgba(251,146,60,.35);
          }
          .a-btn.soft {
            background: var(--sb-primary-50); color: var(--sb-primary);
            border: 1px solid rgba(239,68,68,.2);
          }
          .a-btn.ghost {
            background:#fff; color: var(--sb-accent);
            border:1px solid rgba(0,0,0,.1);
          }

          .a-alert { padding:10px 12px; border-radius:12px; font-weight:700; margin-bottom:10px; }
          .a-alert.ok { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
          .a-alert.error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }

          /* skeleton */
          .a-skeleton-grid { display:grid; gap:16px; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); }
          @media (max-width: 900px){ .a-skeleton-grid { grid-template-columns: 1fr; } }
          .a-skel { height: 220px; border-radius: 20px; background: linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6); background-size: 200% 100%; animation: sh 1.2s linear infinite; }
          .a-skel-lg { height: 280px; }
          @keyframes sh { 0% {background-position: 200% 0;} 100% {background-position: -200% 0;} }
        `}</style>
      </main>
    </div>
  );
}
