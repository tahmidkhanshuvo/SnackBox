import React, { useEffect, useMemo, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient, { put } from "../../api/api.js";

/* ---------- Config & Helpers ---------- */
const currency = (n) => (typeof n === "number" ? `৳${n.toFixed(2)}` : "—");
const DEFAULT_IMAGE = "https://via.placeholder.com/80x80.png?text=No+Image";

/* ---------- Icons (shortened for brevity) ---------- */
const Icon = {
  Search: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Next: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Prev: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>,
  Edit: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

/* ---------- UI Atoms (reusable components) ---------- */
function IconBtn({ kind="ghost", title, onClick, disabled=false, children }) {
  const base = { width: 34, height: 34, minWidth: 34, borderRadius: 999, display: "grid", placeItems: "center", border: "1px solid transparent", cursor: "pointer", transition: "transform .12s ease" };
  const map = { primary: { ...base, background:"#22c55e", borderColor:"#22c55e", color:"#fff", boxShadow:"0 4px 12px -6px rgba(34,197,94,.7)" }, danger: { ...base, background:"#fee2e2", borderColor:"#fecaca", color:"#991b1b" }, outline: { ...base, background:"#fff", borderColor:"#e5e7eb", color:"#065f46" }, ghost: { ...base, background:"#f1f5f9", borderColor:"#e2e8f0", color:"#0f172a" } };
  const style = { ...map[kind], opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return ( <button style={style} onClick={onClick} title={title} disabled={disabled} onMouseDown={(e)=>{ e.currentTarget.style.transform="scale(.98)"; }} onMouseUp={(e)=>{ e.currentTarget.style.transform="scale(1)"; }}>{children}</button> );
}

function PrimaryBtn({ onClick, disabled=false, children, type="button" }) {
  const style = { padding:"8px 16px", background:"#16a34a", color:"#fff", border:0, borderRadius:999, display:"inline-flex", alignItems:"center", gap:8, fontWeight:900, cursor:"pointer", opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return ( <button type={type} style={style} onClick={onClick} disabled={disabled}>{children}</button> );
}

// ✅ NEW: Toggle switch component for availability
function ToggleSwitch({ enabled, onChange }) {
  const baseStyle = { width: 44, height: 24, borderRadius: 999, padding: 2, cursor: 'pointer', transition: 'background-color 0.2s ease' };
  const knobStyle = { width: 20, height: 20, borderRadius: 999, background: 'white', display: 'block', transition: 'transform 0.2s ease' };
  
  const containerStyle = { ...baseStyle, background: enabled ? '#16a34a' : '#d1d5db' };
  const knobTransform = { ...knobStyle, transform: enabled ? 'translateX(20px)' : 'translateX(0)' };
  
  return (
    <button type="button" role="switch" aria-checked={enabled} onClick={onChange} style={containerStyle}>
      <span style={knobTransform} />
    </button>
  );
}

/* ---------- Page Component ---------- */
export default function StaffMenu() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    fetchItems();
  }, [page, debouncedQ]);

  async function fetchItems() {
    setLoading(true);
    setError("");
    try {
      const params = { per_page: 10, page };
      if (debouncedQ.trim()) params.q = debouncedQ.trim();
      const { data } = await apiClient.get("/api/menu-items", { params });
      setItems(data?.data ?? []);
      setMeta(data?.meta ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  }
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await apiClient.delete(`/api/menu-items/${id}`);
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete item.");
    }
  }

  // ✅ NEW: Handler for the availability toggle
  const handleToggleAvailability = async (itemToToggle) => {
    // Optimistic UI update for instant feedback
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === itemToToggle.id ? { ...item, availability: !item.availability } : item
      )
    );
    
    // API call to persist the change
    try {
      await put(`/api/menu-items/${itemToToggle.id}`, { availability: !itemToToggle.availability });
    } catch (err) {
      alert("Failed to update availability. Please try again.");
      // Revert UI on failure
      setItems(currentItems => 
        currentItems.map(item => 
          item.id === itemToToggle.id ? { ...item, availability: !item.availability } : item
        )
      );
    }
  }

  return (
    <StaffLayout title="Menu Items">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ position:"relative", flexGrow:1, maxWidth:300 }}>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name…" style={{ padding:"8px 32px 8px 30px", width:"100%", borderRadius:10, border:"1px solid #e5e7eb", outline:"none" }} />
          <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", opacity:.65 }}><Icon.Search/></span>
        </div>
        <PrimaryBtn onClick={() => handleOpenModal(null)}><Icon.Plus/> Add New Item</PrimaryBtn>
      </div>

      <div style={{ border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#fff" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {/* ✅ CHANGE: Added "Available" column */}
                {["Item", "Price", "Stock", "Available", ""].map(h=>(<th key={h} style={{ padding:10, textAlign:"left", fontSize:12, color:"#6b7280", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({length:5}).map((_,i)=><Sk key={i}/>)}
              {!loading && items.length === 0 && (<tr><td colSpan={5} style={{ padding:24, textAlign:"center", color:"#64748b" }}>No menu items found.</td></tr>)}
              {!loading && items.map(item => (
                <tr key={item.id} style={{ borderTop:"1px solid #eef2f7" }}>
                  <td style={{ padding:10, display:"flex", alignItems:"center", gap:12 }}>
                    <img src={item.image_url || DEFAULT_IMAGE} alt={item.name} width={48} height={48} style={{ borderRadius:8, objectFit:"cover" }} />
                    <span style={{ fontWeight:800 }}>{item.name}</span>
                  </td>
                  <td style={{ padding:10, fontWeight:700 }}>{currency(item.price)}</td>
                  <td style={{ padding:10, color: (item.stock < 10 ? '#ef4444' : 'inherit') }}>{item.stock ?? "N/A"}</td>
                  {/* ✅ NEW: Render the ToggleSwitch in its own column */}
                  <td style={{ padding:10 }}>
                    <ToggleSwitch enabled={item.availability} onChange={() => handleToggleAvailability(item)} />
                  </td>
                  <td style={{ padding:8, whiteSpace:"nowrap" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <IconBtn kind="ghost" onClick={() => handleOpenModal(item)} title="Edit Item"><Icon.Edit/></IconBtn>
                      <IconBtn kind="danger" onClick={() => handleDelete(item.id)} title="Delete Item"><Icon.Trash/></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta && (<div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:12, color:"#6b7280" }}>Page {meta.current_page} of {meta.last_page}</div><div style={{ display:"flex", gap:6 }}><IconBtn kind="outline" onClick={()=>setPage(p=>p-1)} disabled={meta.current_page <= 1 || loading} title="Previous"><Icon.Prev/></IconBtn><IconBtn kind="outline" onClick={()=>setPage(p=>p+1)} disabled={meta.current_page >= meta.last_page || loading} title="Next"><Icon.Next/></IconBtn></div></div>)}
      {isModalOpen && <ItemModal item={editingItem} onClose={handleCloseModal} onSave={() => { fetchItems(); handleCloseModal(); }} />}
      {error && <div style={{ marginTop:10, padding:10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>{error}</div>}
    </StaffLayout>
  );
}

/* ---------- Create/Edit Modal Component ---------- */
function ItemModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    item_name: item?.name || "",
    price: item?.price || "",
    // ✅ REMOVED: Stock is no longer editable here
    category: item?.category || "",
    description: item?.description || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    
    const submissionData = new FormData();
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }
    if (imageFile) {
      submissionData.append('image', imageFile);
    }
    
    try {
      if (item) {
        submissionData.append('_method', 'PUT');
        await apiClient.post(`/api/menu-items/${item.id}`, submissionData);
      } else {
        await apiClient.post('/api/menu-items', submissionData);
      }
      onSave();
    } catch (err) {
      setFormError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontWeight: 700, marginBottom: 4, display: "block", fontSize: 14 };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div style={{ background: "white", padding: 24, borderRadius: 16, width: "100%", maxWidth: 500, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: 0, cursor: "pointer", padding: 4 }}><Icon.X/></button>
        <h3 style={{ marginTop: 0, marginBottom: 20 }}>{item ? "Edit Menu Item" : "Create New Menu Item"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="item_name">Item Name</label>
            <input style={inputStyle} type="text" id="item_name" name="item_name" value={formData.item_name} onChange={handleInputChange} required />
          </div>
          {/* ✅ CHANGE: Removed Stock and made Price full width */}
          <div>
            <label style={labelStyle} htmlFor="price">Price</label>
            <input style={inputStyle} type="number" step="0.01" id="price" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>
          <div><label style={labelStyle} htmlFor="category">Category</label><input style={inputStyle} type="text" id="category" name="category" value={formData.category} onChange={handleInputChange} /></div>
          <div><label style={labelStyle} htmlFor="description">Description</label><textarea style={{ ...inputStyle, minHeight: 80, fontFamily:"inherit" }} id="description" name="description" value={formData.description} onChange={handleInputChange} /></div>
          <div>
            <label style={labelStyle} htmlFor="image">Image</label>
            <input style={{...inputStyle, border:"none", padding:0}} type="file" id="image" name="image" onChange={(e) => setImageFile(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
            <span style={{fontSize:12, color:"#6b7280"}}>Leave blank to keep existing image when editing.</span>
          </div>
          {formError && <div style={{ padding: 10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius: 10 }}>{formError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <PrimaryBtn type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Item"}</PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- compact skeleton for loading ---------- */
function Sk(){
  return (
    <tr style={{ borderTop:"1px solid #eef2f7" }}>
      {/* ✅ CHANGE: Skeleton now has 5 columns */}
      {Array.from({length:5}).map((_,i)=>(<td key={i} style={{ padding:10 }}><div style={{ height: i===0 ? 48 : 12, width: '80%', background:"#eef2f7", borderRadius: i===0 ? 8 : 999 }} /></td>))}
    </tr>
  );
}

/* ---------- Debounce Hook for search input ---------- */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}