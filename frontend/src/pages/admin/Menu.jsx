// src/pages/admin/Menu.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import apiClient, { listMenuItems, del, post, put } from "../../api/api";

export default function AdminMenu() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // create/edit form (simple)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "" });
  const [imgFile, setImgFile] = useState(null);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      // admin endpoint returns full list; fallback to public list
      const data =
        await apiClient.get("/api/admin/menu-items").then((r) => r.data)
          .catch(async () => (await listMenuItems()).items);
      setRows(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const view = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      String(r.name || r.title || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", price: "", description: "", category: "" });
    setImgFile(null);
  };

  const openNew = () => { resetForm(); setFormOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name ?? row.title ?? "",
      price: row.price ?? "",
      description: row.description ?? "",
      category: row.category ?? "",
    });
    setImgFile(null);
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      // Minimal payload that matches most standard MenuItem store/update
      const payload = {
        name: form.name,
        price: Number(form.price || 0),
        description: form.description,
        category: form.category,
      };

      let created = null;
      if (editing?.id) {
        await put(`/api/menu-items/${editing.id}`, payload);
        created = { id: editing.id };
      } else {
        const { data } = await post("/api/menu-items", payload);
        created = data?.data ?? data ?? null;
      }

      if (created?.id && imgFile) {
        const fd = new FormData();
        fd.append("image", imgFile);
        await apiClient.post(`/api/menu-items/${created.id}/image`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        }).catch(() => {}); // image upload optional
      }

      setFormOpen(false);
      resetForm();
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || e.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await del(`/api/menu-items/${id}`);
      setRows((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <AdminLayout title="Menu">
      <style>{`
        .bar{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
        .inp{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;border-radius:10px;min-width:260px}
        .btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer}
        .btn:hover{background:rgba(255,255,255,.12)}
        .grid{display:grid;gap:12px}
        @media(min-width:980px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        .card{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
        .meta{opacity:.85}
        .tag{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);font-weight:800}
        .dlg{position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:50}
        .panel{width:min(520px,92vw);background:rgba(2,6,23,.9);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px}
        .row{display:grid;gap:6px;margin-bottom:10px}
        .label{opacity:.9;font-weight:800}
        .input,.ta,.sel{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;border-radius:10px}
        .err{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:10px;border-radius:10px;margin-bottom:12px}
      `}</style>

      {msg ? <div className="err">{msg}</div> : null}

      <div className="bar">
        <input className="inp" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" onClick={load}>Refresh</button>
        <button className="btn" onClick={openNew}>New Item</button>
      </div>

      {loading ? (
        <div className="card adm-skel" style={{ height: 64 }} />
      ) : view.length === 0 ? (
        <div className="card" style={{ justifyContent: "center" }}>No items.</div>
      ) : (
        <div className="grid">
          {view.map((m) => (
            <div key={m.id} className="card">
              <div style={{ display: "grid" }}>
                <strong>{m.name ?? m.title ?? "Unnamed"}</strong>
                <div className="meta" style={{ fontSize: 13 }}>
                  {m.category ? <span className="tag" style={{ marginRight: 8 }}>{m.category}</span> : null}
                  {m.price != null ? <>Price: <strong>${Number(m.price).toFixed(2)}</strong></> : null}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => openEdit(m)}>Edit</button>
                <button className="btn" onClick={() => remove(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="dlg" onClick={() => setFormOpen(false)}>
          <form className="panel" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3 style={{ marginTop: 0, marginBottom: 12, fontWeight: 900 }}>{editing ? "Edit Item" : "New Item"}</h3>
            <div className="row">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="row">
              <label className="label">Price</label>
              <input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            </div>
            <div className="row">
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="row">
              <label className="label">Description</label>
              <textarea className="ta" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="row">
              <label className="label">Image (optional)</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="btn">{editing ? "Save" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
