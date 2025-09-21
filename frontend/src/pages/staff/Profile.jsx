// src/pages/staff/Profile.jsx
import React, { useEffect, useState } from "react";
import apiClient, { patch as apiPatch } from "../../api/api";
import StaffLayout from "./StaffLayout"; // Added import for StaffLayout

export default function Profile({ goHome, onUserUpdated, seedUser }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // which URL worked for /me (auth/me vs me)
  const [profileUrl, setProfileUrl] = useState("/api/auth/me");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
  });

  // avatar
  const [avatarUrl, setAvatarUrl] = useState("");     // from backend
  const [avatarPreview, setAvatarPreview] = useState(""); // local preview
  const [avatarFile, setAvatarFile] = useState(null);     // File

  // helper to normalize user payloads
  const pickUser = (data) => (data?.user ?? data?.data ?? data ?? {});
  const fillFromUser = (u) => {
    setForm((f) => ({
      ...f,
      name: u?.name ?? "",
      email: u?.email ?? "",
      phone: u?.phone ?? "",
      position: u?.position ?? "",
      password: "",
    }));
    setAvatarUrl(u?.avatar_url || u?.photo_url || "");
  };

  // load current user (prefer fresh fetch; fallback to seedUser)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // try /api/auth/me first, then /api/me
        try {
          const { data } = await apiClient.get("/api/auth/me");
          if (!alive) return;
          fillFromUser(pickUser(data));
          setProfileUrl("/api/auth/me");
        } catch {
          const { data } = await apiClient.get("/api/me");
          if (!alive) return;
          fillFromUser(pickUser(data));
          setProfileUrl("/api/me");
        }
      } catch {
        if (seedUser) {
          fillFromUser(seedUser);
        } else {
          setError("Unable to load your staff profile.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedUser?.id]);

  useEffect(() => {
    // cleanup preview URL on unmount/change
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file."); return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError("Image is larger than 2MB."); return;
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
      let resp;
      if (avatarFile) {
        // multipart when changing photo
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("phone", form.phone);
        fd.append("position", form.position);
        fd.append("avatar", avatarFile); // backend should accept 'avatar'
        if (form.password) {
          fd.append("password", form.password);
        }
        resp = await apiPatch(profileUrl, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // JSON when no photo change
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          position: form.position,
        };
        if (form.password) {
          payload.password = form.password;
        }
        resp = await apiPatch(profileUrl, payload);
      }

      const user = pickUser(resp?.data);
      setOk("Staff profile updated.");
      setForm((f) => ({ ...f, password: "" }));
      setAvatarUrl(user?.avatar_url || user?.photo_url || avatarUrl);
      onUserUpdated?.(user);
      clearImage();
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed.";
      const v = err?.response?.data?.errors;
      setError(v ? Object.values(v).flat().join(" ") : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffLayout title="Profile" goto={goHome}>
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
                  src={avatarPreview || avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Staff"}
                  alt="Staff Avatar"
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
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="Optional" />
              </div>
              <div className="a-field">
                <label>Position</label>
                <input name="position" value={form.position} onChange={onChange} required />
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
          background: linear-gradient(90deg, var(--sb-green-500), #fb923c);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .a-hero { display:grid; gap:10px; margin-bottom: 18px; }
        .a-hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          font-weight:800; font-size:.8rem;
          padding:6px 10px; border-radius:999px;
          background: var(--sb-green-100); color: var(--sb-green-600);
          width:max-content;
        }
        .a-hero-title { margin:0; font-weight:900; font-size:clamp(1.4rem, 3vw, 2rem); color: #0f172a; }
        .a-hero-sub { margin:0; color: var(--sb-muted); font-weight:700; }

        .a-grid {
          display:grid; gap:16px;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        }
        @media (max-width: 900px){ .a-grid { grid-template-columns: 1fr; } }

        .a-card {
          background: var(--sb-surface);
          border: 1px solid var(--sb-border);
          border-radius: 20px;
          box-shadow: var(--sb-shadow);
          padding: 16px;
        }
        .a-card-glass {
          background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.9));
          backdrop-filter: blur(6px) saturate(1.2);
        }
        .a-card-title { margin: 0 0 12px; font-size: 1.05rem; font-weight: 900; color: #0f172a; }

        .a-avatar-wrap { display:grid; place-items:center; margin: 6px 0 12px; }
        .a-avatar-ring {
          padding:6px; border-radius:999px;
          background: conic-gradient(from 180deg, var(--sb-green-500), #fb923c, var(--sb-green-500));
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
        label { font-weight:800; color: #0f172a; }
        input, textarea {
          border:1px solid var(--sb-border); border-radius: 12px; padding: 10px;
          background: var(--sb-surface); font: inherit; outline:none;
        }
        input:focus, textarea:focus { box-shadow: 0 0 0 3px rgba(22,163,74,.2); border-color: var(--sb-green-500); }

        .a-actions { display:flex; gap:10px; justify-content:flex-end; margin-top: 12px; }

        .a-btn {
          font-weight:900; border-radius:12px; padding:10px 14px; cursor:pointer; border:none;
        }
        .a-btn.primary {
          background: linear-gradient(90deg, var(--sb-green-500), #fb923c);
          color:#fff; box-shadow: 0 8px 20px rgba(251,146,60,.35);
        }
        .a-btn.soft {
          background: var(--sb-green-100); color: var(--sb-green-600);
          border: 1px solid rgba(22,163,74,.2);
        }
        .a-btn.ghost {
          background: var(--sb-surface); color: #0f172a;
          border:1px solid var(--sb-border);
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
    </StaffLayout>
  );
}